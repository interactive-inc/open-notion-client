import { expect, test } from "bun:test"
import type { ChildPageBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { fromNotionChildPageBlock } from "./from-notion-child-page-block"

const block = {
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
  type: "child_page",
  child_page: {
    title: "子ページのタイトル",
  },
} as const satisfies ChildPageBlockObjectResponse

test("child_pageブロックをNotionリンクに変換できる", () => {
  const result = fromNotionChildPageBlock(block)
  expect(result).toBe(
    "[子ページのタイトル](https://www.notion.so/1d8842f9618180d8af1cdece63b450b0)",
  )
})

test("IDからハイフンが削除される", () => {
  const result = fromNotionChildPageBlock(block)
  expect(result).not.toContain("-")
  expect(result).toContain("1d8842f9618180d8af1cdece63b450b0")
})
