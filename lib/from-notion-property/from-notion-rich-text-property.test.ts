import { expect, test } from "bun:test"
import type {
  PageObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints"
import { fromNotionRichTextProperty } from "./from-notion-rich-text-property"

type RichTextProperty = Extract<PageObjectResponse["properties"][string], { type: "rich_text" }>

test("単一のテキストを変換", () => {
  const property: RichTextProperty = {
    type: "rich_text",
    rich_text: [
      {
        type: "text",
        text: { content: "テストテキスト", link: null },
        plain_text: "テストテキスト",
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
    id: "test",
  }

  const result = fromNotionRichTextProperty(property)
  expect(result).toBe("テストテキスト")
})

test("複数のテキストを連結して変換", () => {
  const property: RichTextProperty = {
    type: "rich_text",
    rich_text: [
      {
        type: "text",
        text: { content: "Hello ", link: null },
        plain_text: "Hello ",
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
      {
        type: "text",
        text: { content: "World", link: null },
        plain_text: "World",
        annotations: {
          bold: true,
          italic: false,
          strikethrough: false,
          underline: false,
          code: false,
          color: "default",
        },
        href: null,
      },
    ],
    id: "test",
  }

  const result = fromNotionRichTextProperty(property)
  expect(result).toBe("Hello World")
})

test("空のrich_textリストを変換", () => {
  const property: RichTextProperty = {
    type: "rich_text",
    rich_text: [],
    id: "test",
  }

  const result = fromNotionRichTextProperty(property)
  expect(result).toBe("")
})

test("rich_textがnullの場合", () => {
  const property: RichTextProperty = {
    type: "rich_text",
    rich_text: null as unknown as RichTextItemResponse[],
    id: "test",
  }

  const result = fromNotionRichTextProperty(property)
  expect(result).toBe("")
})

test("rich_textが配列でない場合", () => {
  const property: RichTextProperty = {
    type: "rich_text",
    rich_text: "not an array" as unknown as RichTextItemResponse[],
    id: "test",
  }

  const result = fromNotionRichTextProperty(property)
  expect(result).toBe("")
})
