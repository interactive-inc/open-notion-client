import { expect, test } from "bun:test"
import type { RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints"
import { fromNotionRichTextItem } from "./utils"

test("空の配列を処理", () => {
  const richTexts: RichTextItemResponse[] = []
  const result = fromNotionRichTextItem(richTexts)
  expect(result).toBe("")
})

test("nullを処理", () => {
  const result = fromNotionRichTextItem(null as unknown as RichTextItemResponse[])
  expect(result).toBe("")
})

test("プレーンテキストを変換", () => {
  const richTexts: RichTextItemResponse[] = [
    {
      type: "text",
      text: { content: "Hello World", link: null },
      plain_text: "Hello World",
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
  ]
  const result = fromNotionRichTextItem(richTexts)
  expect(result).toBe("Hello World")
})

test("太字テキストを変換", () => {
  const richTexts: RichTextItemResponse[] = [
    {
      type: "text",
      text: { content: "Bold Text", link: null },
      plain_text: "Bold Text",
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
  ]
  const result = fromNotionRichTextItem(richTexts)
  expect(result).toBe("**Bold Text**")
})

test("イタリックテキストを変換", () => {
  const richTexts: RichTextItemResponse[] = [
    {
      type: "text",
      text: { content: "Italic Text", link: null },
      plain_text: "Italic Text",
      annotations: {
        bold: false,
        italic: true,
        strikethrough: false,
        underline: false,
        code: false,
        color: "default",
      },
      href: null,
    },
  ]
  const result = fromNotionRichTextItem(richTexts)
  expect(result).toBe("*Italic Text*")
})

test("取り消し線テキストを変換", () => {
  const richTexts: RichTextItemResponse[] = [
    {
      type: "text",
      text: { content: "Strikethrough Text", link: null },
      plain_text: "Strikethrough Text",
      annotations: {
        bold: false,
        italic: false,
        strikethrough: true,
        underline: false,
        code: false,
        color: "default",
      },
      href: null,
    },
  ]
  const result = fromNotionRichTextItem(richTexts)
  expect(result).toBe("~~Strikethrough Text~~")
})

test("コードテキストを変換", () => {
  const richTexts: RichTextItemResponse[] = [
    {
      type: "text",
      text: { content: "console.log()", link: null },
      plain_text: "console.log()",
      annotations: {
        bold: false,
        italic: false,
        strikethrough: false,
        underline: false,
        code: true,
        color: "default",
      },
      href: null,
    },
  ]
  const result = fromNotionRichTextItem(richTexts)
  expect(result).toBe("`console.log()`")
})

test("複数の装飾を組み合わせたテキストを変換", () => {
  const richTexts: RichTextItemResponse[] = [
    {
      type: "text",
      text: { content: "Complex Text", link: null },
      plain_text: "Complex Text",
      annotations: {
        bold: true,
        italic: true,
        strikethrough: false,
        underline: false,
        code: false,
        color: "default",
      },
      href: null,
    },
  ]
  const result = fromNotionRichTextItem(richTexts)
  expect(result).toBe("***Complex Text***")
})

test("リンク付きテキストを変換", () => {
  const richTexts: RichTextItemResponse[] = [
    {
      type: "text",
      text: { content: "Click here", link: { url: "https://example.com" } },
      plain_text: "Click here",
      annotations: {
        bold: false,
        italic: false,
        strikethrough: false,
        underline: false,
        code: false,
        color: "default",
      },
      href: "https://example.com",
    },
  ]
  const result = fromNotionRichTextItem(richTexts)
  expect(result).toBe("[Click here](https://example.com)")
})

test("装飾とリンクを組み合わせたテキストを変換", () => {
  const richTexts: RichTextItemResponse[] = [
    {
      type: "text",
      text: { content: "Bold Link", link: { url: "https://example.com" } },
      plain_text: "Bold Link",
      annotations: {
        bold: true,
        italic: false,
        strikethrough: false,
        underline: false,
        code: false,
        color: "default",
      },
      href: "https://example.com",
    },
  ]
  const result = fromNotionRichTextItem(richTexts)
  expect(result).toBe("[**Bold Link**](https://example.com)")
})

test("複数のテキストアイテムを連結", () => {
  const richTexts: RichTextItemResponse[] = [
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
    {
      type: "text",
      text: { content: "!", link: null },
      plain_text: "!",
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
  ]
  const result = fromNotionRichTextItem(richTexts)
  expect(result).toBe("Hello **World**!")
})

test("すべての装飾を適用したテキストを変換", () => {
  const richTexts: RichTextItemResponse[] = [
    {
      type: "text",
      text: { content: "All Styles", link: null },
      plain_text: "All Styles",
      annotations: {
        bold: true,
        italic: true,
        strikethrough: true,
        underline: false,
        code: true,
        color: "default",
      },
      href: null,
    },
  ]
  const result = fromNotionRichTextItem(richTexts)
  expect(result).toBe("`~~***All Styles***~~`")
})

test("特殊文字を含むコードテキストを変換", () => {
  const richTexts: RichTextItemResponse[] = [
    {
      type: "text",
      text: { content: "const str = `Hello $" + "{name}!`", link: null },
      plain_text: "const str = `Hello $" + "{name}!`",
      annotations: {
        bold: false,
        italic: false,
        strikethrough: false,
        underline: false,
        code: true,
        color: "default",
      },
      href: null,
    },
  ]
  const result = fromNotionRichTextItem(richTexts)
  expect(result).toBe("`const str = `Hello $" + "{name}!``")
})

test("text.link.urlからリンクを抽出する（hrefがnullでも）", () => {
  const richTexts: RichTextItemResponse[] = [
    {
      type: "text",
      text: { content: "label", link: { url: "https://example.com" } },
      plain_text: "label",
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
  ]
  const result = fromNotionRichTextItem(richTexts)
  expect(result).toBe("[label](https://example.com)")
})
