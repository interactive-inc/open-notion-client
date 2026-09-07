import { notionBlockList } from "@/testing/notion-block-list"
import { expect, test } from "vite-plus/test"
import { NotionTable } from "@/table/notion-table"
import { NotionMemoryCache } from "@/table/notion-memory-cache"
import { NotionHttpMock } from "@/testing/notion-http-mock"
import { notionList } from "@/testing/notion-list"
import { notionPage } from "@/testing/notion-page"
import { notionParagraph } from "@/testing/notion-paragraph"
import { toNotionBlocks } from "@/to-notion-block/to-notion-blocks"
import type { NotionPropertySchema } from "@/types"

const schema = { title: { type: "title" } } satisfies NotionPropertySchema

function setup() {
  const http = new NotionHttpMock()
  const cache = new NotionMemoryCache()
  const table = new NotionTable({
    client: http.client,
    dataSourceId: "source-1",
    properties: schema,
    cache,
    retry: { maxRetries: 2, baseDelayMs: 0 },
  })
  return { http, cache, table }
}

test("SDKを通してfilter・sort・cursor・page_sizeを送信する", async () => {
  const context = setup()
  context.http.enqueue({
    method: "POST",
    path: "/data_sources/source-1/query",
    body: {
      filter: { property: "title", title: { contains: "needle" } },
      sorts: [{ property: "title", direction: "ascending" }],
      start_cursor: "cursor-1",
      page_size: 1,
    },
    response: notionList([notionPage()], "cursor-2"),
  })
  const found = await context.table.findMany({
    where: { title: { contains: "needle" } },
    sorts: { field: "title", direction: "asc" },
    cursor: "cursor-1",
    limit: 1,
  })
  expect(found.records.map((record) => record.properties())).toEqual([{ title: "Title" }])
  expect(found.nextCursor).toBe("cursor-2")
  expect(found.hasMore).toBe(true)
})

test("0件指定の検索と一括更新は通信も更新もしない", async () => {
  const context = setup()
  expect(await context.table.findMany({ limit: 0 })).toEqual({
    records: [],
    hasMore: false,
    nextCursor: null,
  })
  expect(await context.table.updateMany({ limit: 0, update: { properties: {} } })).toEqual({
    succeeded: [],
    failed: [],
  })
  expect(context.http.fetch).not.toHaveBeenCalled()
})

test.each([-1, 0.5, 1.5, NaN, Infinity, -Infinity])(
  "不正なlimit %s は通信前に拒否する",
  async (limit) => {
    const context = setup()
    await expect(context.table.findMany({ limit })).rejects.toThrow("limit")
    await expect(context.table.updateMany({ limit, update: { properties: {} } })).rejects.toThrow(
      "limit",
    )
    expect(context.http.fetch).not.toHaveBeenCalled()
  },
)

test.each([404, 401, 403, 400])(
  "HTTP %s はSDKのエラーとして扱い、不要な再試行をしない",
  async (status) => {
    const context = setup()
    context.http.enqueue({
      method: "GET",
      path: "/pages/page-1",
      status,
      response: {
        object: "error",
        status,
        code: status === 404 ? "object_not_found" : "unauthorized",
        message: "denied",
      },
    })
    const found = await context.table.safe.findById("page-1")
    if (status === 404) expect(found).toBeNull()
    else expect(found).toBeInstanceOf(Error)
    expect(context.http.fetch).toHaveBeenCalledTimes(1)
  },
)

test.each([429, 529, 500, 503])("取得時のHTTP %s は再試行してキャッシュする", async (status) => {
  const context = setup()
  context.http.enqueue(
    {
      method: "GET",
      path: "/pages/page-1",
      status,
      headers: { "retry-after": "0" },
      response: { object: "error", status, code: "rate_limited", message: "retry" },
    },
    { method: "GET", path: "/pages/page-1", response: notionPage() },
  )
  expect((await context.table.findById("page-1"))?.id).toBe("page-1")
  expect((await context.table.findById("page-1"))?.id).toBe("page-1")
  expect(context.http.fetch).toHaveBeenCalledTimes(2)
})

test.each([500, 503])("作成時のHTTP %s は重複防止のため自動再試行しない", async (status) => {
  const context = setup()
  context.http.enqueue({
    method: "POST",
    path: "/pages",
    status,
    body: { parent: { data_source_id: "source-1" }, properties: {}, children: [] },
    response: {
      object: "error",
      status,
      code: "internal_server_error",
      message: "ambiguous write",
    },
  })
  await expect(context.table.create({ properties: {} })).rejects.toThrow("ambiguous write")
  expect(context.http.fetch).toHaveBeenCalledTimes(1)
})

test("本文追記失敗時は元の本文を削除せず、古いページと本文のキャッシュを破棄する", async () => {
  const context = setup()
  context.cache.setPage("page-1", notionPage("page-1", "Old"))
  context.cache.setBlocks("page-1", [notionParagraph("old-block", "Old body")])
  context.http.enqueue(
    { method: "PATCH", path: "/pages/page-1", response: notionPage("page-1", "New") },
    {
      method: "GET",
      path: "/blocks/page-1/children",
      response: notionBlockList([notionParagraph("old-block")]),
    },
    {
      method: "PATCH",
      path: "/blocks/page-1/children",
      status: 503,
      body: { children: toNotionBlocks("New body") },
      response: {
        object: "error",
        status: 503,
        code: "service_unavailable",
        message: "append failed",
      },
    },
  )
  await expect(
    context.table.update("page-1", { properties: { title: "New" }, body: "New body" }),
  ).rejects.toThrow("append failed")
  expect(context.cache.getPage("page-1")).toBeNull()
  expect(context.cache.getBlocks("page-1")).toBeNull()
  expect(context.http.fetch).toHaveBeenCalledTimes(3)
})

test("本文の全ページを列挙し、新本文の追記成功後に旧ブロックだけを削除する", async () => {
  const context = setup()
  context.http.enqueue(
    { method: "PATCH", path: "/pages/page-1", response: notionPage() },
    {
      method: "GET",
      path: "/blocks/page-1/children",
      response: notionBlockList([notionParagraph("old-1")], "cursor-1"),
    },
    {
      method: "GET",
      path: "/blocks/page-1/children?start_cursor=cursor-1",
      response: notionBlockList([notionParagraph("old-2")]),
    },
    {
      method: "PATCH",
      path: "/blocks/page-1/children",
      response: notionBlockList([notionParagraph("new-1")]),
    },
    { method: "DELETE", path: "/blocks/old-1", response: notionParagraph("old-1") },
    { method: "DELETE", path: "/blocks/old-2", response: notionParagraph("old-2") },
  )
  await context.table.update("page-1", { properties: {}, body: "New body" })
  expect(context.http.fetch).toHaveBeenCalledTimes(6)
})

test.each([null, "", "  \n\n  "])("body %j は旧本文を消去し空のappendを送らない", async (body) => {
  const context = setup()
  context.http.enqueue(
    { method: "PATCH", path: "/pages/page-1", response: notionPage() },
    {
      method: "GET",
      path: "/blocks/page-1/children",
      response: notionBlockList([notionParagraph("old-1")]),
    },
    { method: "DELETE", path: "/blocks/old-1", response: notionParagraph("old-1") },
  )
  await context.table.update("page-1", { properties: {}, body })
})

test("body未指定の更新は本文APIを呼ばない", async () => {
  const context = setup()
  context.http.enqueue({ method: "PATCH", path: "/pages/page-1", response: notionPage() })
  await context.table.update("page-1", { properties: {} })
  expect(context.http.fetch).toHaveBeenCalledTimes(1)
})

test("繰り返すcursorを検出して一括削除前に失敗する", async () => {
  const context = setup()
  context.http.enqueue(
    { method: "POST", path: "/data_sources/source-1/query", response: notionList([], "loop") },
    { method: "POST", path: "/data_sources/source-1/query", response: notionList([], "loop") },
  )
  await expect(context.table.deleteMany()).rejects.toThrow(/cursor/i)
  expect(context.http.fetch).toHaveBeenCalledTimes(2)
})

test("has_moreなのにcursorがない応答は完全な結果として返さない", async () => {
  const context = setup()
  context.http.enqueue({
    method: "POST",
    path: "/data_sources/source-1/query",
    response: { ...notionList([notionPage()]), has_more: true },
  })
  await expect(context.table.findMany()).rejects.toThrow(/cursor/i)
})

test("不完全なクエリ結果を全件取得として扱わず、一括更新前に失敗する", async () => {
  const context = setup()
  context.http.enqueue({
    method: "POST",
    path: "/data_sources/source-1/query",
    response: {
      ...notionList([notionPage()]),
      request_status: { type: "incomplete", incomplete_reason: "query_result_limit_reached" },
    },
  })
  await expect(context.table.updateMany({ update: { properties: {} } })).rejects.toThrow(
    /incomplete/i,
  )
})

test("不完全なページ応答を黙って捨てて全件更新しない", async () => {
  const context = setup()
  context.http.enqueue({
    method: "POST",
    path: "/data_sources/source-1/query",
    response: notionList([{ object: "page", id: "partial-page" }]),
  })
  await expect(context.table.updateMany({ update: { properties: {} } })).rejects.toThrow(
    /partial page/i,
  )
  expect(context.http.fetch).toHaveBeenCalledTimes(1)
})

test.each([
  "a".repeat(200001),
  `| Header |\n| --- |\n${"| Row |\n".repeat(100)}`,
  `$$${"x".repeat(1001)}$$`,
])("分割できない本文の制限違反は既存データを変更する前に拒否する", async (body) => {
  const context = setup()
  await expect(
    context.table.update("page-1", { properties: { title: "New" }, body }),
  ).rejects.toThrow(/Notion limit/)
  await expect(context.table.create({ properties: { title: "New" }, body })).rejects.toThrow(
    /Notion limit/,
  )
  expect(context.http.fetch).not.toHaveBeenCalled()
})

test.each([429, 529])("作成時でも明示的な一時拒否 HTTP %s は再試行する", async (status) => {
  const context = setup()
  context.http.enqueue(
    {
      method: "POST",
      path: "/pages",
      status,
      headers: { "retry-after": "0" },
      response: {
        object: "error",
        status,
        code: status === 429 ? "rate_limited" : "service_overload",
        message: "retry later",
      },
    },
    { method: "POST", path: "/pages", response: notionPage() },
    { method: "GET", path: "/pages/page-1", response: notionPage() },
  )
  expect((await context.table.create({ properties: {} })).id).toBe("page-1")
  expect(context.http.fetch).toHaveBeenCalledTimes(3)
})

test("本文取得は親子それぞれのページネーションを通り、キャッシュから再利用できる", async () => {
  const context = setup()
  context.http.enqueue(
    { method: "GET", path: "/pages/page-1", response: notionPage() },
    {
      method: "GET",
      path: "/blocks/page-1/children",
      response: notionBlockList(
        [{ ...notionParagraph("parent", "Parent"), has_children: true }],
        "root-cursor",
      ),
    },
    {
      method: "GET",
      path: "/blocks/page-1/children?start_cursor=root-cursor",
      response: notionBlockList([notionParagraph("last", "Last")]),
    },
    {
      method: "GET",
      path: "/blocks/parent/children",
      response: notionBlockList([notionParagraph("child-1", "Child 1")], "child-cursor"),
    },
    {
      method: "GET",
      path: "/blocks/parent/children?start_cursor=child-cursor",
      response: notionBlockList([notionParagraph("child-2", "Child 2")]),
    },
  )
  const page = await context.table.findById("page-1")
  if (!page) throw new Error("Missing page")
  await page.body()
  await page.body()
  expect(context.http.fetch).toHaveBeenCalledTimes(5)
  expect(context.cache.getBlocks("page-1")?.[0]?.children.map((block) => block.id)).toEqual([
    "child-1",
    "child-2",
  ])
})

test("アーカイブと復元でページと本文のキャッシュを無効にする", async () => {
  const context = setup()
  context.cache.setPage("page-1", notionPage())
  context.cache.setBlocks("page-1", [notionParagraph()])
  context.http.enqueue(
    {
      method: "PATCH",
      path: "/pages/page-1",
      body: { archived: true },
      response: { ...notionPage(), archived: true, in_trash: true },
    },
    { method: "PATCH", path: "/pages/page-1", body: { archived: false }, response: notionPage() },
  )
  await context.table.delete("page-1")
  expect(context.cache.getPage("page-1")).toBeNull()
  expect(context.cache.getBlocks("page-1")).toBeNull()
  expect((await context.table.restore("page-1")).isArchived).toBe(false)
  expect(context.cache.getPage("page-1")?.archived).toBe(false)
})

test.each([{ title: null }, { title: undefined }, { or: [] }, { and: [{}] }])(
  "実効条件のないwhere %j で全件を誤更新しない",
  async (where) => {
    const context = setup()
    await expect(context.table.updateMany({ where, update: { properties: {} } })).rejects.toThrow(
      "effective filter",
    )
    await expect(context.table.deleteMany(where)).rejects.toThrow("effective filter")
    await expect(
      context.table.upsert({ where, create: { properties: {} }, update: { properties: {} } }),
    ).rejects.toThrow("effective filter")
    expect(context.http.fetch).not.toHaveBeenCalled()
  },
)

test("本文の2チャンク目が失敗しても旧本文の削除を開始しない", async () => {
  const context = setup()
  context.cache.setBlocks("page-1", [notionParagraph("old", "Original")])
  context.http.enqueue(
    { method: "PATCH", path: "/pages/page-1", response: notionPage() },
    {
      method: "GET",
      path: "/blocks/page-1/children",
      response: notionBlockList([notionParagraph("old")]),
    },
    {
      method: "PATCH",
      path: "/blocks/page-1/children",
      response: notionBlockList([notionParagraph("added")]),
    },
    {
      method: "PATCH",
      path: "/blocks/page-1/children",
      status: 400,
      response: {
        object: "error",
        status: 400,
        code: "validation_error",
        message: "second chunk failed",
      },
    },
  )
  const body = Array.from({ length: 101 }, (_, index) => `paragraph ${index}`).join("\n\n")
  await expect(context.table.update("page-1", { properties: {}, body })).rejects.toThrow(
    "second chunk failed",
  )
  expect(context.cache.getPage("page-1")).toBeNull()
  expect(context.cache.getBlocks("page-1")).toBeNull()
  expect(context.http.fetch).toHaveBeenCalledTimes(4)
})

test("旧本文の削除途中の失敗でもキャッシュから成功前の値を返さない", async () => {
  const context = setup()
  context.cache.setBlocks("page-1", [notionParagraph("old-1"), notionParagraph("old-2")])
  context.http.enqueue(
    { method: "PATCH", path: "/pages/page-1", response: notionPage() },
    {
      method: "GET",
      path: "/blocks/page-1/children",
      response: notionBlockList([notionParagraph("old-1"), notionParagraph("old-2")]),
    },
    {
      method: "PATCH",
      path: "/blocks/page-1/children",
      response: notionBlockList([notionParagraph("added")]),
    },
    { method: "DELETE", path: "/blocks/old-1", response: notionParagraph("old-1") },
    {
      method: "DELETE",
      path: "/blocks/old-2",
      status: 400,
      response: {
        object: "error",
        status: 400,
        code: "validation_error",
        message: "delete failed",
      },
    },
  )
  await expect(context.table.update("page-1", { properties: {}, body: "New" })).rejects.toThrow(
    "delete failed",
  )
  expect(context.cache.getPage("page-1")).toBeNull()
  expect(context.cache.getBlocks("page-1")).toBeNull()
})
