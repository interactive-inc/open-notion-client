import { notionBlockList } from "@/testing/notion-block-list"
import { expect, test } from "vite-plus/test"
import { NotionTable } from "@/table/notion-table"
import { NotionHttpMock } from "@/testing/notion-http-mock"
import { notionList } from "@/testing/notion-list"
import { notionPage } from "@/testing/notion-page"
import type { NotionPropertySchema } from "@/types"

const schema = { title: { type: "title" } } satisfies NotionPropertySchema

function setup() {
  const http = new NotionHttpMock()
  const table = new NotionTable({
    client: http.client,
    dataSourceId: "source-1",
    properties: schema,
    retry: { maxRetries: 0 },
  })
  return { http, table }
}

function apiError(message: string, code = "validation_error") {
  return { object: "error", status: 400, code, message }
}

function titleRequest(title: string) {
  return { title: { title: [{ type: "text", text: { content: title } }] } }
}

function paragraphRequests(start: number, length: number) {
  return Array.from({ length }, (_, index) => ({
    type: "paragraph",
    paragraph: {
      rich_text: [
        {
          type: "text",
          text: { content: `paragraph ${start + index}` },
          plain_text: `paragraph ${start + index}`,
          annotations: {},
        },
      ],
    },
  }))
}

test("findByIdはNotionのobject_not_foundでnullを返す", async () => {
  const context = setup()
  context.http.enqueue({
    method: "GET",
    path: "/pages/missing",
    status: 404,
    response: apiError("not found", "object_not_found"),
  })
  expect(await context.table.findById("missing")).toBeNull()
})

test("findByIdは404以外のエラーはそのままthrow", async () => {
  const context = setup()
  context.http.enqueue({
    method: "GET",
    path: "/pages/page-1",
    status: 401,
    response: apiError("auth failed", "unauthorized"),
  })
  await expect(context.table.findById("page-1")).rejects.toThrow("auth failed")
})

test("upsertはcreateフィールドを使い、存在しないときは新規作成", async () => {
  const context = setup()
  context.http.enqueue(
    {
      method: "POST",
      path: "/data_sources/source-1/query",
      body: { page_size: 1, filter: { property: "title", title: { equals: "X" } } },
      response: notionList([]),
    },
    {
      method: "POST",
      path: "/pages",
      body: { parent: { data_source_id: "source-1" }, properties: titleRequest("X"), children: [] },
      response: notionPage("page-new", "X"),
    },
    { method: "GET", path: "/pages/page-new", response: notionPage("page-new", "X") },
  )
  const page = await context.table.upsert({
    where: { title: "X" },
    create: { properties: { title: "X" } },
    update: { properties: { title: "Y" } },
  })
  expect(page.id).toBe("page-new")
  expect(page.properties().title).toBe("X")
})

test("upsertは既存があればupdateを使う", async () => {
  const context = setup()
  context.http.enqueue(
    {
      method: "POST",
      path: "/data_sources/source-1/query",
      response: notionList([notionPage("existing", "X")]),
    },
    {
      method: "PATCH",
      path: "/pages/existing",
      body: { properties: titleRequest("Y") },
      response: notionPage("existing", "Y"),
    },
  )
  const page = await context.table.upsert({
    where: { title: "X" },
    create: { properties: { title: "X" } },
    update: { properties: { title: "Y" } },
  })
  expect(page.id).toBe("existing")
  expect(page.properties().title).toBe("Y")
})

test("createManyは部分失敗を入力に対応づけて集計する", async () => {
  const context = setup()
  context.http.enqueue(
    { method: "POST", path: "/pages", response: notionPage("page-1", "A") },
    { method: "POST", path: "/pages", status: 400, response: apiError("invalid B") },
    { method: "POST", path: "/pages", response: notionPage("page-3", "C") },
    { method: "GET", path: "/pages/page-1", response: notionPage("page-1", "A") },
    { method: "GET", path: "/pages/page-3", response: notionPage("page-3", "C") },
  )
  const result = await context.table.createMany([
    { properties: { title: "A" } },
    { properties: { title: "B" } },
    { properties: { title: "C" } },
  ])
  expect(result.succeeded.map((page) => [page.id, page.properties().title])).toEqual([
    ["page-1", "A"],
    ["page-3", "C"],
  ])
  expect(result.failed).toHaveLength(1)
  expect(result.failed[0]?.data).toEqual({ properties: { title: "B" } })
  expect(result.failed[0]?.error.message).toBe("invalid B")
})

test("findOneは内部呼び出し時にcursorを引きずらない", async () => {
  const context = setup()
  context.http.enqueue({
    method: "POST",
    path: "/data_sources/source-1/query",
    body: { page_size: 1, filter: { property: "title", title: { equals: "X" } } },
    response: notionList([]),
  })
  expect(await context.table.findOne({ where: { title: "X" } })).toBeNull()
})

test("statusプロパティのcreateはstatusキーで送られる", async () => {
  const http = new NotionHttpMock()
  const table = new NotionTable({
    client: http.client,
    dataSourceId: "source-1",
    properties: { ...schema, state: { type: "status", options: ["todo", "done"] } },
  })
  http.enqueue(
    {
      method: "POST",
      path: "/pages",
      body: {
        parent: { data_source_id: "source-1" },
        properties: { ...titleRequest("T"), state: { status: { name: "todo" } } },
        children: [],
      },
      response: notionPage(),
    },
    { method: "GET", path: "/pages/page-1", response: notionPage() },
  )
  await table.create({ properties: { title: "T", state: "todo" } })
})

test("updateManyは部分失敗を集計する", async () => {
  const context = setup()
  context.http.enqueue(
    {
      method: "POST",
      path: "/data_sources/source-1/query",
      response: notionList([notionPage("page-1"), notionPage("page-2"), notionPage("page-3")]),
    },
    {
      method: "PATCH",
      path: "/pages/page-1",
      body: { properties: titleRequest("Updated") },
      response: notionPage("page-1", "Updated"),
    },
    { method: "PATCH", path: "/pages/page-2", status: 400, response: apiError("update failed") },
    {
      method: "PATCH",
      path: "/pages/page-3",
      body: { properties: titleRequest("Updated") },
      response: notionPage("page-3", "Updated"),
    },
  )
  const result = await context.table.updateMany({ update: { properties: { title: "Updated" } } })
  expect(result.succeeded.map((page) => page.id)).toEqual(["page-1", "page-3"])
  expect(result.failed).toHaveLength(1)
  expect(result.failed[0]?.error.message).toBe("update failed")
  expect(result.succeeded.every((page) => page.properties().title === "Updated")).toBe(true)
})

test("deleteManyは部分失敗を集計する", async () => {
  const context = setup()
  context.http.enqueue(
    {
      method: "POST",
      path: "/data_sources/source-1/query",
      response: notionList([notionPage("page-1"), notionPage("page-2"), notionPage("page-3")]),
    },
    {
      method: "PATCH",
      path: "/pages/page-1",
      body: { archived: true },
      response: notionPage("page-1"),
    },
    { method: "PATCH", path: "/pages/page-2", status: 400, response: apiError("delete failed") },
    {
      method: "PATCH",
      path: "/pages/page-3",
      body: { archived: true },
      response: notionPage("page-3"),
    },
  )
  const result = await context.table.deleteMany()
  expect(result.succeeded).toEqual(["page-1", "page-3"])
  expect(result.failed).toHaveLength(1)
  expect(result.failed[0]?.data).toBe("page-2")
  expect(result.failed[0]?.error.message).toBe("delete failed")
})

test("updateManyは全成功時にfailedが空", async () => {
  const context = setup()
  context.http.enqueue(
    { method: "POST", path: "/data_sources/source-1/query", response: notionList([notionPage()]) },
    { method: "PATCH", path: "/pages/page-1", response: notionPage("page-1", "Updated") },
  )
  const result = await context.table.updateMany({ update: { properties: { title: "Updated" } } })
  expect(result.succeeded).toHaveLength(1)
  expect(result.failed).toEqual([])
})

test("findManyはlimit到達時に超過取得せずnextCursorが欠落なく続きを指す", async () => {
  const context = setup()
  const pages = Array.from({ length: 200 }, (_, index) => notionPage(`page-${index}`))
  context.http.enqueue(
    {
      method: "POST",
      path: "/data_sources/source-1/query",
      body: { page_size: 100 },
      response: notionList(pages.slice(0, 100), "100"),
    },
    {
      method: "POST",
      path: "/data_sources/source-1/query",
      body: { page_size: 50, start_cursor: "100" },
      response: notionList(pages.slice(100, 150), "150"),
    },
    {
      method: "POST",
      path: "/data_sources/source-1/query",
      body: { page_size: 100, start_cursor: "150" },
      response: notionList(pages.slice(150)),
    },
  )
  const first = await context.table.findMany({ limit: 150 })
  expect(first.records).toHaveLength(150)
  expect(first.hasMore).toBe(true)
  expect(first.nextCursor).toBe("150")
  const second = await context.table.findMany({ cursor: first.nextCursor ?? undefined })
  expect(second.hasMore).toBe(false)
  expect(second.nextCursor).toBeNull()
  expect([...first.records, ...second.records].map((page) => page.id)).toEqual(
    pages.map((page) => page.id),
  )
})

for (const operation of ["update", "delete"]) {
  test(`${operation}Manyは1024件を超えるマッチも全件処理する`, async () => {
    const context = setup()
    const pages = Array.from({ length: 1100 }, (_, index) => notionPage(`page-${index}`))
    for (let offset = 0; offset < 1000; offset += 100) {
      context.http.enqueue({
        method: "POST",
        path: "/data_sources/source-1/query",
        body: { page_size: 100, start_cursor: offset === 0 ? undefined : String(offset) },
        response: notionList(pages.slice(offset, offset + 100), String(offset + 100)),
      })
    }
    context.http.enqueue(
      {
        method: "POST",
        path: "/data_sources/source-1/query",
        body: { page_size: 24, start_cursor: "1000" },
        response: notionList(pages.slice(1000, 1024), "1024"),
      },
      {
        method: "POST",
        path: "/data_sources/source-1/query",
        body: { page_size: 100, start_cursor: "1024" },
        response: notionList(pages.slice(1024)),
      },
    )
    for (const page of pages)
      context.http.enqueue({
        method: "PATCH",
        path: `/pages/${page.id}`,
        body: operation === "update" ? { properties: {} } : { archived: true },
        response: page,
      })
    const result =
      operation === "update"
        ? await context.table.updateMany({ update: { properties: {} } })
        : await context.table.deleteMany()
    expect(result.succeeded).toHaveLength(1100)
    expect(result.failed).toEqual([])
    expect(
      new Set(result.succeeded.map((page) => (typeof page === "string" ? page : page.id))),
    ).toEqual(new Set(pages.map((page) => page.id)))
  })
}

test("updateManyはlimit指定時にその件数までしか処理しない", async () => {
  const context = setup()
  const pages = Array.from({ length: 4 }, (_, index) => notionPage(`page-${index}`))
  context.http.enqueue({
    method: "POST",
    path: "/data_sources/source-1/query",
    body: { page_size: 4 },
    response: notionList(pages, "4"),
  })
  for (const page of pages)
    context.http.enqueue({ method: "PATCH", path: `/pages/${page.id}`, response: page })
  expect(
    (await context.table.updateMany({ limit: 4, update: { properties: {} } })).succeeded,
  ).toHaveLength(4)
})

test("createは100個超のchildrenを分割して追加する", async () => {
  const context = setup()
  context.http.enqueue(
    {
      method: "POST",
      path: "/pages",
      body: {
        parent: { data_source_id: "source-1" },
        properties: {},
        children: paragraphRequests(0, 100),
      },
      response: notionPage(),
    },
    {
      method: "PATCH",
      path: "/blocks/page-1/children",
      body: { children: paragraphRequests(100, 100) },
      response: notionBlockList([]),
    },
    {
      method: "PATCH",
      path: "/blocks/page-1/children",
      body: { children: paragraphRequests(200, 50) },
      response: notionBlockList([]),
    },
    { method: "GET", path: "/pages/page-1", response: notionPage() },
  )
  await context.table.create({
    properties: {},
    body: Array.from({ length: 250 }, (_, index) => `paragraph ${index}`).join("\n\n"),
  })
})

test("updateは100個超の本文ブロックを分割して追加する", async () => {
  const context = setup()
  context.http.enqueue(
    { method: "PATCH", path: "/pages/page-1", response: notionPage() },
    { method: "GET", path: "/blocks/page-1/children", response: notionBlockList([]) },
    {
      method: "PATCH",
      path: "/blocks/page-1/children",
      body: { children: paragraphRequests(0, 100) },
      response: notionBlockList([]),
    },
    {
      method: "PATCH",
      path: "/blocks/page-1/children",
      body: { children: paragraphRequests(100, 100) },
      response: notionBlockList([]),
    },
    {
      method: "PATCH",
      path: "/blocks/page-1/children",
      body: { children: paragraphRequests(200, 50) },
      response: notionBlockList([]),
    },
  )
  await context.table.update("page-1", {
    properties: {},
    body: Array.from({ length: 250 }, (_, index) => `paragraph ${index}`).join("\n\n"),
  })
})

test("created_time等の読み取り専用プロパティはNotionに送られない", async () => {
  const http = new NotionHttpMock()
  const table = new NotionTable({
    client: http.client,
    dataSourceId: "source-1",
    properties: { ...schema, createdAt: { type: "created_time" } },
  })
  http.enqueue(
    {
      method: "POST",
      path: "/pages",
      body: { parent: { data_source_id: "source-1" }, properties: titleRequest("T"), children: [] },
      response: notionPage(),
    },
    { method: "GET", path: "/pages/page-1", response: notionPage() },
  )
  await table.create({ properties: { title: "T", createdAt: "2026-01-01T00:00:00Z" } })
})
