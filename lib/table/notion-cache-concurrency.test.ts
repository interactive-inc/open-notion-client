import { notionBlockList } from "@/testing/notion-block-list"
import { expect, test } from "vite-plus/test"
import { NotionTable } from "@/table/notion-table"
import { NotionMemoryCache } from "@/table/notion-memory-cache"
import { NotionHttpMock } from "@/testing/notion-http-mock"
import { notionPage } from "@/testing/notion-page"
import { notionParagraph } from "@/testing/notion-paragraph"

test("更新前に始まった取得が後から完了しても新しいページキャッシュを上書きしない", async () => {
  const http = new NotionHttpMock()
  const cache = new NotionMemoryCache()
  const table = new NotionTable({
    client: http.client,
    dataSourceId: "source-1",
    properties: { title: { type: "title" } },
    cache,
  })
  const gate = Promise.withResolvers<void>()
  http.enqueue(
    {
      method: "GET",
      path: "/pages/page-1",
      response: notionPage("page-1", "Old"),
      waitFor: gate.promise,
    },
    { method: "PATCH", path: "/pages/page-1", response: notionPage("page-1", "New") },
  )
  const pending = table.findById("page-1")
  try {
    await table.update("page-1", { properties: { title: "New" } })
  } finally {
    gate.resolve()
  }
  await pending
  expect(cache.getPage("page-1")?.properties).toEqual(notionPage("page-1", "New").properties)
})

test("clearCache前に始まった本文取得が古い本文を再登録しない", async () => {
  const http = new NotionHttpMock()
  const cache = new NotionMemoryCache()
  const table = new NotionTable({
    client: http.client,
    dataSourceId: "source-1",
    properties: {},
    cache,
  })
  cache.setPage("page-1", notionPage())
  const page = await table.findById("page-1")
  if (!page) throw new Error("Missing page")
  const gate = Promise.withResolvers<void>()
  http.enqueue({
    method: "GET",
    path: "/blocks/page-1/children",
    response: notionBlockList([notionParagraph()]),
    waitFor: gate.promise,
  })
  const pending = page.body()
  table.clearCache()
  gate.resolve()
  await pending
  expect(cache.getBlocks("page-1")).toBeNull()
})

test("cacheの入出力を変更しても保存済みスナップショットが書き換わらない", () => {
  const cache = new NotionMemoryCache()
  const page = notionPage()
  const blocks = [notionParagraph()]
  cache.setPage("page-1", page)
  cache.setBlocks("page-1", blocks)
  page.archived = true
  blocks.length = 0
  const cached = cache.getPage("page-1")
  if (!cached) throw new Error("Missing cached page")
  cached.archived = true
  cache.getBlocks("page-1")?.pop()
  expect(cache.getPage("page-1")?.archived).toBe(false)
  expect(cache.getBlocks("page-1")).toHaveLength(1)
})
