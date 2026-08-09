import { expect, test } from "vite-plus/test"
import type { NotionNumberedListItemBlock } from "@/types"
import { fromNotionNumberedListItemBlock } from "./from-notion-numbered-list-item-block"

test("fromNotionNumberedListItemBlock", () => {
  const block = {
    object: "block",
    id: "1db842f9-6181-8057-b9f0-ce2b1866f36e",
    parent: {
      type: "page_id",
      page_id: "1d8842f9-6181-8042-8c77-d5c2f6cb333b",
    },
    created_time: "2025-04-20T15:42:00.000Z",
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
    in_trash: false,
    type: "numbered_list_item",
    numbered_list_item: {
      rich_text: [
        {
          type: "text",
          text: {
            content: "リスト1",
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
          plain_text: "リスト1",
          href: null,
        },
      ],
      color: "default",
    },
    children: [],
  } as const satisfies NotionNumberedListItemBlock

  const result = fromNotionNumberedListItemBlock(block)

  expect(result).toBe("1. リスト1")
})
