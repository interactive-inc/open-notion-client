import { expect, test } from "bun:test"
import type { NotionCalloutBlock } from "@/types"
import { fromNotionCalloutBlock } from "./from-notion-callout-block"

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
  type: "callout",
} as const

test("絵文字アイコン付きコールアウトブロックを変換できる", () => {
  const block = {
    ...baseBlock,
    callout: {
      rich_text: [
        {
          type: "text",
          text: {
            content: "これは重要な情報です",
            link: null,
          },
          plain_text: "これは重要な情報です",
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
      icon: {
        type: "emoji",
        emoji: "💡",
      },
      color: "default",
    },
    children: [],
  } as NotionCalloutBlock

  const result = fromNotionCalloutBlock(block)
  expect(result).toBe("> 💡 これは重要な情報です")
})

test("アイコンなしのコールアウトブロックを変換できる", () => {
  const block = {
    ...baseBlock,
    callout: {
      rich_text: [
        {
          type: "text",
          text: {
            content: "アイコンなしの情報",
            link: null,
          },
          plain_text: "アイコンなしの情報",
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
      icon: null,
      color: "default",
    },
    children: [],
  } as NotionCalloutBlock

  const result = fromNotionCalloutBlock(block)
  expect(result).toBe("> アイコンなしの情報")
})

test("子要素を持つコールアウトブロックを変換できる", () => {
  const block = {
    ...baseBlock,
    has_children: true,
    callout: {
      rich_text: [
        {
          type: "text",
          text: {
            content: "親コールアウト",
            link: null,
          },
          plain_text: "親コールアウト",
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
      icon: {
        type: "emoji",
        emoji: "📝",
      },
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
                content: "子要素のテキスト",
                link: null,
              },
              plain_text: "子要素のテキスト",
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
  } as NotionCalloutBlock

  const result = fromNotionCalloutBlock(block)
  expect(result).toBe("> 📝 親コールアウト\n> 子要素のテキスト")
})
