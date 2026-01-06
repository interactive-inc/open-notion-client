import { expect, test } from "bun:test"
import type { NotionBlock } from "@/types"
import { fromNotionColumnListBlock } from "./from-notion-column-list-block"

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
  has_children: true,
  archived: false,
  in_trash: false,
  type: "column_list",
  column_list: {},
} as const

test("カラムリストブロックを変換できる", () => {
  const block = {
    ...baseBlock,
    children: [
      {
        object: "block",
        id: "column-1",
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
        has_children: true,
        archived: false,
        in_trash: false,
        type: "column",
        column: {},
        children: [
          {
            object: "block",
            id: "paragraph-1",
            parent: {
              type: "block_id",
              block_id: "column-1",
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
                  text: { content: "左カラム", link: null },
                  plain_text: "左カラム",
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
      },
      {
        object: "block",
        id: "column-2",
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
        has_children: true,
        archived: false,
        in_trash: false,
        type: "column",
        column: {},
        children: [
          {
            object: "block",
            id: "paragraph-2",
            parent: {
              type: "block_id",
              block_id: "column-2",
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
                  text: { content: "右カラム", link: null },
                  plain_text: "右カラム",
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
      },
    ],
  } as NotionBlock

  const result = fromNotionColumnListBlock(block)
  expect(result).toBe("左カラム\n\n右カラム")
})

test("子要素なしのカラムリストブロックは空文字を返す", () => {
  const block = {
    ...baseBlock,
    has_children: false,
    children: [],
  } as NotionBlock

  const result = fromNotionColumnListBlock(block)
  expect(result).toBe("")
})
