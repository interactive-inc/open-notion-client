import { expect, test } from "bun:test"
import type { Client } from "@notionhq/client"
import type {
  ListBlockChildrenParameters,
  ListBlockChildrenResponse,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints"
import { withRetry } from "../retry"
import type { NotionPropertyConverter } from "../table/notion-property-converter"
import type { NotionPropertySchema } from "../types"
import { NotionPageReference } from "./notion-page-reference"

function makeParagraphResponse(text: string): ListBlockChildrenResponse {
  return {
    object: "list",
    results: [
      {
        object: "block",
        id: "block-1",
        parent: { type: "page_id", page_id: "page-123" },
        created_time: "2024-01-01T00:00:00.000Z",
        last_edited_time: "2024-01-01T00:00:00.000Z",
        created_by: { object: "user", id: "user-1" },
        last_edited_by: { object: "user", id: "user-1" },
        has_children: false,
        archived: false,
        in_trash: false,
        type: "paragraph",
        paragraph: {
          rich_text: [
            {
              type: "text",
              text: { content: text, link: null },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: "default",
              },
              plain_text: text,
              href: null,
            },
          ],
          color: "default",
        },
      },
    ],
    next_cursor: null,
    has_more: false,
    type: "block",
    block: {},
  } as unknown as ListBlockChildrenResponse
}

test("プロパティを取得できる", () => {
  const mockSchema = {
    title: { type: "title" as const },
    score: { type: "number" as const },
  } satisfies NotionPropertySchema

  const mockPageData = {
    id: "page-123",
    properties: {
      title: { type: "title", title: [{ plain_text: "Test Page" }] },
      score: { type: "number", number: 100 },
    },
  } as unknown as PageObjectResponse

  const mockClient = {} as Client
  const mockConverter = {
    fromNotion: () => ({ title: "Test Page", score: 100 }),
    toNotion: () => ({}),
  } as unknown as NotionPropertyConverter

  const pageRef = new NotionPageReference({
    client: mockClient,
    schema: mockSchema,
    converter: mockConverter,
    notionPage: mockPageData,
  })

  const properties = pageRef.properties()
  expect(properties).toEqual({ title: "Test Page", score: 100 })
})

test("元のNotionページデータを取得できる", () => {
  const mockSchema = {
    title: { type: "title" as const },
  } satisfies NotionPropertySchema

  const mockPageData = {
    id: "page-123",
    created_time: "2024-01-01T00:00:00.000Z",
    last_edited_time: "2024-01-02T00:00:00.000Z",
    properties: {},
  } as unknown as PageObjectResponse

  const mockClient = {} as Client
  const mockConverter = {
    fromNotion: () => ({ title: "Test Page" }),
    toNotion: () => ({}),
  } as unknown as NotionPropertyConverter

  const pageRef = new NotionPageReference({
    client: mockClient,
    schema: mockSchema,
    converter: mockConverter,
    notionPage: mockPageData,
  })

  const raw = pageRef.raw()
  expect(raw).toEqual(mockPageData)
})

test("イミュータブルなオブジェクトである", () => {
  const mockSchema = {
    title: { type: "title" as const },
  } satisfies NotionPropertySchema

  const mockPageData = { id: "page-123", properties: {} } as PageObjectResponse
  const mockClient = {} as Client
  const mockConverter = {
    fromNotion: () => ({ title: "Test Page" }),
    toNotion: () => ({}),
  } as unknown as NotionPropertyConverter

  const pageRef = new NotionPageReference({
    client: mockClient,
    schema: mockSchema,
    converter: mockConverter,
    notionPage: mockPageData,
  })

  expect(Object.isFrozen(pageRef)).toBe(true)
})

test("本文をマークダウン形式で取得できる", async () => {
  const mockSchema = {
    title: { type: "title" as const },
  } satisfies NotionPropertySchema

  const mockPageData = { id: "page-123", properties: {} } as PageObjectResponse

  // NOTE: この機能は実際のNotion APIとenhance関数が必要なため、
  // 実装の詳細をテストではなく、メソッドが存在することのみ確認
  const mockClient = {} as Client
  const mockConverter = {
    fromNotion: () => ({ title: "Test Page" }),
    toNotion: () => ({}),
  } as unknown as NotionPropertyConverter

  const pageRef = new NotionPageReference({
    client: mockClient,
    schema: mockSchema,
    converter: mockConverter,
    notionPage: mockPageData,
  })

  // body()メソッドが存在することを確認
  expect(typeof pageRef.body).toBe("function")
})

test("body()は渡されたlistBlockChildrenを使う", async () => {
  const mockSchema = {
    title: { type: "title" as const },
  } satisfies NotionPropertySchema

  const mockPageData = { id: "page-123", properties: {} } as PageObjectResponse

  // clientは空オブジェクトのため、client経由で取得しようとすればthrowする
  const mockClient = {} as Client
  const mockConverter = {
    fromNotion: () => ({ title: "Test Page" }),
    toNotion: () => ({}),
  } as unknown as NotionPropertyConverter

  let callCount = 0

  const listBlockChildren = async (
    _args: ListBlockChildrenParameters,
  ): Promise<ListBlockChildrenResponse> => {
    callCount++
    return makeParagraphResponse("テストパラグラフ")
  }

  const pageRef = new NotionPageReference({
    client: mockClient,
    schema: mockSchema,
    converter: mockConverter,
    notionPage: mockPageData,
    listBlockChildren: listBlockChildren,
  })

  const body = await pageRef.body()

  expect(callCount).toBe(1)
  expect(body).toContain("テストパラグラフ")
})

test("body()はリトライ済みlistBlockChildrenで429から回復する", async () => {
  const mockSchema = {
    title: { type: "title" as const },
  } satisfies NotionPropertySchema

  const mockPageData = { id: "page-123", properties: {} } as PageObjectResponse

  const mockClient = {} as Client
  const mockConverter = {
    fromNotion: () => ({ title: "Test Page" }),
    toNotion: () => ({}),
  } as unknown as NotionPropertyConverter

  let attempts = 0

  const rawListBlockChildren = async (
    _args: ListBlockChildrenParameters,
  ): Promise<ListBlockChildrenResponse> => {
    attempts++
    if (attempts === 1) {
      const error = new Error("rate limited") as Error & { status: number }
      error.status = 429
      throw error
    }
    return makeParagraphResponse("リトライ後の本文")
  }

  // NotionTable.buildReferenceと同じ形でリトライ済み関数を渡す
  const pageRef = new NotionPageReference({
    client: mockClient,
    schema: mockSchema,
    converter: mockConverter,
    notionPage: mockPageData,
    listBlockChildren: (args) =>
      withRetry(() => rawListBlockChildren(args), { maxRetries: 2, baseDelayMs: 1 }),
  })

  const body = await pageRef.body()

  expect(attempts).toBe(2)
  expect(body).toContain("リトライ後の本文")
})

test("複数タイプのプロパティを保持できる", () => {
  const mockSchema = {
    name: { type: "title" as const },
    tags: { type: "multi_select" as const, options: null },
    isPublished: { type: "checkbox" as const },
    publishedAt: { type: "date" as const },
  } satisfies NotionPropertySchema

  const mockPageData = { id: "page-456", properties: {} } as PageObjectResponse
  const mockClient = {} as Client
  const mockConverter = {
    fromNotion: () => ({
      name: "カスタムページ",
      tags: ["TypeScript", "Notion"],
      isPublished: true,
      publishedAt: { start: "2024-01-01", end: null, timeZone: null },
    }),
    toNotion: () => ({}),
  } as unknown as NotionPropertyConverter

  const pageRef = new NotionPageReference({
    client: mockClient,
    schema: mockSchema,
    converter: mockConverter,
    notionPage: mockPageData,
  })

  const properties = pageRef.properties()
  expect(properties.name).toBe("カスタムページ")
  expect(properties.tags).toEqual(["TypeScript", "Notion"])
  expect(properties.isPublished).toBe(true)
  expect(properties.publishedAt).toEqual({
    start: "2024-01-01",
    end: null,
    timeZone: null,
  })
})
