import { expect, test } from "vite-plus/test"
import type { Heading2BlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { fromNotionHeadingTwoBlock } from "./from-notion-heading-two-block"

test("fromNotionHeading2Block", () => {
  const block = {
    object: "block",
    id: "1d8842f9-6181-8011-a082-cc6b57b3b5a2",
    parent: {
      type: "page_id",
      page_id: "1d8842f9-6181-8042-8c77-d5c2f6cb333b",
    },
    created_time: "2025-04-17T15:59:00.000Z",
    last_edited_time: "2025-04-17T16:09:00.000Z",
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
    type: "heading_2",
    heading_2: {
      rich_text: [
        {
          type: "text",
          text: {
            content: "見出し2",
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
          plain_text: "見出し2",
          href: null,
        },
      ],
      is_toggleable: false,
      color: "default",
    },
  } as const satisfies Heading2BlockObjectResponse

  const result = fromNotionHeadingTwoBlock(block)

  expect(result).toBe("## 見出し2")
})
