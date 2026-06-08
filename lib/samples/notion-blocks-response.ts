import type { NotionBlocksResponseSample, NotionBlockWithMeta } from "./types"

/**
 * Notion APIから取得したブロックレスポンスのサンプルデータ
 */
export const sampleNotionBlocksResponse: NotionBlocksResponseSample = {
  data: [
    {
      object: "block",
      id: "1d8842f9-6181-80f6-96f9-ed047e755bb9",
      parent: {
        type: "page_id",
        page_id: "1d8842f9-6181-8042-8c77-d5c2f6cb333b",
      },
      created_time: "2025-04-17T16:09:00.000Z",
      last_edited_time: "2025-04-20T15:43:00.000Z",
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
      type: "heading_1",
      heading_1: {
        rich_text: [
          {
            type: "text",
            text: {
              content: "見出し1",
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
            plain_text: "見出し1",
            href: null,
          },
        ],
        is_toggleable: false,
        color: "default",
      },
    },
    {
      object: "block",
      id: "1d8842f9-6181-80f4-adac-e0d2b8a5e123",
      parent: {
        type: "page_id",
        page_id: "1d8842f9-6181-8042-8c77-d5c2f6cb333b",
      },
      created_time: "2025-04-17T16:09:00.000Z",
      last_edited_time: "2025-04-20T15:43:00.000Z",
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
      type: "paragraph",
      paragraph: {
        rich_text: [
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
    },
  ] as NotionBlockWithMeta[],
  description: "Notion APIから取得したブロックレスポンスのサンプルデータ（メタデータ付き）",
} as const

/**
 * 基本的なサンプル用のマークダウン文字列
 */
export const sampleNotionBlocksResponseMarkdown = `# 見出し1
あのイーハトーヴォのすきとおった風、夏でも底に冷たさをもつ青いそら、うつくしい森で飾られたモリーオ市、郊外のぎらぎらひかる草の波。`
