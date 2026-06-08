import { expect, test } from "bun:test"
import type {
  PageObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints"
import { fromNotionTitleProperty } from "./from-notion-title-property"

type TitleProperty = Extract<PageObjectResponse["properties"][string], { type: "title" }>

test("単一のタイトルテキストを変換", () => {
  const property: TitleProperty = {
    type: "title",
    title: [
      {
        type: "text",
        text: { content: "ページタイトル", link: null },
        plain_text: "ページタイトル",
        annotations: {
          bold: false,
          italic: false,
          strikethrough: false,
          underline: false,
          code: false,
          color: "default",
        },
        href: null,
      },
    ],
    id: "title",
  }

  const result = fromNotionTitleProperty(property)
  expect(result).toBe("ページタイトル")
})

test("複数のタイトルテキストを連結して変換", () => {
  const property: TitleProperty = {
    type: "title",
    title: [
      {
        type: "text",
        text: { content: "重要: ", link: null },
        plain_text: "重要: ",
        annotations: {
          bold: true,
          italic: false,
          strikethrough: false,
          underline: false,
          code: false,
          color: "red",
        },
        href: null,
      },
      {
        type: "text",
        text: { content: "プロジェクト計画", link: null },
        plain_text: "プロジェクト計画",
        annotations: {
          bold: false,
          italic: false,
          strikethrough: false,
          underline: false,
          code: false,
          color: "default",
        },
        href: null,
      },
    ],
    id: "title",
  }

  const result = fromNotionTitleProperty(property)
  expect(result).toBe("重要: プロジェクト計画")
})

test("空のtitleリストを変換", () => {
  const property: TitleProperty = {
    type: "title",
    title: [],
    id: "title",
  }

  const result = fromNotionTitleProperty(property)
  expect(result).toBe("")
})

test("titleがnullの場合", () => {
  const property: TitleProperty = {
    type: "title",
    title: null as unknown as RichTextItemResponse[],
    id: "title",
  }

  const result = fromNotionTitleProperty(property)
  expect(result).toBe("")
})

test("titleが配列でない場合", () => {
  const property: TitleProperty = {
    type: "title",
    title: "not an array" as unknown as RichTextItemResponse[],
    id: "title",
  }

  const result = fromNotionTitleProperty(property)
  expect(result).toBe("")
})
