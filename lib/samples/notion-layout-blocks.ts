import type { NotionBlockWithMeta } from "./types"

/**
 * メタデータのベース
 */
const baseBlockMeta = {
  object: "block",
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
} as const

/**
 * リッチテキストのベース
 */
const baseAnnotations = {
  bold: false,
  italic: false,
  strikethrough: false,
  underline: false,
  code: false,
  color: "default",
} as const

/**
 * 区切り線ブロックのサンプルデータ
 */
export const sampleDividerBlock = {
  ...baseBlockMeta,
  id: "1d8842f9-6181-80d8-af1c-dece63b450d0",
  type: "divider",
  divider: {},
} as unknown as NotionBlockWithMeta

/**
 * 数式ブロックのサンプルデータ
 */
export const sampleEquationBlock = {
  ...baseBlockMeta,
  id: "1d8842f9-6181-80d8-af1c-dece63b450d1",
  type: "equation",
  equation: {
    expression: "E = mc^2",
  },
} as unknown as NotionBlockWithMeta

/**
 * カラムリストブロックのサンプルデータ
 */
export const sampleColumnListBlock = {
  ...baseBlockMeta,
  id: "1d8842f9-6181-80d8-af1c-dece63b450d2",
  has_children: true,
  type: "column_list",
  column_list: {},
} as unknown as NotionBlockWithMeta

/**
 * カラムブロックのサンプルデータ
 */
export const sampleColumnBlock = {
  ...baseBlockMeta,
  id: "1d8842f9-6181-80d8-af1c-dece63b450d3",
  parent: {
    type: "block_id",
    block_id: "1d8842f9-6181-80d8-af1c-dece63b450d2",
  },
  has_children: true,
  type: "column",
  column: {},
} as unknown as NotionBlockWithMeta

/**
 * テーブルブロックのサンプルデータ
 */
export const sampleTableBlock = {
  ...baseBlockMeta,
  id: "1d8842f9-6181-80d8-af1c-dece63b450d4",
  has_children: true,
  type: "table",
  table: {
    table_width: 3,
    has_column_header: true,
    has_row_header: false,
  },
} as unknown as NotionBlockWithMeta

/**
 * テーブル行ブロックのサンプルデータ
 */
export const sampleTableRowBlock = {
  ...baseBlockMeta,
  id: "1d8842f9-6181-80d8-af1c-dece63b450d5",
  parent: {
    type: "block_id",
    block_id: "1d8842f9-6181-80d8-af1c-dece63b450d4",
  },
  type: "table_row",
  table_row: {
    cells: [
      [
        {
          type: "text",
          text: { content: "名前", link: null },
          plain_text: "名前",
          annotations: baseAnnotations,
          href: null,
        },
      ],
      [
        {
          type: "text",
          text: { content: "年齢", link: null },
          plain_text: "年齢",
          annotations: baseAnnotations,
          href: null,
        },
      ],
      [
        {
          type: "text",
          text: { content: "職業", link: null },
          plain_text: "職業",
          annotations: baseAnnotations,
          href: null,
        },
      ],
    ],
  },
} as unknown as NotionBlockWithMeta
