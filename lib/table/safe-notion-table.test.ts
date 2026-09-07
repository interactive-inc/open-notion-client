import { expect, test } from "vite-plus/test"
import { NotionTable } from "@/table/notion-table"
import { NotionHttpMock } from "@/testing/notion-http-mock"
import { notionPage } from "@/testing/notion-page"
import type { SafeNotionTable } from "@/table/safe-notion-table"
import type { NotionPropertySchema } from "@/types"

const schema = { title: { type: "title" } } satisfies NotionPropertySchema

type Scenario = {
  name: string
  method: string
  path: string
  run: (safe: SafeNotionTable<typeof schema>) => Promise<unknown>
}

const scenarios: Scenario[] = [
  {
    name: "findMany",
    method: "POST",
    path: "/data_sources/source-1/query",
    run: (safe) => safe.findMany(),
  },
  {
    name: "findOne",
    method: "POST",
    path: "/data_sources/source-1/query",
    run: (safe) => safe.findOne(),
  },
  {
    name: "findById",
    method: "GET",
    path: "/pages/page-1",
    run: (safe) => safe.findById("page-1"),
  },
  {
    name: "create",
    method: "POST",
    path: "/pages",
    run: (safe) => safe.create({ properties: {} }),
  },
  {
    name: "update",
    method: "PATCH",
    path: "/pages/page-1",
    run: (safe) => safe.update("page-1", { properties: {} }),
  },
  {
    name: "updateMany",
    method: "POST",
    path: "/data_sources/source-1/query",
    run: (safe) => safe.updateMany({ update: { properties: {} } }),
  },
  {
    name: "upsert",
    method: "POST",
    path: "/data_sources/source-1/query",
    run: (safe) =>
      safe.upsert({
        where: { title: "A" },
        create: { properties: {} },
        update: { properties: {} },
      }),
  },
  { name: "delete", method: "PATCH", path: "/pages/page-1", run: (safe) => safe.delete("page-1") },
  {
    name: "deleteMany",
    method: "POST",
    path: "/data_sources/source-1/query",
    run: (safe) => safe.deleteMany(),
  },
  {
    name: "restore",
    method: "PATCH",
    path: "/pages/page-1",
    run: (safe) => safe.restore("page-1"),
  },
]

test.each(scenarios)("safe.$nameはSDKのエラーをError値として返す", async (scenario) => {
  const http = new NotionHttpMock()
  const table = new NotionTable({
    client: http.client,
    dataSourceId: "source-1",
    properties: schema,
    retry: { maxRetries: 0 },
  })
  http.enqueue({
    method: scenario.method,
    path: scenario.path,
    status: 401,
    response: { object: "error", status: 401, code: "unauthorized", message: "denied" },
  })
  const value = await scenario.run(table.safe)
  expect(value).toBeInstanceOf(Error)
  if (!(value instanceof Error)) throw new Error("Expected an Error value")
  expect(value.message).toBe("denied")
})

test("safe.createManyは各入力の失敗をBatchResult内に保持する", async () => {
  const http = new NotionHttpMock()
  const table = new NotionTable({
    client: http.client,
    dataSourceId: "source-1",
    properties: schema,
  })
  http.enqueue({
    method: "POST",
    path: "/pages",
    status: 400,
    response: { object: "error", status: 400, code: "validation_error", message: "invalid" },
  })
  const input = { properties: { title: "A" } }
  const value = await table.safe.createMany([input])
  if (value instanceof Error) throw value
  expect(value.succeeded).toEqual([])
  expect(value.failed).toHaveLength(1)
  expect(value.failed[0]?.data).toEqual(input)
  expect(value.failed[0]?.error.message).toBe("invalid")
})

test("safe.findByIdは成功時にページ参照を返す", async () => {
  const http = new NotionHttpMock()
  const table = new NotionTable({
    client: http.client,
    dataSourceId: "source-1",
    properties: schema,
  })
  http.enqueue({ method: "GET", path: "/pages/page-1", response: notionPage("page-1", "T") })
  const value = await table.safe.findById("page-1")
  if (!value || value instanceof Error) throw new Error("Expected a page reference")
  expect(value.id).toBe("page-1")
  expect(value.properties()).toEqual({ title: "T" })
})
