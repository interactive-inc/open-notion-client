import { expect, test } from "bun:test"
import type { FileBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { fromNotionFileBlock } from "./from-notion-file-block"

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
  type: "file",
} as const

test("外部ファイルブロックをマークダウンリンクに変換できる", () => {
  const block = {
    ...baseBlock,
    file: {
      type: "external",
      external: {
        url: "https://example.com/document.pdf",
      },
      caption: [],
      name: "document.pdf",
    },
  } as FileBlockObjectResponse

  const result = fromNotionFileBlock(block)
  expect(result).toBe("[ファイル](https://example.com/document.pdf)")
})

test("Notionファイルブロックをマークダウンリンクに変換できる", () => {
  const block = {
    ...baseBlock,
    file: {
      type: "file",
      file: {
        url: "https://s3.amazonaws.com/notion/document.pdf",
        expiry_time: "2025-04-20T16:01:00.000Z",
      },
      caption: [],
      name: "document.pdf",
    },
  } as FileBlockObjectResponse

  const result = fromNotionFileBlock(block)
  expect(result).toBe(
    "[ファイル](https://s3.amazonaws.com/notion/document.pdf)",
  )
})
