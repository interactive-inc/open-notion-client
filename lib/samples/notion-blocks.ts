import type { NotionBlock, NotionBlocksSample } from "./types"

/**
 * Notionブロック配列のサンプルデータ
 */
export const sampleNotionBlocks: NotionBlocksSample = {
  data: [
    {
      type: "heading_1",
      heading_1: {
        rich_text: [
          {
            type: "text",
            text: {
              content: "見出し1",
            },
            plain_text: "見出し1",
            annotations: {},
          },
        ],
      },
    },
    {
      type: "paragraph",
      paragraph: {
        rich_text: [
          {
            type: "text",
            text: {
              content:
                "あのイーハトーヴォのすきとおった風、夏でも底に冷たさをもつ青いそら、うつくしい森で飾られたモリーオ市、郊外のぎらぎらひかる草の波。",
            },
            plain_text:
              "あのイーハトーヴォのすきとおった風、夏でも底に冷たさをもつ青いそら、うつくしい森で飾られたモリーオ市、郊外のぎらぎらひかる草の波。",
            annotations: {},
          },
        ],
      },
    },
    {
      type: "paragraph",
      paragraph: {
        rich_text: [
          {
            type: "text",
            text: {
              content:
                "あのイーハトーヴォのすきとおった風、夏でも底に冷たさをもつ青いそら、うつくしい森で飾られたモリーオ市、郊外のぎらぎらひかる草の波。",
            },
            plain_text:
              "あのイーハトーヴォのすきとおった風、夏でも底に冷たさをもつ青いそら、うつくしい森で飾られたモリーオ市、郊外のぎらぎらひかる草の波。",
            annotations: {},
          },
        ],
      },
    },
    {
      type: "code",
      code: {
        rich_text: [
          {
            type: "text",
            text: {
              content: "const a = 2",
            },
            plain_text: "const a = 2",
            annotations: {},
          },
        ],
        language: "json",
      },
    },
    {
      type: "heading_2",
      heading_2: {
        rich_text: [
          {
            type: "text",
            text: {
              content: "見出し2",
            },
            plain_text: "見出し2",
            annotations: {},
          },
        ],
      },
    },
    {
      type: "paragraph",
      paragraph: {
        rich_text: [
          {
            type: "text",
            text: {
              content: "あの",
            },
            plain_text: "あの",
            annotations: {},
          },
          {
            type: "text",
            text: {
              content: "イーハトーヴォ",
            },
            plain_text: "イーハトーヴォ",
            annotations: {
              code: true,
            },
          },
          {
            type: "text",
            text: {
              content: "のすきとおった風、夏でも底に冷たさをもつ青いそら、うつくしい森で飾られた",
            },
            plain_text: "のすきとおった風、夏でも底に冷たさをもつ青いそら、うつくしい森で飾られた",
            annotations: {},
          },
          {
            type: "text",
            text: {
              content: "モリーオ",
            },
            plain_text: "モリーオ",
            annotations: {
              code: true,
            },
          },
          {
            type: "text",
            text: {
              content: "市、郊外のぎらぎらひかる草の波。",
            },
            plain_text: "市、郊外のぎらぎらひかる草の波。",
            annotations: {},
          },
        ],
      },
    },
    {
      type: "heading_3",
      heading_3: {
        rich_text: [
          {
            type: "text",
            text: {
              content: "見出し3",
            },
            plain_text: "見出し3",
            annotations: {},
          },
        ],
      },
    },
    {
      type: "paragraph",
      paragraph: {
        rich_text: [
          {
            type: "text",
            text: {
              content:
                "あのイーハトーヴォのすきとおった風、\n夏でも底に冷たさをもつ青いそら、うつくしい森で飾られたモリーオ市、郊外のぎらぎらひかる草の波。",
            },
            plain_text:
              "あのイーハトーヴォのすきとおった風、\n夏でも底に冷たさをもつ青いそら、うつくしい森で飾られたモリーオ市、郊外のぎらぎらひかる草の波。",
            annotations: {},
          },
        ],
      },
    },
    {
      type: "bulleted_list_item",
      bulleted_list_item: {
        rich_text: [
          {
            type: "text",
            text: {
              content: "リスト1",
            },
            plain_text: "リスト1",
            annotations: {},
          },
        ],
      },
    },
    {
      type: "bulleted_list_item",
      bulleted_list_item: {
        rich_text: [
          {
            type: "text",
            text: {
              content: "リスト2",
            },
            plain_text: "リスト2",
            annotations: {},
          },
        ],
        children: [
          {
            type: "bulleted_list_item",
            bulleted_list_item: {
              rich_text: [
                {
                  type: "text",
                  text: {
                    content: "リスト3",
                  },
                  plain_text: "リスト3",
                  annotations: {},
                },
              ],
              children: [
                {
                  type: "bulleted_list_item",
                  bulleted_list_item: {
                    rich_text: [
                      {
                        type: "text",
                        text: {
                          content: "リスト4",
                        },
                        plain_text: "リスト4",
                        annotations: {},
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            type: "bulleted_list_item",
            bulleted_list_item: {
              rich_text: [
                {
                  type: "text",
                  text: {
                    content: "リスト5",
                  },
                  plain_text: "リスト5",
                  annotations: {},
                },
              ],
            },
          },
        ],
      },
    },
    {
      type: "numbered_list_item",
      numbered_list_item: {
        rich_text: [
          {
            type: "text",
            text: {
              content: "リスト1",
            },
            plain_text: "リスト1",
            annotations: {},
          },
        ],
      },
    },
    {
      type: "numbered_list_item",
      numbered_list_item: {
        rich_text: [
          {
            type: "text",
            text: {
              content: "リスト2",
            },
            plain_text: "リスト2",
            annotations: {},
          },
        ],
        children: [
          {
            type: "numbered_list_item",
            numbered_list_item: {
              rich_text: [
                {
                  type: "text",
                  text: {
                    content: "リスト3",
                  },
                  plain_text: "リスト3",
                  annotations: {},
                },
              ],
              children: [
                {
                  type: "numbered_list_item",
                  numbered_list_item: {
                    rich_text: [
                      {
                        type: "text",
                        text: {
                          content: "リスト4",
                        },
                        plain_text: "リスト4",
                        annotations: {},
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            type: "numbered_list_item",
            numbered_list_item: {
              rich_text: [
                {
                  type: "text",
                  text: {
                    content: "リスト5",
                  },
                  plain_text: "リスト5",
                  annotations: {},
                },
              ],
            },
          },
        ],
      },
    },
  ] as NotionBlock[],
  description: "マークダウンから変換されたNotionブロック構造のサンプルデータ",
} as const
