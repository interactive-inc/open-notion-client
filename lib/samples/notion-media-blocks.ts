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
 * 音声ブロックのサンプルデータ
 */
export const sampleAudioBlock = {
  ...baseBlockMeta,
  id: "1d8842f9-6181-80d8-af1c-dece63b450b0",
  type: "audio",
  audio: {
    type: "external",
    external: {
      url: "https://example.com/audio.mp3",
    },
    caption: [],
  },
} as unknown as NotionBlockWithMeta

/**
 * 動画ブロックのサンプルデータ
 */
export const sampleVideoBlock = {
  ...baseBlockMeta,
  id: "1d8842f9-6181-80d8-af1c-dece63b450b1",
  type: "video",
  video: {
    type: "external",
    external: {
      url: "https://www.youtube.com/watch?v=example",
    },
    caption: [],
  },
} as unknown as NotionBlockWithMeta

/**
 * 画像ブロックのサンプルデータ
 */
export const sampleImageBlock = {
  ...baseBlockMeta,
  id: "1d8842f9-6181-80d8-af1c-dece63b450b2",
  type: "image",
  image: {
    type: "external",
    external: {
      url: "https://example.com/image.png",
    },
    caption: [],
  },
} as unknown as NotionBlockWithMeta

/**
 * ファイルブロックのサンプルデータ
 */
export const sampleFileBlock = {
  ...baseBlockMeta,
  id: "1d8842f9-6181-80d8-af1c-dece63b450b3",
  type: "file",
  file: {
    type: "external",
    external: {
      url: "https://example.com/document.pdf",
    },
    caption: [],
    name: "document.pdf",
  },
} as unknown as NotionBlockWithMeta

/**
 * PDFブロックのサンプルデータ
 */
export const samplePdfBlock = {
  ...baseBlockMeta,
  id: "1d8842f9-6181-80d8-af1c-dece63b450b4",
  type: "pdf",
  pdf: {
    type: "external",
    external: {
      url: "https://example.com/document.pdf",
    },
    caption: [],
  },
} as unknown as NotionBlockWithMeta
