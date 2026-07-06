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

function makeTitlePage(id: string, text: string) {
  return makePage(id, {
    title: { type: "title", title: [{ plain_text: text }] },
  })
}

// page_sizeを尊重してオフセットベースのcursorでページ送りするモックを作る
function makePagingQuery(allPages: ReturnType<typeof makePage>[]) {
  const capturedPageSizes: number[] = []

  const query = async (params: { start_cursor?: string; page_size?: number }) => {
    const offset = params.start_cursor ? Number(params.start_cursor) : 0
    const pageSize = params.page_size ?? 100

    capturedPageSizes.push(pageSize)

    const results = allPages.slice(offset, offset + pageSize)
    const nextOffset = offset + results.length

    return {
      results: results,
      next_cursor: nextOffset < allPages.length ? String(nextOffset) : null,
      has_more: nextOffset < allPages.length,
    }
  }

  return { query, capturedPageSizes }
}

test("findManyはlimit到達時に超過取得せずnextCursorが欠落なく続きを指す", async () => {
  // DBちょうど200件でlimit:150の境界ケース
  const allPages = Array.from({ length: 200 }, (_, i) => makeTitlePage(`page-${i}`, `T${i}`))
  const paging = makePagingQuery(allPages)

  const mockClient = {
    dataSources: { query: paging.query },
  } as unknown as Client

  const schema = {
    title: { type: "title" as const },
  } satisfies NotionPropertySchema

  const table = new NotionTable({
    client: mockClient,
    dataSourceId: "ds",
    properties: schema,
  })

  const firstResult = await table.findMany({ limit: 150 })

  expect(firstResult.records).toHaveLength(150)
  expect(firstResult.records[149]?.id).toBe("page-149")
  // 最終フェッチは残り必要件数の50件だけ要求する
  expect(paging.capturedPageSizes).toEqual([100, 50])
  // hasMore: true なのに nextCursor: null にならない
  expect(firstResult.hasMore).toBe(true)
  expect(firstResult.nextCursor).not.toBeNull()

  // 続きをcursorで取得しても中間レコードがスキップされない
  const cursor = firstResult.nextCursor ?? undefined
  const secondResult = await table.findMany({ cursor })

  expect(secondResult.records).toHaveLength(50)
  expect(secondResult.records[0]?.id).toBe("page-150")
  expect(secondResult.records[49]?.id).toBe("page-199")
  expect(secondResult.hasMore).toBe(false)
  expect(secondResult.nextCursor).toBeNull()
})

test("updateManyは1024件を超えるマッチも全件処理する", async () => {
  const allPages = Array.from({ length: 1100 }, (_, i) => makeTitlePage(`page-${i}`, `T${i}`))
  const paging = makePagingQuery(allPages)

  const updatedIds = new Set<string>()

  const mockClient = {
    dataSources: { query: paging.query },
    pages: {
      update: async (params: { page_id: string }) => {
        updatedIds.add(params.page_id)
        return makeTitlePage(params.page_id, "Updated")
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

  expect(result.succeeded).toHaveLength(1100)
  expect(result.failed).toHaveLength(0)
  expect(updatedIds.size).toBe(1100)
  expect(updatedIds.has("page-1099")).toBe(true)
})

test("deleteManyは1024件を超えるマッチも全件アーカイブする", async () => {
  const allPages = Array.from({ length: 1100 }, (_, i) => makeTitlePage(`page-${i}`, `T${i}`))
  const paging = makePagingQuery(allPages)

  const archivedIds = new Set<string>()

  const mockClient = {
    dataSources: { query: paging.query },
    pages: {
      update: async (params: { page_id: string; archived: boolean }) => {
        archivedIds.add(params.page_id)
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

  expect(result.succeeded).toHaveLength(1100)
  expect(result.failed).toHaveLength(0)
  expect(archivedIds.has("page-1099")).toBe(true)
})

test("updateManyはlimit指定時にその件数までしか処理しない", async () => {
  const allPages = Array.from({ length: 10 }, (_, i) => makeTitlePage(`page-${i}`, `T${i}`))
  const paging = makePagingQuery(allPages)

  let updateCalls = 0

  const mockClient = {
    dataSources: { query: paging.query },
    pages: {
      update: async (params: { page_id: string }) => {
        updateCalls++
        return makeTitlePage(params.page_id, "Updated")
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
    limit: 4,
  })

  expect(result.succeeded).toHaveLength(4)
  expect(updateCalls).toBe(4)
})

test("createは100個超のchildrenを分割して追加する", async () => {
  let createChildrenCount = 0
  const appendedChunkSizes: number[] = []

  const mockClient = {
    pages: {
      create: async (params: { properties: Record<string, unknown>; children: unknown[] }) => {
        createChildrenCount = params.children.length
        return makeTitlePage("page-1", "T")
      },
      retrieve: async () => makeTitlePage("page-1", "T"),
    },
    blocks: {
      children: {
        append: async (params: { block_id: string; children: unknown[] }) => {
          appendedChunkSizes.push(params.children.length)
          return {}
        },
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

  const body = Array.from({ length: 250 }, (_, i) => `paragraph ${i}`).join("\n\n")

  await table.create({
    properties: { title: "T" },
    body: body,
  })

  // 作成時は最初の100個、残りは100個ずつappendされる
  expect(createChildrenCount).toBe(100)
  expect(appendedChunkSizes).toEqual([100, 50])
})

test("updateは100個超の本文ブロックを分割して追加する", async () => {
  const appendedChunkSizes: number[] = []

  const mockClient = {
    pages: {
      update: async (params: { page_id: string }) => makeTitlePage(params.page_id, "T"),
    },
    blocks: {
      children: {
        list: async () => ({ results: [], next_cursor: null, has_more: false }),
        append: async (params: { block_id: string; children: unknown[] }) => {
          appendedChunkSizes.push(params.children.length)
          return {}
        },
      },
      delete: async () => ({}),
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

  const body = Array.from({ length: 250 }, (_, i) => `paragraph ${i}`).join("\n\n")

  await table.update("page-1", {
    properties: {},
    body: body,
  })

  expect(appendedChunkSizes).toEqual([100, 100, 50])
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
