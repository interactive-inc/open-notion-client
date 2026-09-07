import { expect, test, vi } from "vite-plus/test"
import { NotionPageReference } from "@/modules/notion-page-reference"
import { NotionPropertyConverter } from "@/table/notion-property-converter"
import { NotionHttpMock } from "@/testing/notion-http-mock"
import { notionPage } from "@/testing/notion-page"
import { notionParagraph } from "@/testing/notion-paragraph"
import { notionBlockList } from "@/testing/notion-block-list"
import { withRetry } from "@/retry"
import type { NotionPropertySchema } from "@/types"

const schema = { title: { type: "title" } } satisfies NotionPropertySchema

test("プロパティを取得できる", () => {
  const http = new NotionHttpMock()
  const page = notionPage("page-1", "Test Page")
  page.properties.score = { id: "score", type: "number", number: 100 }
  const reference = new NotionPageReference({
    client: http.client,
    schema: { ...schema, score: { type: "number" } },
    converter: new NotionPropertyConverter(),
    notionPage: page,
  })
  expect(reference.properties()).toEqual({ title: "Test Page", score: 100 })
})

test("元のNotionページデータとメタデータを取得できる", () => {
  const http = new NotionHttpMock()
  const page = notionPage()
  const reference = new NotionPageReference({
    client: http.client,
    schema,
    converter: new NotionPropertyConverter(),
    notionPage: page,
  })
  expect(reference.raw()).toEqual(page)
  expect(reference.id).toBe(page.id)
  expect(reference.url).toBe(page.url)
  expect(reference.createdAt).toBe(page.created_time)
  expect(reference.updatedAt).toBe(page.last_edited_time)
  expect(reference.isArchived).toBe(false)
})

test("イミュータブルなオブジェクトである", () => {
  const http = new NotionHttpMock()
  const reference = new NotionPageReference({
    client: http.client,
    schema,
    converter: new NotionPropertyConverter(),
    notionPage: notionPage(),
  })
  expect(Object.isFrozen(reference)).toBe(true)
})

test("本文を実SDKから取得してマークダウン形式に変換できる", async () => {
  const http = new NotionHttpMock()
  http.enqueue({
    method: "GET",
    path: "/blocks/page-1/children",
    response: notionBlockList([notionParagraph("body", "本文")]),
  })
  const reference = new NotionPageReference({
    client: http.client,
    schema,
    converter: new NotionPropertyConverter(),
    notionPage: notionPage(),
  })
  expect(await reference.body()).toBe("本文")
})

test("body()は渡されたlistBlockChildrenを使う", async () => {
  const http = new NotionHttpMock()
  const listBlockChildren = vi.fn(async () =>
    notionBlockList([notionParagraph("body", "テストパラグラフ")]),
  )
  const reference = new NotionPageReference({
    client: http.client,
    schema,
    converter: new NotionPropertyConverter(),
    notionPage: notionPage(),
    listBlockChildren,
  })
  expect(await reference.body()).toBe("テストパラグラフ")
  expect(listBlockChildren).toHaveBeenCalledExactlyOnceWith({ block_id: "page-1" })
  expect(http.fetch).not.toHaveBeenCalled()
})

test("body()はリトライ済みlistBlockChildrenで429から回復する", async () => {
  const http = new NotionHttpMock()
  http.enqueue(
    {
      method: "GET",
      path: "/blocks/page-1/children",
      status: 429,
      headers: { "retry-after": "0" },
      response: { object: "error", status: 429, code: "rate_limited", message: "retry" },
    },
    {
      method: "GET",
      path: "/blocks/page-1/children",
      response: notionBlockList([notionParagraph("body", "リトライ後の本文")]),
    },
  )
  const reference = new NotionPageReference({
    client: http.client,
    schema,
    converter: new NotionPropertyConverter(),
    notionPage: notionPage(),
    listBlockChildren: (args) =>
      withRetry(() => http.client.blocks.children.list(args), { maxRetries: 1, baseDelayMs: 0 }),
  })
  expect(await reference.body()).toBe("リトライ後の本文")
  expect(http.fetch).toHaveBeenCalledTimes(2)
})

test("複数タイプのプロパティを実コンバーターで保持できる", () => {
  const http = new NotionHttpMock()
  const page = notionPage("page-1", "カスタムページ")
  page.properties.tags = {
    id: "tags",
    type: "multi_select",
    multi_select: [
      { id: "typescript", name: "TypeScript", color: "default" },
      { id: "notion", name: "Notion", color: "default" },
    ],
  }
  page.properties.isPublished = { id: "published", type: "checkbox", checkbox: true }
  page.properties.publishedAt = {
    id: "date",
    type: "date",
    date: { start: "2024-01-01", end: null, time_zone: null },
  }
  const reference = new NotionPageReference({
    client: http.client,
    schema: {
      ...schema,
      tags: { type: "multi_select", options: null },
      isPublished: { type: "checkbox" },
      publishedAt: { type: "date" },
    },
    converter: new NotionPropertyConverter(),
    notionPage: page,
  })
  expect(reference.properties()).toEqual({
    title: "カスタムページ",
    tags: ["TypeScript", "Notion"],
    isPublished: true,
    publishedAt: { start: "2024-01-01", end: null, timeZone: null },
  })
})
