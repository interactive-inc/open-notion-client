import { expect, test } from "bun:test"
import type { Tokens } from "marked"
import type { RichTextItemResponse } from "@/types"
import { parseNestedBulletedListItemToken } from "./parse-nested-bulleted-list-item-token"

test("最後のネストされた箇条書きアイテムを変換", () => {
  const item: Tokens.ListItem = {
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

  const result = parseNestedBulletedListItemToken(item)

  expect(result).toEqual({
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
  })
})

test("さらにネストされたリストを含むアイテムを変換", () => {
  const deepNestedItem: Tokens.ListItem = {
    type: "list_item",
    raw: "    - Deep nested",
    task: false,
    checked: undefined,
    loose: false,
    text: "Deep nested",
    tokens: [
      {
        type: "text",
        raw: "Deep nested",
        text: "Deep nested",
      } as Tokens.Text,
    ],
  }

  const item: Tokens.ListItem = {
    type: "list_item",
    raw: "  - Nested with child\n    - Deep nested",
    task: false,
    checked: undefined,
    loose: false,
    text: "Nested with child",
    tokens: [
      {
        type: "text",
        raw: "Nested with child",
        text: "Nested with child",
      } as Tokens.Text,
      {
        type: "list",
        raw: "    - Deep nested",
        ordered: false,
        start: "",
        loose: false,
        items: [deepNestedItem],
      } as Tokens.List,
    ],
  }

  const result = parseNestedBulletedListItemToken(item)

  expect(result).toEqual({
    type: "bulleted_list_item",
    bulleted_list_item: {
      rich_text: [
        {
          type: "text",
          text: { content: "Nested with child" },
          plain_text: "Nested with child",
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
                text: { content: "Deep nested" },
                plain_text: "Deep nested",
                annotations: {},
              } as RichTextItemResponse,
            ],
          },
        },
      ],
    },
  })
})

test("ネストされた番号付きリストを含むアイテムを変換", () => {
  const numberedNestedItem: Tokens.ListItem = {
    type: "list_item",
    raw: "    1. Numbered nested",
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
    raw: "  - Bullet with numbered child\n    1. Numbered nested",
    task: false,
    checked: undefined,
    loose: false,
    text: "Bullet with numbered child",
    tokens: [
      {
        type: "text",
        raw: "Bullet with numbered child",
        text: "Bullet with numbered child",
      } as Tokens.Text,
      {
        type: "list",
        raw: "    1. Numbered nested",
        ordered: true,
        start: 1,
        loose: false,
        items: [numberedNestedItem],
      } as Tokens.List,
    ],
  }

  const result = parseNestedBulletedListItemToken(item)

  expect(result).toEqual({
    type: "bulleted_list_item",
    bulleted_list_item: {
      rich_text: [
        {
          type: "text",
          text: { content: "Bullet with numbered child" },
          plain_text: "Bullet with numbered child",
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

test("テキストトークンがない場合は空の項目を返す", () => {
  const item: Tokens.ListItem = {
    type: "list_item",
    raw: "  - ",
    task: false,
    checked: undefined,
    loose: false,
    text: "",
    tokens: [],
  }

  const result = parseNestedBulletedListItemToken(item)

  expect(result).toEqual({
    type: "bulleted_list_item",
    bulleted_list_item: {
      rich_text: [],
      children: undefined,
    },
  })
})
