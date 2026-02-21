import { expect, test } from "bun:test"
import type { LinkToPageBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { fromNotionLinkToPageBlock } from "./from-notion-link-to-page-block"

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
  type: "link_to_page",
} as const

test("ページへのリンクをNotionURLに変換できる", () => {
  const block = {
    ...baseBlock,
    link_to_page: {
      type: "page_id",
      page_id: "abcd1234-5678-90ab-cdef-1234567890ab",
    },
  } as LinkToPageBlockObjectResponse

  const result = fromNotionLinkToPageBlock(block)
  expect(result).toBe("https://www.notion.so/abcd1234567890abcdef1234567890ab")
})

test("データベースへのリンクをNotionURLに変換できる", () => {
  const block = {
    ...baseBlock,
    link_to_page: {
      type: "database_id",
      database_id: "dbcd1234-5678-90ab-cdef-1234567890ab",
    },
  } as LinkToPageBlockObjectResponse

  const result = fromNotionLinkToPageBlock(block)
  expect(result).toBe("https://www.notion.so/dbcd1234567890abcdef1234567890ab")
})

test("IDからハイフンが削除される", () => {
  const block = {
    ...baseBlock,
    link_to_page: {
      type: "page_id",
      page_id: "1d88-42f9-6181-80d8-af1c-dece-63b4-50b0",
    },
  } as LinkToPageBlockObjectResponse

  const result = fromNotionLinkToPageBlock(block)
  expect(result).not.toContain("-")
})
