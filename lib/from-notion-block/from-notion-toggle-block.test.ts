import { expect, test } from "bun:test"
import type { NotionToggleBlock } from "@/types"
import { fromNotionToggleBlock } from "./from-notion-toggle-block"

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
  type: "toggle",
} as const

test("子要素なしのトグルブロックを変換できる", () => {
  const block = {
    ...baseBlock,
    toggle: {
      rich_text: [
        {
          type: "text",
          text: {
            content: "トグルのタイトル",
            link: null,
          },
          plain_text: "トグルのタイトル",
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
  } as NotionToggleBlock

  const result = fromNotionToggleBlock(block)
  expect(result).toBe("**トグルのタイトル**")
})

test("子要素を持つトグルブロックを変換できる", () => {
  const block = {
    ...baseBlock,
    has_children: true,
    toggle: {
      rich_text: [
        {
          type: "text",
          text: {
            content: "詳細を表示",
            link: null,
          },
          plain_text: "詳細を表示",
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
    children: [
      {
        object: "block",
        id: "child-block-id",
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
        type: "paragraph",
        paragraph: {
          rich_text: [
            {
              type: "text",
              text: {
                content: "トグル内のコンテンツ",
                link: null,
              },
              plain_text: "トグル内のコンテンツ",
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
  } as NotionToggleBlock

  const result = fromNotionToggleBlock(block)
  expect(result).toBe("**詳細を表示**\n\nトグル内のコンテンツ")
})
