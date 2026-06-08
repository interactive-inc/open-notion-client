import { expect, test } from "bun:test"
import type { Client } from "@notionhq/client"
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import type { NotionPropertyConverter } from "../table/notion-property-converter"
import type { NotionPropertySchema } from "../types"
import { NotionPageReference } from "./notion-page-reference"
import { NotionQueryResult } from "./notion-query-result"

test("ページ参照の配列を取得できる", () => {
  const mockSchema = {
    title: { type: "title" as const },
  } satisfies NotionPropertySchema

  const mockClient = {} as Client
  const mockConverter = {
    fromNotion: (_schema: NotionPropertySchema, properties: Record<string, unknown>) => {
      return { title: properties.id === "page-1" ? "Page 1" : "Page 2" }
    },
    toNotion: () => ({}),
  } as unknown as NotionPropertyConverter

  const pageRef1 = new NotionPageReference({
    notion: mockClient,
    schema: mockSchema,
    converter: mockConverter,
    notionPage: {
      id: "page-1",
      properties: {},
    } as unknown as PageObjectResponse,
  })
  const pageRef2 = new NotionPageReference({
    notion: mockClient,
    schema: mockSchema,
    converter: mockConverter,
    notionPage: {
      id: "page-2",
      properties: {},
    } as unknown as PageObjectResponse,
  })

  const queryResult = new NotionQueryResult({
    pageReferences: [pageRef1, pageRef2],
    cursor: "next-cursor",
    hasMore: true,
  })

  const refs = queryResult.references()
  expect(refs).toHaveLength(2)
  expect(refs[0]).toBe(pageRef1)
  expect(refs[1]).toBe(pageRef2)
})

test("カーソルを取得できる", () => {
  const queryResult = new NotionQueryResult({
    pageReferences: [],
    cursor: "next-page-cursor",
    hasMore: true,
  })

  expect(queryResult.cursor()).toBe("next-page-cursor")
})

test("カーソルがnullの場合", () => {
  const queryResult = new NotionQueryResult({
    pageReferences: [],
    cursor: null,
    hasMore: false,
  })

  expect(queryResult.cursor()).toBeNull()
})

test("さらにページがあるかを確認できる", () => {
  const queryResultWithMore = new NotionQueryResult({
    pageReferences: [],
    cursor: "cursor",
    hasMore: true,
  })

  const queryResultNoMore = new NotionQueryResult({
    pageReferences: [],
    cursor: null,
    hasMore: false,
  })

  expect(queryResultWithMore.hasMore()).toBe(true)
  expect(queryResultNoMore.hasMore()).toBe(false)
})

test("ページ数を取得できる", () => {
  const mockSchema = {
    title: { type: "title" as const },
  } satisfies NotionPropertySchema

  const mockClient = {} as Client
  const mockConverter = {
    fromNotion: (_: NotionPropertySchema, properties: Record<string, unknown>) => {
      return { title: `Page ${properties.id}` }
    },
    toNotion: () => ({}),
  } as unknown as NotionPropertyConverter

  const pageRefs = Array.from(
    { length: 5 },
    (_, i) =>
      new NotionPageReference({
        notion: mockClient,
        schema: mockSchema,
        converter: mockConverter,
        notionPage: {
          id: `page-${i}`,
          properties: {},
        } as unknown as PageObjectResponse,
      }),
  )

  const queryResult = new NotionQueryResult({
    pageReferences: pageRefs,
    cursor: null,
    hasMore: false,
  })

  expect(queryResult.length).toBe(5)
})

test("空の結果の場合", () => {
  const queryResult = new NotionQueryResult({
    pageReferences: [],
    cursor: null,
    hasMore: false,
  })

  expect(queryResult.references()).toEqual([])
  expect(queryResult.length).toBe(0)
  expect(queryResult.hasMore()).toBe(false)
  expect(queryResult.cursor()).toBeNull()
})

test("イミュータブルなオブジェクトである", () => {
  const queryResult = new NotionQueryResult({
    pageReferences: [],
    cursor: null,
    hasMore: false,
  })

  expect(Object.isFrozen(queryResult)).toBe(true)
})

test("型安全なプロパティを持つページ参照を扱える", () => {
  const mockSchema = {
    title: { type: "title" as const },
    author: { type: "rich_text" as const },
    publishedDate: { type: "date" as const },
    tags: { type: "multi_select" as const, options: null },
  } satisfies NotionPropertySchema

  const mockClient = {} as Client
  const mockConverter = {
    fromNotion: () => ({
      title: "TypeScriptの基礎",
      author: "山田太郎",
      publishedDate: { start: "2024-01-01", end: null },
      tags: ["TypeScript", "プログラミング"],
    }),
    toNotion: () => ({}),
  } as unknown as NotionPropertyConverter

  const articleRef = new NotionPageReference({
    notion: mockClient,
    schema: mockSchema,
    converter: mockConverter,
    notionPage: { id: "article-1", properties: {} } as PageObjectResponse,
  })

  const queryResult = new NotionQueryResult({
    pageReferences: [articleRef],
    cursor: null,
    hasMore: false,
  })

  const refs = queryResult.references()
  const props = refs[0]?.properties()
  expect(props?.title).toBe("TypeScriptの基礎")
  expect(props?.author).toBe("山田太郎")
  expect(props?.tags).toContain("TypeScript")
})
