import { expect, test } from "vite-plus/test"
import { NotionPageReference } from "@/modules/notion-page-reference"
import { NotionQueryResult } from "@/modules/notion-query-result"
import { NotionPropertyConverter } from "@/table/notion-property-converter"
import { NotionHttpMock } from "@/testing/notion-http-mock"
import { notionPage } from "@/testing/notion-page"
import { notionRichText } from "@/testing/notion-rich-text"

function reference(http: NotionHttpMock, id: string) {
  return new NotionPageReference({
    client: http.client,
    schema: { title: { type: "title" } },
    converter: new NotionPropertyConverter(),
    notionPage: notionPage(id),
  })
}

test("ページ参照の配列を取得できる", () => {
  const http = new NotionHttpMock()
  const first = reference(http, "page-1")
  const second = reference(http, "page-2")
  const queryResult = new NotionQueryResult({
    pageReferences: [first, second],
    cursor: "next",
    hasMore: true,
  })
  expect(queryResult.references()).toEqual([first, second])
  expect(queryResult.references()[0]).toBe(first)
  expect(queryResult.references()[1]).toBe(second)
})

test("カーソルを取得できる", () => {
  expect(
    new NotionQueryResult({ pageReferences: [], cursor: "next", hasMore: true }).cursor(),
  ).toBe("next")
})

test("カーソルがnullの場合", () => {
  expect(
    new NotionQueryResult({ pageReferences: [], cursor: null, hasMore: false }).cursor(),
  ).toBeNull()
})

test("さらにページがあるかを確認できる", () => {
  expect(
    new NotionQueryResult({ pageReferences: [], cursor: "next", hasMore: true }).hasMore(),
  ).toBe(true)
  expect(
    new NotionQueryResult({ pageReferences: [], cursor: null, hasMore: false }).hasMore(),
  ).toBe(false)
})

test("ページ数を取得できる", () => {
  const http = new NotionHttpMock()
  const references = Array.from({ length: 5 }, (_, index) => reference(http, `page-${index}`))
  expect(
    new NotionQueryResult({ pageReferences: references, cursor: null, hasMore: false }).length,
  ).toBe(5)
})

test("空の結果の場合", () => {
  const queryResult = new NotionQueryResult({ pageReferences: [], cursor: null, hasMore: false })
  expect(queryResult.references()).toEqual([])
  expect(queryResult.length).toBe(0)
  expect(queryResult.cursor()).toBeNull()
  expect(queryResult.hasMore()).toBe(false)
})

test("イミュータブルなオブジェクトである", () => {
  expect(
    Object.isFrozen(new NotionQueryResult({ pageReferences: [], cursor: null, hasMore: false })),
  ).toBe(true)
})

test("型安全なプロパティを持つページ参照を扱える", () => {
  const http = new NotionHttpMock()
  const page = notionPage("article", "TypeScriptの基礎")
  page.properties.author = {
    id: "author",
    type: "rich_text",
    rich_text: [notionRichText("山田太郎")],
  }
  page.properties.publishedDate = {
    id: "date",
    type: "date",
    date: { start: "2024-01-01", end: null, time_zone: null },
  }
  page.properties.tags = {
    id: "tags",
    type: "multi_select",
    multi_select: [{ id: "typescript", name: "TypeScript", color: "default" }],
  }
  const article = new NotionPageReference({
    client: http.client,
    schema: {
      title: { type: "title" },
      author: { type: "rich_text" },
      publishedDate: { type: "date" },
      tags: { type: "multi_select", options: null },
    },
    converter: new NotionPropertyConverter(),
    notionPage: page,
  })
  const queryResult = new NotionQueryResult({
    pageReferences: [article],
    cursor: null,
    hasMore: false,
  })
  expect(queryResult.references()[0]?.properties()).toEqual({
    title: "TypeScriptの基礎",
    author: "山田太郎",
    publishedDate: { start: "2024-01-01", end: null, timeZone: null },
    tags: ["TypeScript"],
  })
})
