import { expect, test } from "bun:test"
import type { NotionBlock } from "@/types"
import { fromNotionColumnBlock } from "./from-notion-column-block"

const baseBlock = {
  object: "block",
  id: "1d8842f9-6181-80d8-af1c-dece63b450b0",
  parent: {
    type: "block_id",
    block_id: "parent-column-list-id",
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
  has_children: true,
  archived: false,
  in_trash: false,
  type: "column",
  column: {},
} as const

test("カラムブロックを変換できる", () => {
  const block = {
    ...baseBlock,
    children: [
      {
        object: "block",
        id: "paragraph-1",
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
              text: { content: "カラム内のテキスト1", link: null },
              plain_text: "カラム内のテキスト1",
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
      {
        object: "block",
        id: "paragraph-2",
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
              text: { content: "カラム内のテキスト2", link: null },
              plain_text: "カラム内のテキスト2",
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
  } as NotionBlock

  const result = fromNotionColumnBlock(block)
  expect(result).toBe("カラム内のテキスト1\n\nカラム内のテキスト2")
})

test("子要素なしのカラムブロックは空文字を返す", () => {
  const block = {
    ...baseBlock,
    has_children: false,
    children: [],
  } as NotionBlock

  const result = fromNotionColumnBlock(block)
  expect(result).toBe("")
})
