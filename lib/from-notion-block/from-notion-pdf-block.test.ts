import { expect, test } from "bun:test"
import type { PdfBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { fromNotionPdfBlock } from "./from-notion-pdf-block"

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
  type: "pdf",
} as const

test("外部PDFブロックをマークダウンリンクに変換できる", () => {
  const block = {
    ...baseBlock,
    pdf: {
      type: "external",
      external: {
        url: "https://example.com/document.pdf",
      },
      caption: [],
    },
  } as PdfBlockObjectResponse

  const result = fromNotionPdfBlock(block)
  expect(result).toBe("[PDF](https://example.com/document.pdf)")
})

test("NotionファイルPDFブロックをマークダウンリンクに変換できる", () => {
  const block = {
    ...baseBlock,
    pdf: {
      type: "file",
      file: {
        url: "https://s3.amazonaws.com/notion/document.pdf",
        expiry_time: "2025-04-20T16:01:00.000Z",
      },
      caption: [],
    },
  } as PdfBlockObjectResponse

  const result = fromNotionPdfBlock(block)
  expect(result).toBe("[PDF](https://s3.amazonaws.com/notion/document.pdf)")
})
