import { expect, test } from "bun:test"
import type { Client } from "@notionhq/client"
import type { NotionPropertySchema } from "@/types"
import { NotionTable } from "./notion-table"

function makePage(id: string, properties: Record<string, unknown> = {}) {
  return {
    id: id,
    object: "page",
    created_time: "2024-01-01T00:00:00Z",
    last_edited_time: "2024-01-01T00:00:00Z",
    archived: false,
    properties: properties,
    url: `https://notion.so/${id}`,
    parent: { type: "data_source_id", data_source_id: "ds" },
  }
}

test("findByIdはNotionのobject_not_foundでnullを返す", async () => {
  const mockClient = {
    pages: {
      retrieve: async () => {
        const err = new Error("not found") as Error & { code: string }
        err.code = "object_not_found"
        throw err
      },
    },
  } as unknown as Client

  const schema: NotionPropertySchema = { title: { type: "title" } }

  const table = new NotionTable({
    client: mockClient,
    dataSourceId: "ds",
    properties: schema,
  })

  const result = await table.findById("missing")
  expect(result).toBeNull()
})

test("findByIdは404以外のエラーはそのままthrow", async () => {
  const mockClient = {
    pages: {
      retrieve: async () => {
        throw new Error("auth failed")
      },
    },
  } as unknown as Client

  const schema: NotionPropertySchema = { title: { type: "title" } }

  const table = new NotionTable({
    client: mockClient,
    dataSourceId: "ds",
    properties: schema,
  })

  expect(table.findById("x")).rejects.toThrow("auth failed")
})

test("upsertはcreateフィールドを使い、存在しないときは新規作成", async () => {
  let createCalled = false

  const mockClient = {
    dataSources: {
      query: async () => ({ results: [], next_cursor: null, has_more: false }),
    },
    pages: {
      create: async (params: { properties: Record<string, unknown> }) => {
        createCalled = true
        return makePage("page-new", params.properties)
      },
      retrieve: async () =>
        makePage("page-new", {
          title: { type: "title", title: [{ plain_text: "X" }] },
        }),
    },
  } as unknown as Client

  const schema = {
    title: { type: "title" as const },
  } satisfies NotionPropertySchema

  const table = new NotionTable({
    client: mockClient,
    dataSourceId: "ds",
    properties: schema,
  })

  await table.upsert({
    where: { title: "X" },
    create: { properties: { title: "X" } },
    update: { properties: { title: "X" } },
  })

  expect(createCalled).toBe(true)
})

test("upsertは既存があればupdateを使う", async () => {
  const observed: { updatedId: string | null } = { updatedId: null }

  const mockClient = {
    dataSources: {
      query: async () => ({
        results: [
          makePage("page-existing", {
            title: { type: "title", title: [{ plain_text: "X" }] },
          }),
        ],
        next_cursor: null,
        has_more: false,
      }),
    },
    pages: {
      update: async (params: { page_id: string }) => {
        observed.updatedId = params.page_id
        return makePage(params.page_id, {
          title: { type: "title", title: [{ plain_text: "Y" }] },
        })
      },
    },
  } as unknown as Client

  const schema = {
    title: { type: "title" as const },
  } satisfies NotionPropertySchema

  const table = new NotionTable({
    client: mockClient,
    dataSourceId: "ds",
    properties: schema,
  })

  await table.upsert({
    where: { title: "X" },
    create: { properties: { title: "X" } },
    update: { properties: { title: "Y" } },
  })

  expect(observed.updatedId).toBe("page-existing")
})

test("createManyは部分失敗を集計する", async () => {
  let calls = 0
  const mockClient = {
    dataSources: {
      query: async () => ({ results: [], next_cursor: null, has_more: false }),
    },
    pages: {
      create: async (params: { properties: Record<string, unknown> }) => {
        calls++
        if (calls === 2) {
          throw new Error("rate limited")
        }
        return makePage(`page-${calls}`, params.properties)
      },
      retrieve: async () =>
        makePage("page-1", {
          title: { type: "title", title: [{ plain_text: "T" }] },
        }),
    },
  } as unknown as Client

  const schema = {
    title: { type: "title" as const },
  } satisfies NotionPropertySchema

  const table = new NotionTable({
    client: mockClient,
    dataSourceId: "ds",
    properties: schema,
  })

  const result = await table.createMany([
    { properties: { title: "A" } },
    { properties: { title: "B" } },
    { properties: { title: "C" } },
  ])

  expect(result.succeeded).toHaveLength(2)
  expect(result.failed).toHaveLength(1)
  expect(result.failed[0]?.error.message).toBe("rate limited")
})

test("findOneは内部呼び出し時にcursorを引きずらない", async () => {
  let observedCursor: string | undefined

  const mockClient = {
    dataSources: {
      query: async (params: { start_cursor?: string }) => {
        observedCursor = params.start_cursor
        return { results: [], next_cursor: null, has_more: false }
      },
    },
  } as unknown as Client

  const schema = {
    title: { type: "title" as const },
  } satisfies NotionPropertySchema

  const table = new NotionTable({
    client: mockClient,
    dataSourceId: "ds",
    properties: schema,
  })

  await table.findOne({ where: { title: "X" } })

  expect(observedCursor).toBeUndefined()
})

test("statusプロパティのcreateはstatusキーで送られる", async () => {
  let observedProperties: Record<string, unknown> | undefined

  const mockClient = {
    pages: {
      create: async (params: { properties: Record<string, unknown> }) => {
        observedProperties = params.properties
        return makePage("page-1", params.properties)
      },
      retrieve: async () =>
        makePage("page-1", {
          title: { type: "title", title: [{ plain_text: "T" }] },
        }),
    },
  } as unknown as Client

  const schema = {
    title: { type: "title" as const },
    state: { type: "status" as const, options: ["todo", "done"] },
  } satisfies NotionPropertySchema

  const table = new NotionTable({
    client: mockClient,
    dataSourceId: "ds",
    properties: schema,
  })

  await table.create({
    properties: { title: "T", state: "todo" },
  })

  expect(observedProperties?.state).toEqual({ status: { name: "todo" } })
})

test("updateManyは部分失敗を集計する", async () => {
  let updateCalls = 0

  const mockClient = {
    dataSources: {
      query: async () => ({
        results: [
          makePage("page-1", {
            title: { type: "title", title: [{ plain_text: "A" }] },
          }),
          makePage("page-2", {
            title: { type: "title", title: [{ plain_text: "B" }] },
          }),
          makePage("page-3", {
            title: { type: "title", title: [{ plain_text: "C" }] },
          }),
        ],
        next_cursor: null,
        has_more: false,
      }),
    },
    pages: {
      update: async (params: { page_id: string }) => {
        updateCalls++
        if (params.page_id === "page-2") {
          throw new Error("update failed")
        }
        return makePage(params.page_id, {
          title: { type: "title", title: [{ plain_text: "Updated" }] },
        })
      },
    },
  } as unknown as Client

  const schema = {
    title: { type: "title" as const },
  } satisfies NotionPropertySchema

  const table = new NotionTable({
    client: mockClient,
    dataSourceId: "ds",
    properties: schema,
  })

  const result = await table.updateMany({
    update: { properties: { title: "Updated" } },
  })

  expect(result.succeeded).toHaveLength(2)
  expect(result.failed).toHaveLength(1)
  expect(result.failed[0]?.error.message).toBe("update failed")
  expect(updateCalls).toBe(3)
})

test("deleteManyは部分失敗を集計する", async () => {
  let deleteCalls = 0

  const mockClient = {
    dataSources: {
      query: async () => ({
        results: [makePage("page-1", {}), makePage("page-2", {}), makePage("page-3", {})],
        next_cursor: null,
        has_more: false,
      }),
    },
    pages: {
      update: async (params: { page_id: string; archived: boolean }) => {
        deleteCalls++
        if (params.page_id === "page-2") {
          throw new Error("delete failed")
        }
        return makePage(params.page_id, {})
      },
    },
  } as unknown as Client

  const schema = {
    title: { type: "title" as const },
  } satisfies NotionPropertySchema

  const table = new NotionTable({
    client: mockClient,
    dataSourceId: "ds",
    properties: schema,
  })

  const result = await table.deleteMany()

  expect(result.succeeded).toHaveLength(2)
  expect(result.succeeded).toContain("page-1")
  expect(result.succeeded).toContain("page-3")
  expect(result.failed).toHaveLength(1)
  expect(result.failed[0]?.data).toBe("page-2")
  expect(result.failed[0]?.error.message).toBe("delete failed")
  expect(deleteCalls).toBe(3)
})

test("updateManyは全成功時にfailedが空", async () => {
  const mockClient = {
    dataSources: {
      query: async () => ({
        results: [
          makePage("page-1", {
            title: { type: "title", title: [{ plain_text: "A" }] },
          }),
        ],
        next_cursor: null,
        has_more: false,
      }),
    },
    pages: {
      update: async (params: { page_id: string }) =>
        makePage(params.page_id, {
          title: { type: "title", title: [{ plain_text: "Updated" }] },
        }),
    },
  } as unknown as Client

  const schema = {
    title: { type: "title" as const },
  } satisfies NotionPropertySchema

  const table = new NotionTable({
    client: mockClient,
    dataSourceId: "ds",
    properties: schema,
  })

  const result = await table.updateMany({
    update: { properties: { title: "Updated" } },
  })

  expect(result.succeeded).toHaveLength(1)
  expect(result.failed).toHaveLength(0)
})

test("created_time等の読み取り専用プロパティはNotionに送られない", async () => {
  let observedProperties: Record<string, unknown> | undefined

  const mockClient = {
    pages: {
      create: async (params: { properties: Record<string, unknown> }) => {
        observedProperties = params.properties
        return makePage("page-1", params.properties)
      },
      retrieve: async () =>
        makePage("page-1", {
          title: { type: "title", title: [{ plain_text: "T" }] },
        }),
    },
  } as unknown as Client

  const schema = {
    title: { type: "title" as const },
    createdAt: { type: "created_time" as const },
  } satisfies NotionPropertySchema

  const table = new NotionTable({
    client: mockClient,
    dataSourceId: "ds",
    properties: schema,
  })

  await table.create({
    properties: { title: "T", createdAt: "2024-01-01T00:00:00Z" },
  })

  expect(observedProperties?.title).toBeDefined()
  expect(observedProperties?.createdAt).toBeUndefined()
})
