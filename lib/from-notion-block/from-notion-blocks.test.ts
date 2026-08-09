import { expect, test } from "vite-plus/test"
import {
  sampleNotionBlocksResponse,
  sampleNotionBlocksResponseMarkdown,
} from "../samples/notion-blocks-response"
import { fromNotionBlocks } from "./from-notion-blocks"

test("fromNotionBlocks", () => {
  // 型キャストしてNotionBlock[]として扱う（childrenプロパティは空配列で初期化）
  const blocksWithChildren = sampleNotionBlocksResponse.data.map((block) => ({
    ...block,
    children: [],
  }))

  const text = fromNotionBlocks(blocksWithChildren)

  expect(text).toBe(sampleNotionBlocksResponseMarkdown)
})

test("空の段落ブロックが段落間の空行として処理される", () => {
  const blocks = [
    {
      object: "block",
      id: "1",
      type: "paragraph",
      paragraph: {
        rich_text: [
          {
            type: "text",
            text: { content: "段落1", link: null },
            plain_text: "段落1",
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
      created_time: "2024-01-01T00:00:00.000Z",
      last_edited_time: "2024-01-01T00:00:00.000Z",
      created_by: { object: "user", id: "user-id" },
      last_edited_by: { object: "user", id: "user-id" },
      has_children: false,
      archived: false,
      in_trash: false,
      parent: { type: "page_id", page_id: "parent-id" },
      children: [],
    },
    {
      object: "block",
      id: "2",
      type: "paragraph",
      paragraph: {
        rich_text: [],
        color: "default",
      },
      created_time: "2024-01-01T00:00:00.000Z",
      last_edited_time: "2024-01-01T00:00:00.000Z",
      created_by: { object: "user", id: "user-id" },
      last_edited_by: { object: "user", id: "user-id" },
      has_children: false,
      archived: false,
      in_trash: false,
      parent: { type: "page_id", page_id: "parent-id" },
      children: [],
    },
    {
      object: "block",
      id: "3",
      type: "paragraph",
      paragraph: {
        rich_text: [
          {
            type: "text",
            text: { content: "段落2", link: null },
            plain_text: "段落2",
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
      created_time: "2024-01-01T00:00:00.000Z",
      last_edited_time: "2024-01-01T00:00:00.000Z",
      created_by: { object: "user", id: "user-id" },
      last_edited_by: { object: "user", id: "user-id" },
      has_children: false,
      archived: false,
      in_trash: false,
      parent: { type: "page_id", page_id: "parent-id" },
      children: [],
    },
  ]

  // @ts-expect-error テスト用のモックデータで型が完全に一致しない
  const markdown = fromNotionBlocks(blocks)
  expect(markdown).toBe("段落1\n\n段落2")
})
