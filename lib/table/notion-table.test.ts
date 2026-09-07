import { expect, test } from "vite-plus/test"
import { NotionMarkdown } from "@/table/notion-markdown"
import { NotionTable } from "@/table/notion-table"
import { NotionHttpMock } from "@/testing/notion-http-mock"
import { notionList } from "@/testing/notion-list"
import { notionPage } from "@/testing/notion-page"
import type { NotionPropertySchema } from "@/types"

const schema = {
  title: { type: "title" },
  status: { type: "select", options: ["todo", "in_progress", "done"] },
  priority: { type: "number" },
} satisfies NotionPropertySchema

function setup(markdown = new NotionMarkdown()) {
  const http = new NotionHttpMock()
  const table = new NotionTable({
    client: http.client,
    dataSourceId: "source-1",
    properties: schema,
    markdown,
  })
  return { http, table }
}

test("基本的な統合テスト", async () => {
  const context = setup()
  const page = notionPage("page-1", "タスク1")
  page.properties.status = {
    id: "status",
    type: "select",
    select: { id: "todo", name: "todo", color: "default" },
  }
  page.properties.priority = { id: "priority", type: "number", number: 3 }
  const created = notionPage("page-new", "新規タスク")
  created.properties.status = page.properties.status
  context.http.enqueue(
    {
      method: "POST",
      path: "/data_sources/source-1/query",
      body: { page_size: 100 },
      response: notionList([page]),
    },
    {
      method: "POST",
      path: "/pages",
      body: {
        parent: { data_source_id: "source-1" },
        properties: {
          title: { title: [{ type: "text", text: { content: "新規タスク" } }] },
          status: { select: { name: "todo" } },
        },
        children: [],
      },
      response: created,
    },
    { method: "GET", path: "/pages/page-new", response: created },
  )
  const found = await context.table.findMany()
  expect(found.records.map((record) => record.properties())).toEqual([
    { title: "タスク1", status: "todo", priority: 3 },
  ])
  expect(found.hasMore).toBe(false)
  expect(found.nextCursor).toBeNull()
  expect(
    (
      await context.table.create({ properties: { title: "新規タスク", status: "todo" } })
    ).properties(),
  ).toEqual({
    title: "新規タスク",
    status: "todo",
    priority: null,
  })
})

test("高度なクエリのテスト", async () => {
  const context = setup()
  context.http.enqueue({
    method: "POST",
    path: "/data_sources/source-1/query",
    body: {
      page_size: 100,
      filter: {
        or: [
          { property: "status", select: { equals: "todo" } },
          { property: "priority", number: { greater_than_or_equal_to: 5 } },
        ],
      },
    },
    response: notionList([]),
  })
  expect(
    await context.table.findMany({
      where: { or: [{ status: "todo" }, { priority: { greater_than_or_equal_to: 5 } }] },
    }),
  ).toEqual({
    records: [],
    hasMore: false,
    nextCursor: null,
  })
})

test("findMany が limit オプションを正しく処理する", async () => {
  const context = setup()
  context.http.enqueue({
    method: "POST",
    path: "/data_sources/source-1/query",
    body: { page_size: 5 },
    response: notionList([notionPage()]),
  })
  expect((await context.table.findMany({ limit: 5 })).records).toHaveLength(1)
})

test("findMany が cursor オプションを正しく処理する", async () => {
  const context = setup()
  context.http.enqueue({
    method: "POST",
    path: "/data_sources/source-1/query",
    body: { page_size: 100, start_cursor: "cursor-1" },
    response: notionList([notionPage()]),
  })
  expect((await context.table.findMany({ cursor: "cursor-1" })).records).toHaveLength(1)
})

test("findMany がページネーション情報を返す", async () => {
  const context = setup()
  context.http.enqueue({
    method: "POST",
    path: "/data_sources/source-1/query",
    body: { page_size: 1 },
    response: notionList([notionPage()], "cursor-1"),
  })
  const found = await context.table.findMany({ limit: 1 })
  expect(found.records).toHaveLength(1)
  expect(found.hasMore).toBe(true)
  expect(found.nextCursor).toBe("cursor-1")
})

test("findMany でページネーションを跨いでレコードを取得する", async () => {
  const context = setup()
  context.http.enqueue(
    {
      method: "POST",
      path: "/data_sources/source-1/query",
      body: { page_size: 100 },
      response: notionList([notionPage("page-1")], "cursor-1"),
    },
    {
      method: "POST",
      path: "/data_sources/source-1/query",
      body: { page_size: 100, start_cursor: "cursor-1" },
      response: notionList([notionPage("page-2")]),
    },
  )
  expect((await context.table.findMany({ limit: 200 })).records.map((record) => record.id)).toEqual(
    ["page-1", "page-2"],
  )
})

test("findMany の cursor を使ったページ送り", async () => {
  const context = setup()
  context.http.enqueue(
    {
      method: "POST",
      path: "/data_sources/source-1/query",
      body: { page_size: 1 },
      response: notionList([notionPage("page-1", "タスク1")], "cursor-1"),
    },
    {
      method: "POST",
      path: "/data_sources/source-1/query",
      body: { page_size: 1, start_cursor: "cursor-1" },
      response: notionList([notionPage("page-2", "タスク2")]),
    },
  )
  const first = await context.table.findMany({ limit: 1 })
  expect(first.records[0]?.properties().title).toBe("タスク1")
  const second = await context.table.findMany({ limit: 1, cursor: first.nextCursor ?? undefined })
  expect(second.records[0]?.properties().title).toBe("タスク2")
  expect(second.hasMore).toBe(false)
  expect(second.nextCursor).toBeNull()
})

test("NotionMarkdownとの統合", async () => {
  const context = setup(new NotionMarkdown({ heading_1: "heading_2", heading_2: "heading_3" }))
  context.http.enqueue(
    {
      method: "POST",
      path: "/pages",
      body: {
        parent: { data_source_id: "source-1" },
        properties: {},
        children: [
          expect.objectContaining({ type: "heading_2", heading_2: expect.any(Object) }),
          expect.objectContaining({ type: "paragraph", paragraph: expect.any(Object) }),
          expect.objectContaining({ type: "heading_3", heading_3: expect.any(Object) }),
        ],
      },
      response: notionPage(),
    },
    { method: "GET", path: "/pages/page-1", response: notionPage() },
  )
  await context.table.create({ properties: {}, body: "# Title\n\nParagraph\n\n## Subtitle" })
})

test("エンハンサーなしのデフォルト動作", async () => {
  const context = setup()
  context.http.enqueue(
    {
      method: "POST",
      path: "/pages",
      body: {
        parent: { data_source_id: "source-1" },
        properties: {},
        children: [expect.objectContaining({ type: "heading_1", heading_1: expect.any(Object) })],
      },
      response: notionPage(),
    },
    { method: "GET", path: "/pages/page-1", response: notionPage() },
  )
  await context.table.create({ properties: {}, body: "# Title" })
})
