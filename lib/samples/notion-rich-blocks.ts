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
 * 引用ブロックのサンプルデータ
 */
export const sampleQuoteBlock = {
  ...baseBlockMeta,
  id: "1d8842f9-6181-80d8-af1c-dece63b450e0",
  type: "quote",
  quote: {
    rich_text: [
      {
        type: "text",
        text: {
          content: "これは引用文です",
          link: null,
        },
        plain_text: "これは引用文です",
        annotations: baseAnnotations,
        href: null,
      },
    ],
    color: "default",
  },
} as unknown as NotionBlockWithMeta

/**
 * コールアウトブロックのサンプルデータ
 */
export const sampleCalloutBlock = {
  ...baseBlockMeta,
  id: "1d8842f9-6181-80d8-af1c-dece63b450e1",
  type: "callout",
  callout: {
    rich_text: [
      {
        type: "text",
        text: {
          content: "これは重要な情報です",
          link: null,
        },
        plain_text: "これは重要な情報です",
        annotations: baseAnnotations,
        href: null,
      },
    ],
    icon: {
      type: "emoji",
      emoji: "💡",
    },
    color: "default",
  },
} as unknown as NotionBlockWithMeta

/**
 * To-Doブロック（未完了）のサンプルデータ
 */
export const sampleToDoBlockUnchecked = {
  ...baseBlockMeta,
  id: "1d8842f9-6181-80d8-af1c-dece63b450e2",
  type: "to_do",
  to_do: {
    rich_text: [
      {
        type: "text",
        text: {
          content: "タスク1",
          link: null,
        },
        plain_text: "タスク1",
        annotations: baseAnnotations,
        href: null,
      },
    ],
    checked: false,
    color: "default",
  },
} as unknown as NotionBlockWithMeta

/**
 * To-Doブロック（完了）のサンプルデータ
 */
export const sampleToDoBlockChecked = {
  ...baseBlockMeta,
  id: "1d8842f9-6181-80d8-af1c-dece63b450e3",
  type: "to_do",
  to_do: {
    rich_text: [
      {
        type: "text",
        text: {
          content: "完了したタスク",
          link: null,
        },
        plain_text: "完了したタスク",
        annotations: baseAnnotations,
        href: null,
      },
    ],
    checked: true,
    color: "default",
  },
} as unknown as NotionBlockWithMeta

/**
 * トグルブロックのサンプルデータ
 */
export const sampleToggleBlock = {
  ...baseBlockMeta,
  id: "1d8842f9-6181-80d8-af1c-dece63b450e4",
  type: "toggle",
  toggle: {
    rich_text: [
      {
        type: "text",
        text: {
          content: "トグルのタイトル",
          link: null,
        },
        plain_text: "トグルのタイトル",
        annotations: baseAnnotations,
        href: null,
      },
    ],
    color: "default",
  },
} as unknown as NotionBlockWithMeta
