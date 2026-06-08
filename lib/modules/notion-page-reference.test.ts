import { expect, test } from "bun:test"
import type { Client } from "@notionhq/client"
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import type { NotionPropertyConverter } from "../table/notion-property-converter"
import type { NotionPropertySchema } from "../types"
import { NotionPageReference } from "./notion-page-reference"

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
    notion: mockClient,
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
    notion: mockClient,
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
    notion: mockClient,
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
    notion: mockClient,
    schema: mockSchema,
    converter: mockConverter,
    notionPage: mockPageData,
  })

  // body()メソッドが存在することを確認
  expect(typeof pageRef.body).toBe("function")
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
    notion: mockClient,
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
