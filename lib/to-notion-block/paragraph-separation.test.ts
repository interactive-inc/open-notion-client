import { expect, test } from "bun:test"
import { lexer } from "marked"
import { fromNotionBlocks } from "@/from-notion-block/from-notion-blocks"
import type { NotionBlock } from "@/types"
import { toNotionBlocks } from "./to-notion-blocks"

/**
 * CRITICAL TESTS for paragraph separation behavior
 *
 * These tests ensure that:
 * 1. Paragraph separation works correctly in both directions (markdown -> Notion -> markdown)
 * 2. No redundant empty paragraph blocks are created
 * 3. Internal paragraph newlines are properly handled
 *
 * DO NOT MODIFY THESE TESTS WITHOUT UNDERSTANDING THE PARAGRAPH SEPARATION REQUIREMENTS
 */

test("CRITICAL: Space tokens should NOT create empty paragraph blocks", () => {
  // This markdown has blank lines between paragraphs
  const markdown = `Paragraph 1

Paragraph 2

Paragraph 3`

  const tokens = lexer(markdown)
  expect(tokens).toHaveLength(5) // paragraph, space, paragraph, space, paragraph

  const blocks = toNotionBlocks(markdown)

  // CRITICAL: Should have exactly 3 blocks, NO empty paragraph blocks
  expect(blocks).toHaveLength(3)

  // All blocks should be non-empty paragraphs
  for (const block of blocks) {
    expect(block.type).toBe("paragraph")
    expect("paragraph" in block && block.paragraph.rich_text.length).toBeGreaterThan(0)
  }
})

test("CRITICAL: Paragraph blocks with internal newlines should be split", () => {
  // Create a mock Notion block with internal newlines (simulating Notion's behavior)
  const mockBlocks: NotionBlock[] = [
    {
      object: "block",
      id: "test-id",
      type: "paragraph",
      paragraph: {
        icon: null,
        rich_text: [
          {
            type: "text",
            text: { content: "Line 1\nLine 2", link: null },
            plain_text: "Line 1\nLine 2",
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
      created_time: "2024-01-01T00:00:00.000Z",
      last_edited_time: "2024-01-01T00:00:00.000Z",
      created_by: { object: "user", id: "user-id" },
      last_edited_by: { object: "user", id: "user-id" },
      has_children: false,
      archived: false,
      in_trash: false,
      parent: { type: "page_id", page_id: "parent-id" },
      children: [],
    },
  ]

  const markdown = fromNotionBlocks(mockBlocks)

  // CRITICAL: Should create properly separated paragraphs with blank line
  expect(markdown).toBe("Line 1\n\nLine 2")
})

test("CRITICAL: Full round-trip conversion should preserve paragraph separation", () => {
  const originalMarkdown = `First paragraph

Second paragraph

Third paragraph`

  // Convert to Notion blocks
  const blocks = toNotionBlocks(originalMarkdown)

  // Should not create empty blocks
  expect(blocks).toHaveLength(3)
  expect(
    blocks.every(
      (block) =>
        block.type === "paragraph" && "paragraph" in block && block.paragraph.rich_text.length > 0,
    ),
  ).toBe(true)

  // Convert back to markdown through mock Notion block structure
  const _mockNotionBlocks = blocks.map((block, index) => ({
    object: "block",
    id: `test-${index}`,
    type: block.type as "paragraph",
    paragraph: block.type === "paragraph" ? block.paragraph : { rich_text: [], color: "default" },
    created_time: "2024-01-01T00:00:00.000Z",
    last_edited_time: "2024-01-01T00:00:00.000Z",
    created_by: { object: "user", id: "user-id" },
    last_edited_by: { object: "user", id: "user-id" },
    has_children: false,
    archived: false,
    in_trash: false,
    parent: { type: "page_id", page_id: "parent-id" },
    children: [],
  }))

  // @ts-expect-error テスト用のモックデータで型が完全に一致しない
  const resultMarkdown = fromNotionBlocks(_mockNotionBlocks)

  // CRITICAL: Should have proper paragraph separation with blank lines
  expect(resultMarkdown).toBe("First paragraph\n\nSecond paragraph\n\nThird paragraph")
})

test("CRITICAL: Empty paragraph blocks should create appropriate spacing", () => {
  const mockBlocksWithEmpty: NotionBlock[] = [
    {
      object: "block",
      id: "test-1",
      type: "paragraph",
      paragraph: {
        icon: null,
        rich_text: [
          {
            type: "text",
            text: { content: "Paragraph 1", link: null },
            plain_text: "Paragraph 1",
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
      created_time: "2024-01-01T00:00:00.000Z",
      last_edited_time: "2024-01-01T00:00:00.000Z",
      created_by: { object: "user", id: "user-id" },
      last_edited_by: { object: "user", id: "user-id" },
      has_children: false,
      archived: false,
      in_trash: false,
      parent: { type: "page_id", page_id: "parent-id" },
      children: [],
    },
    {
      object: "block",
      id: "test-2",
      type: "paragraph",
      paragraph: {
        icon: null,
        rich_text: [], // Empty paragraph block
        color: "default",
      },
      created_time: "2024-01-01T00:00:00.000Z",
      last_edited_time: "2024-01-01T00:00:00.000Z",
      created_by: { object: "user", id: "user-id" },
      last_edited_by: { object: "user", id: "user-id" },
      has_children: false,
      archived: false,
      in_trash: false,
      parent: { type: "page_id", page_id: "parent-id" },
      children: [],
    },
    {
      object: "block",
      id: "test-3",
      type: "paragraph",
      paragraph: {
        icon: null,
        rich_text: [
          {
            type: "text",
            text: { content: "Paragraph 2", link: null },
            plain_text: "Paragraph 2",
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
      created_time: "2024-01-01T00:00:00.000Z",
      last_edited_time: "2024-01-01T00:00:00.000Z",
      created_by: { object: "user", id: "user-id" },
      last_edited_by: { object: "user", id: "user-id" },
      has_children: false,
      archived: false,
      in_trash: false,
      parent: { type: "page_id", page_id: "parent-id" },
      children: [],
    },
  ]

  const markdown = fromNotionBlocks(mockBlocksWithEmpty)

  // CRITICAL: Should handle empty paragraph block as spacing
  expect(markdown).toBe("Paragraph 1\n\nParagraph 2")
})

test("CRITICAL: Kenji Miyazawa style paragraph separation", () => {
  // This is the specific use case that was reported as broken
  const miyazawaText = `あのイーハトーヴォのすきとおった風、夏でも底に冷たさをもつ青いそら、うつくしい森で飾られたモリーオ市、郊外のぎらぎらひかる草の波。

あのイーハトーヴォのすきとおった風、夏でも底に冷たさをもつ青いそら、うつくしい森で飾られたモリーオ市、郊外のぎらぎらひかる草の波。`

  // Convert to Notion blocks
  const blocks = toNotionBlocks(miyazawaText)

  // CRITICAL: Should create exactly 2 paragraph blocks, no empty blocks
  expect(blocks).toHaveLength(2)
  expect(
    blocks.every(
      (block) =>
        block.type === "paragraph" && "paragraph" in block && block.paragraph.rich_text.length > 0,
    ),
  ).toBe(true)

  // Simulate the conversion back through mock Notion blocks
  const _mockNotionBlocks = blocks.map((block, index) => ({
    object: "block",
    id: `miyazawa-${index}`,
    type: block.type as "paragraph",
    paragraph: block.type === "paragraph" ? block.paragraph : { rich_text: [], color: "default" },
    created_time: "2024-01-01T00:00:00.000Z",
    last_edited_time: "2024-01-01T00:00:00.000Z",
    created_by: { object: "user", id: "user-id" },
    last_edited_by: { object: "user", id: "user-id" },
    has_children: false,
    archived: false,
    in_trash: false,
    parent: { type: "page_id", page_id: "parent-id" },
    children: [],
  }))

  // @ts-expect-error テスト用のモックデータで型が完全に一致しない
  const resultMarkdown = fromNotionBlocks(_mockNotionBlocks)

  // CRITICAL: Should maintain the original paragraph separation
  expect(resultMarkdown).toBe(miyazawaText)
})
