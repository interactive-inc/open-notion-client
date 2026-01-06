import { expect, test } from "bun:test"
import type { NotionToDoBlock } from "@/types"
import { fromNotionToDoBlock } from "./from-notion-to-do-block"

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
  type: "to_do",
} as const

test("未完了のto_doブロックをマークダウンに変換できる", () => {
  const block = {
    ...baseBlock,
    to_do: {
      rich_text: [
        {
          type: "text",
          text: {
            content: "タスク1",
            link: null,
          },
          plain_text: "タスク1",
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
      checked: false,
      color: "default",
    },
    children: [],
  } as NotionToDoBlock

  const result = fromNotionToDoBlock(block)
  expect(result).toBe("- [ ] タスク1")
})

test("完了済みのto_doブロックをマークダウンに変換できる", () => {
  const block = {
    ...baseBlock,
    to_do: {
      rich_text: [
        {
          type: "text",
          text: {
            content: "完了したタスク",
            link: null,
          },
          plain_text: "完了したタスク",
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
      checked: true,
      color: "default",
    },
    children: [],
  } as NotionToDoBlock

  const result = fromNotionToDoBlock(block)
  expect(result).toBe("- [x] 完了したタスク")
})

test("子要素を持つto_doブロックを変換できる", () => {
  const block = {
    ...baseBlock,
    has_children: true,
    to_do: {
      rich_text: [
        {
          type: "text",
          text: {
            content: "親タスク",
            link: null,
          },
          plain_text: "親タスク",
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
      checked: false,
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
                content: "サブタスクの説明",
                link: null,
              },
              plain_text: "サブタスクの説明",
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
  } as NotionToDoBlock

  const result = fromNotionToDoBlock(block)
  expect(result).toBe("- [ ] 親タスク\n  サブタスクの説明")
})
