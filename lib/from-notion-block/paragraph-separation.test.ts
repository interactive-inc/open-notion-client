import { expect, test } from "bun:test"
import type { NotionBlock } from "@/types"
import { fromNotionBlocks } from "./from-notion-blocks"

/**
 * CRITICAL TESTS for fromNotionBlocks paragraph separation behavior
 *
 * These tests ensure that paragraph blocks with internal newlines are properly
 * converted to separate paragraphs in markdown, which is essential for correct
 * display in Notion when the markdown is converted back to blocks.
 *
 * DO NOT MODIFY THESE TESTS WITHOUT UNDERSTANDING THE PARAGRAPH SEPARATION REQUIREMENTS
 */

test("CRITICAL: Internal newlines in paragraph blocks must be converted to paragraph breaks", () => {
  const mockBlock: NotionBlock = {
    object: "block",
    id: "test-id",
    type: "paragraph",
    paragraph: {
      icon: null,
      rich_text: [
        {
          type: "text",
          text: { content: "First line\nSecond line\nThird line", link: null },
          plain_text: "First line\nSecond line\nThird line",
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
  }

  const result = fromNotionBlocks([mockBlock])

  // CRITICAL: Each line should become a separate paragraph with blank lines between
  expect(result).toBe("First line\n\nSecond line\n\nThird line")
})

test("CRITICAL: Paragraph blocks without internal newlines should remain as single paragraphs", () => {
  const mockBlock: NotionBlock = {
    object: "block",
    id: "test-id",
    type: "paragraph",
    paragraph: {
      icon: null,
      rich_text: [
        {
          type: "text",
          text: { content: "Single line paragraph", link: null },
          plain_text: "Single line paragraph",
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
  }

  const result = fromNotionBlocks([mockBlock])

  // Should remain as single paragraph
  expect(result).toBe("Single line paragraph")
})

test("CRITICAL: Multiple paragraph blocks should have proper spacing", () => {
  const mockBlocks: NotionBlock[] = [
    {
      object: "block",
      id: "test-1",
      type: "paragraph",
      paragraph: {
        icon: null,
        rich_text: [
          {
            type: "text",
            text: { content: "First paragraph", link: null },
            plain_text: "First paragraph",
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
        rich_text: [
          {
            type: "text",
            text: { content: "Second paragraph", link: null },
            plain_text: "Second paragraph",
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

  const result = fromNotionBlocks(mockBlocks)

  // CRITICAL: Should have blank line between paragraphs
  expect(result).toBe("First paragraph\n\nSecond paragraph")
})

test("CRITICAL: Mixed paragraph blocks with and without internal newlines", () => {
  const mockBlocks: NotionBlock[] = [
    {
      object: "block",
      id: "test-1",
      type: "paragraph",
      paragraph: {
        icon: null,
        rich_text: [
          {
            type: "text",
            text: { content: "Normal paragraph", link: null },
            plain_text: "Normal paragraph",
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
        rich_text: [
          {
            type: "text",
            text: { content: "Multi-line\nparagraph", link: null },
            plain_text: "Multi-line\nparagraph",
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
      id: "test-3",
      type: "paragraph",
      paragraph: {
        icon: null,
        rich_text: [
          {
            type: "text",
            text: { content: "Final paragraph", link: null },
            plain_text: "Final paragraph",
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

  const result = fromNotionBlocks(mockBlocks)

  // CRITICAL: Should properly handle mixed scenarios
  expect(result).toBe("Normal paragraph\n\nMulti-line\n\nparagraph\n\nFinal paragraph")
})
