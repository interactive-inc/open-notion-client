import { expect, test } from "bun:test"
import type { Tokens } from "marked"
import type { RichTextItemResponse } from "@/types"
import { parseInlineToken } from "./parse-inline-token"

test("プレーンテキストを変換", () => {
  const token: Tokens.Text = {
    type: "text",
    raw: "Plain text",
    text: "Plain text",
  }

  const result = parseInlineToken(token)

  expect(result).toEqual({
    type: "text",
    text: { content: "Plain text" },
    plain_text: "Plain text",
    annotations: {},
  } as RichTextItemResponse)
})

test("太字テキストを変換", () => {
  const token: Tokens.Strong = {
    type: "strong",
    raw: "**Bold text**",
    text: "Bold text",
    tokens: [
      {
        type: "text",
        raw: "Bold text",
        text: "Bold text",
      } as Tokens.Text,
    ],
  }

  const result = parseInlineToken(token)

  expect(result).toEqual({
    type: "text",
    text: { content: "Bold text" },
    plain_text: "Bold text",
    annotations: {
      bold: true,
    },
  } as RichTextItemResponse)
})

test("イタリックテキストを変換", () => {
  const token: Tokens.Em = {
    type: "em",
    raw: "*Italic text*",
    text: "Italic text",
    tokens: [
      {
        type: "text",
        raw: "Italic text",
        text: "Italic text",
      } as Tokens.Text,
    ],
  }

  const result = parseInlineToken(token)

  expect(result).toEqual({
    type: "text",
    text: { content: "Italic text" },
    plain_text: "Italic text",
    annotations: {
      italic: true,
    },
  } as RichTextItemResponse)
})

test("インラインコードを変換", () => {
  const token: Tokens.Codespan = {
    type: "codespan",
    raw: "`code`",
    text: "code",
  }

  const result = parseInlineToken(token)

  expect(result).toEqual({
    type: "text",
    text: { content: "code" },
    plain_text: "code",
    annotations: {
      code: true,
    },
  } as RichTextItemResponse)
})

test("取り消し線テキストを変換", () => {
  const token: Tokens.Del = {
    type: "del",
    raw: "~~Strikethrough~~",
    text: "Strikethrough",
    tokens: [
      {
        type: "text",
        raw: "Strikethrough",
        text: "Strikethrough",
      } as Tokens.Text,
    ],
  }

  const result = parseInlineToken(token)

  expect(result).toEqual({
    type: "text",
    text: { content: "Strikethrough" },
    plain_text: "Strikethrough",
    annotations: {
      strikethrough: true,
    },
  } as RichTextItemResponse)
})

test("太字とイタリックの組み合わせを変換", () => {
  const innerToken: Tokens.Em = {
    type: "em",
    raw: "*Bold Italic*",
    text: "Bold Italic",
    tokens: [
      {
        type: "text",
        raw: "Bold Italic",
        text: "Bold Italic",
      } as Tokens.Text,
    ],
  }

  const token: Tokens.Strong = {
    type: "strong",
    raw: "***Bold Italic***",
    text: "Bold Italic",
    tokens: [innerToken],
  }

  const result = parseInlineToken(token)

  expect(result).toEqual({
    type: "text",
    text: { content: "Bold Italic" },
    plain_text: "Bold Italic",
    annotations: {
      bold: true,
      italic: true,
    },
  } as RichTextItemResponse)
})

test("改行文字を含むテキストを変換", () => {
  const token: Tokens.Text = {
    type: "text",
    raw: "Line 1\nLine 2",
    text: "Line 1\nLine 2",
  }

  const result = parseInlineToken(token)

  expect(result).toEqual({
    type: "text",
    text: { content: "Line 1\nLine 2" },
    plain_text: "Line 1\nLine 2",
    annotations: {},
  } as RichTextItemResponse)
})

test("リンクトークンをlink付きrich_textに変換", () => {
  const token: Tokens.Link = {
    type: "link",
    raw: "[label](https://example.com)",
    href: "https://example.com",
    text: "label",
    tokens: [{ type: "text", raw: "label", text: "label" } as Tokens.Text],
  }

  const result = parseInlineToken(token)

  expect(result).toEqual({
    type: "text",
    text: {
      content: "label",
      link: { url: "https://example.com" },
    },
    plain_text: "label",
    annotations: {},
  } as RichTextItemResponse)
})

test("リンク内の装飾を保持する", () => {
  const token: Tokens.Link = {
    type: "link",
    raw: "[**bold**](https://example.com)",
    href: "https://example.com",
    text: "bold",
    tokens: [
      {
        type: "strong",
        raw: "**bold**",
        text: "bold",
        tokens: [{ type: "text", raw: "bold", text: "bold" } as Tokens.Text],
      } as Tokens.Strong,
    ],
  }

  const result = parseInlineToken(token)

  expect(result).toEqual({
    type: "text",
    text: {
      content: "bold",
      link: { url: "https://example.com" },
    },
    plain_text: "bold",
    annotations: { bold: true },
  } as RichTextItemResponse)
})

test("未知のトークンタイプをテキストとして扱う", () => {
  const token = {
    type: "unknown",
    raw: "Unknown token",
    text: "Unknown token",
  } as unknown as Tokens.Generic

  const result = parseInlineToken(token)

  expect(result).toEqual({
    type: "text",
    text: { content: "Unknown token" },
    plain_text: "Unknown token",
    annotations: {},
  } as RichTextItemResponse)
})
