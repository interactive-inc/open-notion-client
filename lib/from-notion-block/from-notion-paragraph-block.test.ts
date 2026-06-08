import { expect, test } from "bun:test"
import type { ParagraphBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { fromNotionParagraphBlock } from "./from-notion-paragraph-block"

const block = {
  object: "block",
  id: "1d8842f9-6181-80d8-af1c-dece63b450b0",
  parent: {
    type: "page_id",
    page_id: "1d8842f9-6181-8042-8c77-d5c2f6cb333b",
  },
  created_time: "2025-04-17T16:09:00.000Z",
  last_edited_time: "2025-04-20T16:01:00.000Z",
  created_by: {
    object: "user",
    id: "63fd3a0c-d05f-48d4-8009-0a0e997edfca",
  },
  last_edited_by: {
    object: "user",
    id: "63fd3a0c-d05f-48d4-8009-0a0e997edfca",
  },
  has_children: false,
  archived: false,
  in_trash: false,
  type: "paragraph",
  paragraph: {
    rich_text: [
      {
        type: "text",
        text: {
          content: "宮沢賢治『銀河鉄道の夜』",
          link: null,
        },
        annotations: {
          bold: false,
          italic: false,
          strikethrough: false,
          underline: false,
          code: false,
          color: "default",
        },
        plain_text: "宮沢賢治『銀河鉄道の夜』",
        href: null,
      },
      {
        type: "text",
        text: {
          content:
            "あのイーハトーヴォのすきとおった風、夏でも底に冷たさをもつ青いそら、うつくしい森で飾られたモリーオ市、郊外のぎらぎらひかる草の波。",
          link: null,
        },
        annotations: {
          bold: false,
          italic: false,
          strikethrough: false,
          underline: false,
          code: false,
          color: "default",
        },
        plain_text:
          "あのイーハトーヴォのすきとおった風、夏でも底に冷たさをもつ青いそら、うつくしい森で飾られたモリーオ市、郊外のぎらぎらひかる草の波。",
        href: null,
      },
    ],
    color: "default",
  },
} as const satisfies ParagraphBlockObjectResponse

test("通常の段落ブロックをマークダウンに変換できる", () => {
  const result = fromNotionParagraphBlock(block)

  expect(result).toContain("宮沢賢治")
  expect(result).toContain("のすきとおった風")
})

test("複数のリッチテキスト要素を含む段落ブロックを変換できる", () => {
  const result = fromNotionParagraphBlock(block)

  expect(result).toContain("宮沢賢治")
  expect(result).toContain("のすきとおった風")
})

test("段落内の改行はそのまま保持される", () => {
  const blockWithNewline = {
    object: "block",
    id: "mock-id",
    type: "paragraph",
    paragraph: {
      rich_text: [
        {
          type: "text",
          text: { content: "段落1\n段落2", link: null },
          plain_text: "段落1\n段落2",
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
      color: "default",
    },
    created_time: "2024-01-01T00:00:00.000Z",
    last_edited_time: "2024-01-01T00:00:00.000Z",
    created_by: { object: "user", id: "user-id" },
    last_edited_by: { object: "user", id: "user-id" },
    has_children: false,
    archived: false,
    in_trash: false,
    parent: { type: "page_id", page_id: "parent-id" },
  }

  const result = fromNotionParagraphBlock(blockWithNewline as ParagraphBlockObjectResponse)
  expect(result).toBe("段落1\n段落2")
})
