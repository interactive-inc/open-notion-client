import { expect, test } from "bun:test"
import type { NotionQuoteBlock } from "@/types"
import { fromNotionQuoteBlock } from "./from-notion-quote-block"

const baseBlock = {
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
  type: "quote",
} as const

test("引用ブロックをマークダウンに変換できる", () => {
  const block = {
    ...baseBlock,
    quote: {
      rich_text: [
        {
          type: "text",
          text: {
            content: "これは引用文です",
            link: null,
          },
          plain_text: "これは引用文です",
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
    children: [],
  } as NotionQuoteBlock

  const result = fromNotionQuoteBlock(block)
  expect(result).toBe("> これは引用文です")
})

test("複数行の引用ブロックを変換できる", () => {
  const block = {
    ...baseBlock,
    quote: {
      rich_text: [
        {
          type: "text",
          text: {
            content: "1行目\n2行目\n3行目",
            link: null,
          },
          plain_text: "1行目\n2行目\n3行目",
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
    children: [],
  } as NotionQuoteBlock

  const result = fromNotionQuoteBlock(block)
  expect(result).toBe("> 1行目\n> 2行目\n> 3行目")
})

test("子要素を持つ引用ブロックを変換できる", () => {
  const block = {
    ...baseBlock,
    has_children: true,
    quote: {
      rich_text: [
        {
          type: "text",
          text: {
            content: "親引用",
            link: null,
          },
          plain_text: "親引用",
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
    children: [
      {
        object: "block",
        id: "child-block-id",
        parent: {
          type: "block_id",
          block_id: "1d8842f9-6181-80d8-af1c-dece63b450b0",
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
                content: "子要素のテキスト",
                link: null,
              },
              plain_text: "子要素のテキスト",
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
        children: [],
      },
    ],
  } as NotionQuoteBlock

  const result = fromNotionQuoteBlock(block)
  expect(result).toBe("> 親引用\n> 子要素のテキスト")
})
