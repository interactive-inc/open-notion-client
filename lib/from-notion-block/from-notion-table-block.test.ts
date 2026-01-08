import { expect, test } from "bun:test"
import type { NotionTableBlock } from "@/types"
import { fromNotionTableBlock } from "./from-notion-table-block"

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
  type: "table",
} as const

test("テーブルブロックをマークダウンに変換できる", () => {
  const block = {
    ...baseBlock,
    table: {
      table_width: 3,
      has_column_header: true,
      has_row_header: false,
    },
    children: [
      {
        object: "block",
        id: "row-1",
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
        type: "table_row",
        table_row: {
          cells: [
            [
              {
                type: "text",
                text: { content: "名前", link: null },
                plain_text: "名前",
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
            [
              {
                type: "text",
                text: { content: "年齢", link: null },
                plain_text: "年齢",
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
            [
              {
                type: "text",
                text: { content: "職業", link: null },
                plain_text: "職業",
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
          ],
        },
        children: [],
      },
      {
        object: "block",
        id: "row-2",
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
        type: "table_row",
        table_row: {
          cells: [
            [
              {
                type: "text",
                text: { content: "田中", link: null },
                plain_text: "田中",
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
            [
              {
                type: "text",
                text: { content: "30", link: null },
                plain_text: "30",
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
            [
              {
                type: "text",
                text: { content: "エンジニア", link: null },
                plain_text: "エンジニア",
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
          ],
        },
        children: [],
      },
    ],
  } as NotionTableBlock

  const result = fromNotionTableBlock(block)
  expect(result).toBe(
    "| 名前 | 年齢 | 職業 |\n| --- | --- | --- |\n| 田中 | 30 | エンジニア |",
  )
})

test("子要素なしのテーブルブロックは空文字を返す", () => {
  const block = {
    ...baseBlock,
    has_children: false,
    table: {
      table_width: 3,
      has_column_header: true,
      has_row_header: false,
    },
    children: [],
  } as NotionTableBlock

  const result = fromNotionTableBlock(block)
  expect(result).toBe("")
})
