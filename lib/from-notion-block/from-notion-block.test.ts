import { expect, test } from "bun:test"
import type { RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints"
import type { NotionBlock } from "@/types"
import { fromNotionBlock } from "./from-notion-block"

// テスト用のヘルパー関数：完全なNotionBlockオブジェクトを作成
function createMockNotionBlock(partial: Partial<NotionBlock>): NotionBlock {
  const baseBlock = {
    object: "block" as const,
    id: "mock-id",
    created_time: "2024-01-01T00:00:00.000Z",
    last_edited_time: "2024-01-01T00:00:00.000Z",
    created_by: { object: "user", id: "user-id" },
    last_edited_by: { object: "user", id: "user-id" },
    archived: false,
    in_trash: false,
    parent: { type: "page_id", page_id: "parent-id" },
    url: "https://notion.so/mock-id",
    children: [],
    ...partial,
  }

  return baseBlock as NotionBlock
}

// テスト用のヘルパー関数：完全なRichTextItemResponseを作成
function createMockRichText(
  text: string,
  annotations: Partial<RichTextItemResponse["annotations"]> = {},
): RichTextItemResponse {
  return {
    type: "text",
    text: { content: text, link: null },
    plain_text: text,
    annotations: {
      bold: false,
      italic: false,
      strikethrough: false,
      underline: false,
      code: false,
      color: "default",
      ...annotations,
    },
    href: null,
  }
}

test("段落ブロックを変換できる", () => {
  const block = createMockNotionBlock({
    type: "paragraph",
    paragraph: {
      rich_text: [createMockRichText("これは段落です。")],
      color: "default",
    },
  })

  const result = fromNotionBlock(block)
  expect(result).toBe("これは段落です。")
})

test("見出し1ブロックを変換できる", () => {
  const block = createMockNotionBlock({
    type: "heading_1",
    heading_1: {
      rich_text: [createMockRichText("大見出し")],
      is_toggleable: false,
      color: "default",
    },
  })

  const result = fromNotionBlock(block)
  expect(result).toBe("# 大見出し")
})

test("見出し2ブロックを変換できる", () => {
  const block = createMockNotionBlock({
    type: "heading_2",
    heading_2: {
      rich_text: [createMockRichText("中見出し")],
      is_toggleable: false,
      color: "default",
    },
  })

  const result = fromNotionBlock(block)
  expect(result).toBe("## 中見出し")
})

test("見出し3ブロックを変換できる", () => {
  const block = createMockNotionBlock({
    type: "heading_3",
    heading_3: {
      rich_text: [createMockRichText("小見出し")],
      is_toggleable: false,
      color: "default",
    },
  })

  const result = fromNotionBlock(block)
  expect(result).toBe("### 小見出し")
})

test("箇条書きリストアイテムを変換できる", () => {
  const block = createMockNotionBlock({
    type: "bulleted_list_item",
    bulleted_list_item: {
      rich_text: [createMockRichText("リストアイテム")],
      color: "default",
    },
    children: [],
  })

  const result = fromNotionBlock(block)
  expect(result).toBe("- リストアイテム")
})

test("番号付きリストアイテムを変換できる", () => {
  const block = createMockNotionBlock({
    type: "numbered_list_item",
    numbered_list_item: {
      rich_text: [createMockRichText("番号付きアイテム")],
      color: "default",
    },
    children: [],
  })

  const result = fromNotionBlock(block)
  expect(result).toBe("1. 番号付きアイテム")
})

test("コードブロックを変換できる", () => {
  const block = createMockNotionBlock({
    type: "code",
    code: {
      rich_text: [createMockRichText("console.log('Hello, World!');")],
      language: "javascript",
      caption: [],
    },
  })

  const result = fromNotionBlock(block)
  expect(result).toBe("```javascript\nconsole.log('Hello, World!');\n```")
})

test("太字の段落を変換できる", () => {
  const block = createMockNotionBlock({
    type: "paragraph",
    paragraph: {
      rich_text: [createMockRichText("太字のテキスト", { bold: true })],
      color: "default",
    },
  })

  const result = fromNotionBlock(block)
  expect(result).toBe("**太字のテキスト**")
})

test("未対応のブロックタイプは空文字列として無視される", () => {
  const block = {
    type: "unsupported_block_type",
  } as unknown as NotionBlock

  const result = fromNotionBlock(block)
  expect(result).toBe("")
})
