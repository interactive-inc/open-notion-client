import { expect, test } from "vite-plus/test"
import type { Heading1BlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { fromNotionHeadingOneBlock } from "./from-notion-heading-one-block"

test("fromNotionHeading1Block", () => {
  const block = {
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
    in_trash: false,
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
  } as const satisfies Heading1BlockObjectResponse

  const result = fromNotionHeadingOneBlock(block)

  expect(result).toBe("# 見出し1")
})
