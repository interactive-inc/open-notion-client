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

test("safe.findByIdはエラー時にErrorを返す", async () => {
  const mockClient = {
    pages: {
      retrieve: async () => {
        throw new Error("network error")
      },
    },
  } as unknown as Client

  const schema: NotionPropertySchema = { title: { type: "title" } }

  const table = new NotionTable({
    client: mockClient,
    dataSourceId: "ds",
    properties: schema,
    retry: { maxRetries: 0 },
  })

  const result = await table.safe.findById("x")

  expect(result instanceof Error).toBe(true)
  expect((result as Error).message).toBe("network error")
})

test("safe.createはエラー時にErrorを返す", async () => {
  const mockClient = {
    pages: {
      create: async () => {
        throw new Error("rate limited")
      },
    },
  } as unknown as Client

  const schema: NotionPropertySchema = { title: { type: "title" } }

  const table = new NotionTable({
    client: mockClient,
    dataSourceId: "ds",
    properties: schema,
    retry: { maxRetries: 0 },
  })

  const result = await table.safe.create({ properties: { title: "T" } })

  expect(result instanceof Error).toBe(true)
})

test("safe.findByIdは成功時に値を返す", async () => {
  const mockClient = {
    pages: {
      retrieve: async () =>
        makePage("page-1", {
          title: { type: "title", title: [{ plain_text: "T" }] },
        }),
    },
  } as unknown as Client

  const schema: NotionPropertySchema = { title: { type: "title" } }

  const table = new NotionTable({
    client: mockClient,
    dataSourceId: "ds",
    properties: schema,
  })

  const result = await table.safe.findById("page-1")

  expect(result instanceof Error).toBe(false)
  expect(result).not.toBeNull()
})
