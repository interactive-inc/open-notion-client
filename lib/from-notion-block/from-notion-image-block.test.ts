import { expect, test } from "bun:test"
import type { ImageBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { fromNotionImageBlock } from "./from-notion-image-block"

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
  type: "image",
} as const

test("外部画像ブロックをマークダウンに変換できる", () => {
  const block = {
    ...baseBlock,
    image: {
      type: "external",
      external: {
        url: "https://example.com/image.png",
      },
      caption: [],
    },
  } as ImageBlockObjectResponse

  const result = fromNotionImageBlock(block)
  expect(result).toBe("![image](https://example.com/image.png)")
})

test("Notionファイル画像ブロックをマークダウンに変換できる", () => {
  const block = {
    ...baseBlock,
    image: {
      type: "file",
      file: {
        url: "https://s3.amazonaws.com/notion/image.png",
        expiry_time: "2025-04-20T16:01:00.000Z",
      },
      caption: [],
    },
  } as ImageBlockObjectResponse

  const result = fromNotionImageBlock(block)
  expect(result).toBe("![image](https://s3.amazonaws.com/notion/image.png)")
})

test("キャプション付き画像ブロックをマークダウンに変換できる", () => {
  const block = {
    ...baseBlock,
    image: {
      type: "external",
      external: {
        url: "https://example.com/image.png",
      },
      caption: [
        {
          type: "text",
          text: {
            content: "サンプル画像",
            link: null,
          },
          plain_text: "サンプル画像",
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
    },
  } as ImageBlockObjectResponse

  const result = fromNotionImageBlock(block)
  expect(result).toBe("![サンプル画像](https://example.com/image.png)")
})
