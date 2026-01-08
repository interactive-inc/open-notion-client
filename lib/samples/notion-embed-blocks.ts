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
 * 埋め込みブロックのサンプルデータ
 */
export const sampleEmbedBlock = {
  ...baseBlockMeta,
  id: "1d8842f9-6181-80d8-af1c-dece63b450c0",
  type: "embed",
  embed: {
    url: "https://example.com/embed",
    caption: [],
  },
} as unknown as NotionBlockWithMeta

/**
 * ブックマークブロックのサンプルデータ
 */
export const sampleBookmarkBlock = {
  ...baseBlockMeta,
  id: "1d8842f9-6181-80d8-af1c-dece63b450c1",
  type: "bookmark",
  bookmark: {
    url: "https://example.com/bookmark",
    caption: [],
  },
} as unknown as NotionBlockWithMeta

/**
 * リンクプレビューブロックのサンプルデータ
 */
export const sampleLinkPreviewBlock = {
  ...baseBlockMeta,
  id: "1d8842f9-6181-80d8-af1c-dece63b450c2",
  type: "link_preview",
  link_preview: {
    url: "https://example.com/preview",
  },
} as unknown as NotionBlockWithMeta

/**
 * ページへのリンクブロックのサンプルデータ
 */
export const sampleLinkToPageBlock = {
  ...baseBlockMeta,
  id: "1d8842f9-6181-80d8-af1c-dece63b450c3",
  type: "link_to_page",
  link_to_page: {
    type: "page_id",
    page_id: "abcd1234-5678-90ab-cdef-1234567890ab",
  },
} as unknown as NotionBlockWithMeta

/**
 * 子ページブロックのサンプルデータ
 */
export const sampleChildPageBlock = {
  ...baseBlockMeta,
  id: "1d8842f9-6181-80d8-af1c-dece63b450c4",
  type: "child_page",
  child_page: {
    title: "子ページのタイトル",
  },
} as unknown as NotionBlockWithMeta

/**
 * 子データベースブロックのサンプルデータ
 */
export const sampleChildDatabaseBlock = {
  ...baseBlockMeta,
  id: "1d8842f9-6181-80d8-af1c-dece63b450c5",
  type: "child_database",
  child_database: {
    title: "子データベースのタイトル",
  },
} as unknown as NotionBlockWithMeta
