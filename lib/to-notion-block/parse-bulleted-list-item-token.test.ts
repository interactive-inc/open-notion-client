import { expect, test } from "bun:test"
import { lexer, type Tokens } from "marked"
import type { RichTextItemResponse } from "@/types"
import { parseBulletedListItemToken } from "./parse-bulleted-list-item-token"

test("シンプルな箇条書きアイテムを変換", () => {
  const item: Tokens.ListItem = {
    type: "list_item",
    raw: "- Item 1",
    task: false,
    checked: undefined,
    loose: false,
    text: "Item 1",
    tokens: [
      {
        type: "text",
        raw: "Item 1",
        text: "Item 1",
      } as Tokens.Text,
    ],
  }

  const result = parseBulletedListItemToken(item)

  expect(result).toEqual({
    type: "bulleted_list_item",
    bulleted_list_item: {
      rich_text: [
        {
          type: "text",
          text: { content: "Item 1" },
          plain_text: "Item 1",
          annotations: {},
        } as RichTextItemResponse,
      ],
      children: undefined,
    },
  })
})

test("ネストされた箇条書きを含むアイテムを変換", () => {
  const nestedItem: Tokens.ListItem = {
    type: "list_item",
    raw: "  - Nested item",
    task: false,
    checked: undefined,
    loose: false,
    text: "Nested item",
    tokens: [
      {
        type: "text",
        raw: "Nested item",
        text: "Nested item",
      } as Tokens.Text,
    ],
  }

  const item: Tokens.ListItem = {
    type: "list_item",
    raw: "- Parent item\n  - Nested item",
    task: false,
    checked: undefined,
    loose: false,
    text: "Parent item",
    tokens: [
      {
        type: "text",
        raw: "Parent item",
        text: "Parent item",
      } as Tokens.Text,
      {
        type: "list",
        raw: "  - Nested item",
        ordered: false,
        start: "",
        loose: false,
        items: [nestedItem],
      } as Tokens.List,
    ],
  }

  const result = parseBulletedListItemToken(item)

  expect(result).toEqual({
    type: "bulleted_list_item",
    bulleted_list_item: {
      rich_text: [
        {
          type: "text",
          text: { content: "Parent item" },
          plain_text: "Parent item",
          annotations: {},
        } as RichTextItemResponse,
      ],
      children: [
        {
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [
              {
                type: "text",
                text: { content: "Nested item" },
                plain_text: "Nested item",
                annotations: {},
              } as RichTextItemResponse,
            ],
          },
        },
      ],
    },
  })
})

test("太字を含む箇条書きアイテムを変換", () => {
  const item: Tokens.ListItem = {
    type: "list_item",
    raw: "- **Bold** item",
    task: false,
    checked: undefined,
    loose: false,
    text: "Bold item",
    tokens: [
      {
        type: "text",
        raw: "**Bold** item",
        text: "Bold item",
        tokens: [
          {
            type: "strong",
            raw: "**Bold**",
            text: "Bold",
            tokens: [
              {
                type: "text",
                raw: "Bold",
                text: "Bold",
              } as Tokens.Text,
            ],
          } as Tokens.Strong,
          {
            type: "text",
            raw: " item",
            text: " item",
          } as Tokens.Text,
        ],
      } as Tokens.Text,
    ],
  }

  const result = parseBulletedListItemToken(item)

  expect(result).toEqual({
    type: "bulleted_list_item",
    bulleted_list_item: {
      rich_text: [
        {
          type: "text",
          text: { content: "Bold" },
          plain_text: "Bold",
          annotations: { bold: true },
        } as RichTextItemResponse,
        {
          type: "text",
          text: { content: " item" },
          plain_text: " item",
          annotations: {},
        } as RichTextItemResponse,
      ],
      children: undefined,
    },
  })
})

test("テキストトークンがない場合は空の項目を返す", () => {
  const item: Tokens.ListItem = {
    type: "list_item",
    raw: "- ",
    task: false,
    checked: undefined,
    loose: false,
    text: "",
    tokens: [],
  }

  const result = parseBulletedListItemToken(item)

  expect(result).toEqual({
    type: "bulleted_list_item",
    bulleted_list_item: {
      rich_text: [],
      children: undefined,
    },
  })
})

test("番号付きリストが混在するネストを変換", () => {
  const nestedItem: Tokens.ListItem = {
    type: "list_item",
    raw: "  1. Numbered nested",
    task: false,
    checked: undefined,
    loose: false,
    text: "Numbered nested",
    tokens: [
      {
        type: "text",
        raw: "Numbered nested",
        text: "Numbered nested",
      } as Tokens.Text,
    ],
  }

  const item: Tokens.ListItem = {
    type: "list_item",
    raw: "- Bullet parent\n  1. Numbered nested",
    task: false,
    checked: undefined,
    loose: false,
    text: "Bullet parent",
    tokens: [
      {
        type: "text",
        raw: "Bullet parent",
        text: "Bullet parent",
      } as Tokens.Text,
      {
        type: "list",
        raw: "  1. Numbered nested",
        ordered: true,
        start: 1,
        loose: false,
        items: [nestedItem],
      } as Tokens.List,
    ],
  }

  const result = parseBulletedListItemToken(item)

  expect(result).toEqual({
    type: "bulleted_list_item",
    bulleted_list_item: {
      rich_text: [
        {
          type: "text",
          text: { content: "Bullet parent" },
          plain_text: "Bullet parent",
          annotations: {},
        } as RichTextItemResponse,
      ],
      children: [
        {
          type: "numbered_list_item",
          numbered_list_item: {
            rich_text: [
              {
                type: "text",
                text: { content: "Numbered nested" },
                plain_text: "Numbered nested",
                annotations: {},
              } as RichTextItemResponse,
            ],
          },
        },
      ],
    },
  })
})

test("taskアイテムをto_doブロックに変換", () => {
  const listToken = lexer("- [x] 完了タスク")[0] as Tokens.List

  const item = listToken.items[0] as Tokens.ListItem

  const block = parseBulletedListItemToken(item) as unknown as {
    type: string
    to_do: { rich_text: Array<{ text: { content: string } }>; checked: boolean }
  }

  expect(block.type).toBe("to_do")
  expect(block.to_do.checked).toBe(true)
  expect(block.to_do.rich_text[0]?.text.content).toBe("完了タスク")
})

test("未チェックのtaskアイテムはchecked: falseになる", () => {
  const listToken = lexer("- [ ] 未完了タスク")[0] as Tokens.List

  const item = listToken.items[0] as Tokens.ListItem

  const block = parseBulletedListItemToken(item) as unknown as {
    type: string
    to_do: { rich_text: Array<{ text: { content: string } }>; checked: boolean }
  }

  expect(block.type).toBe("to_do")
  expect(block.to_do.checked).toBe(false)
  expect(block.to_do.rich_text[0]?.text.content).toBe("未完了タスク")
})
