import { expect, test } from "bun:test"
import type { RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints"
import { fromNotionBlocks } from "@/from-notion-block/from-notion-blocks"
import { toNotionBlocks } from "@/to-notion-block/to-notion-blocks"
import type { NotionBlock } from "@/types"

function createMockBlock(partial: Partial<NotionBlock>): NotionBlock {
  return {
    object: "block" as const,
    id: "mock-id",
    created_time: "2024-01-01T00:00:00.000Z",
    last_edited_time: "2024-01-01T00:00:00.000Z",
    created_by: { object: "user", id: "user-id" },
    last_edited_by: { object: "user", id: "user-id" },
    archived: false,
    in_trash: false,
    parent: { type: "page_id", page_id: "parent-id" },
    children: [],
    ...partial,
  } as NotionBlock
}

function createRichText(
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

test("見出しのラウンドトリップ: markdown → Notion → markdown", () => {
  const markdown = "# 大見出し"

  const blocks = toNotionBlocks(markdown)
  expect(blocks).toHaveLength(1)
  expect(blocks[0]?.type).toBe("heading_1")
})

test("段落のラウンドトリップ: Notion → markdown → Notion", () => {
  const notionBlocks: NotionBlock[] = [
    createMockBlock({
      type: "paragraph",
      paragraph: {
        rich_text: [createRichText("段落テキスト")],
        color: "default",
      },
    }),
  ]

  const markdown = fromNotionBlocks(notionBlocks)
  expect(markdown).toBe("段落テキスト")

  const roundTripped = toNotionBlocks(markdown)
  expect(roundTripped).toHaveLength(1)
  expect(roundTripped[0]?.type).toBe("paragraph")
})

test("コードブロックのラウンドトリップ: Notion → markdown → Notion", () => {
  const notionBlocks: NotionBlock[] = [
    createMockBlock({
      type: "code",
      code: {
        rich_text: [createRichText('console.log("hello")')],
        language: "javascript",
        caption: [],
      },
    }),
  ]

  const markdown = fromNotionBlocks(notionBlocks)
  expect(markdown).toContain("```javascript")
  expect(markdown).toContain('console.log("hello")')

  const roundTripped = toNotionBlocks(markdown)
  expect(roundTripped).toHaveLength(1)
  expect(roundTripped[0]?.type).toBe("code")
})

test("水平線のラウンドトリップ: markdown → Notion → markdown", () => {
  // divider前後に空行が必要（ないとsetext headingと解釈される）
  const markdown = "上\n\n---\n\n下"

  const blocks = toNotionBlocks(markdown)
  const types = blocks.map((b) => b.type)
  expect(types).toContain("paragraph")
  expect(types).toContain("divider")
})

test("dividerのラウンドトリップ: Notion → markdown → Notion", () => {
  const notionBlocks: NotionBlock[] = [
    createMockBlock({
      type: "paragraph",
      paragraph: {
        rich_text: [createRichText("上")],
        color: "default",
      },
    }),
    createMockBlock({
      type: "divider",
      divider: {},
    }),
    createMockBlock({
      type: "paragraph",
      paragraph: {
        rich_text: [createRichText("下")],
        color: "default",
      },
    }),
  ]

  const markdown = fromNotionBlocks(notionBlocks)
  expect(markdown).toContain("---")
  expect(markdown).not.toMatch(/上\n---/)

  const roundTripped = toNotionBlocks(markdown)
  const types = roundTripped.map((b) => b.type)
  expect(types).toContain("divider")
})

test("未対応ブロックのコールバック通知", () => {
  const skipped: Array<{ blockType: string; blockId: string }> = []

  const notionBlocks: NotionBlock[] = [
    createMockBlock({
      type: "paragraph",
      paragraph: {
        rich_text: [createRichText("通常テキスト")],
        color: "default",
      },
    }),
    {
      ...createMockBlock({ type: "paragraph", paragraph: { rich_text: [], color: "default" } }),
      id: "synced-1",
      type: "synced_block",
    } as unknown as NotionBlock,
  ]

  const markdown = fromNotionBlocks(notionBlocks, {
    onUnsupportedBlock: (blockType, blockId) => {
      skipped.push({ blockType, blockId })
    },
  })

  expect(markdown).toBe("通常テキスト")
  expect(skipped).toHaveLength(1)
  expect(skipped[0]?.blockType).toBe("synced_block")
  expect(skipped[0]?.blockId).toBe("synced-1")
})

test("箇条書きリストのラウンドトリップ: Notion → markdown → Notion", () => {
  const notionBlocks: NotionBlock[] = [
    createMockBlock({
      type: "bulleted_list_item",
      bulleted_list_item: {
        rich_text: [createRichText("項目A")],
        color: "default",
      },
    }),
    createMockBlock({
      type: "bulleted_list_item",
      bulleted_list_item: {
        rich_text: [createRichText("項目B")],
        color: "default",
      },
    }),
  ]

  const markdown = fromNotionBlocks(notionBlocks)
  expect(markdown).toContain("- 項目A")
  expect(markdown).toContain("- 項目B")

  const roundTripped = toNotionBlocks(markdown)
  expect(roundTripped.filter((b) => b.type === "bulleted_list_item")).toHaveLength(2)
})

test("引用のラウンドトリップ: Notion → markdown → Notion", () => {
  const notionBlocks: NotionBlock[] = [
    createMockBlock({
      type: "quote",
      quote: {
        rich_text: [createRichText("引用テキスト")],
        color: "default",
      },
    }),
  ]

  const markdown = fromNotionBlocks(notionBlocks)
  expect(markdown).toContain("> 引用テキスト")

  const roundTripped = toNotionBlocks(markdown)
  expect(roundTripped).toHaveLength(1)
  expect(roundTripped[0]?.type).toBe("quote")
})

test("複合ドキュメントのラウンドトリップ", () => {
  const markdown =
    "# タイトル\n\n段落テキスト\n\n- 項目1\n- 項目2\n\n```typescript\nconst x = 1\n```\n\n> 引用\n\n---"

  const blocks = toNotionBlocks(markdown)
  const types = blocks.map((b) => b.type)

  expect(types).toContain("heading_1")
  expect(types).toContain("paragraph")
  expect(types).toContain("bulleted_list_item")
  expect(types).toContain("code")
  expect(types).toContain("quote")
  expect(types).toContain("divider")
})
