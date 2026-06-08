import { expect, test } from "bun:test"
import type { Tokens } from "marked"
import type { RichTextItemResponse } from "@/types"
import { parseNestedNumberedListItemToken } from "./parse-nested-numbered-list-item-token"

test("最後のネストされた番号付きアイテムを変換", () => {
  const item: Tokens.ListItem = {
    type: "list_item",
    raw: "   1. Nested numbered",
    task: false,
    checked: undefined,
    loose: false,
    text: "Nested numbered",
    tokens: [
      {
        type: "text",
        raw: "Nested numbered",
        text: "Nested numbered",
      } as Tokens.Text,
    ],
  }

  const result = parseNestedNumberedListItemToken(item)

  expect(result).toEqual({
    type: "numbered_list_item",
    numbered_list_item: {
      rich_text: [
        {
          type: "text",
          text: { content: "Nested numbered" },
          plain_text: "Nested numbered",
          annotations: {},
        } as RichTextItemResponse,
      ],
    },
  })
})

test("さらにネストされた番号付きリストを含むアイテムを変換", () => {
  const deepNestedItem: Tokens.ListItem = {
    type: "list_item",
    raw: "      1. Deep nested numbered",
    task: false,
    checked: undefined,
    loose: false,
    text: "Deep nested numbered",
    tokens: [
      {
        type: "text",
        raw: "Deep nested numbered",
        text: "Deep nested numbered",
      } as Tokens.Text,
    ],
  }

  const item: Tokens.ListItem = {
    type: "list_item",
    raw: "   1. Nested with child\n      1. Deep nested numbered",
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
        raw: "      1. Deep nested numbered",
        ordered: true,
        start: 1,
        loose: false,
        items: [deepNestedItem],
      } as Tokens.List,
    ],
  }

  const result = parseNestedNumberedListItemToken(item)

  expect(result).toEqual({
    type: "numbered_list_item",
    numbered_list_item: {
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
          type: "numbered_list_item",
          numbered_list_item: {
            rich_text: [
              {
                type: "text",
                text: { content: "Deep nested numbered" },
                plain_text: "Deep nested numbered",
                annotations: {},
              } as RichTextItemResponse,
            ],
          },
        },
      ],
    },
  })
})

test("ネストされた箇条書きリストを含むアイテムを変換", () => {
  const bulletNestedItem: Tokens.ListItem = {
    type: "list_item",
    raw: "      - Bullet nested",
    task: false,
    checked: undefined,
    loose: false,
    text: "Bullet nested",
    tokens: [
      {
        type: "text",
        raw: "Bullet nested",
        text: "Bullet nested",
      } as Tokens.Text,
    ],
  }

  const item: Tokens.ListItem = {
    type: "list_item",
    raw: "   1. Numbered with bullet child\n      - Bullet nested",
    task: false,
    checked: undefined,
    loose: false,
    text: "Numbered with bullet child",
    tokens: [
      {
        type: "text",
        raw: "Numbered with bullet child",
        text: "Numbered with bullet child",
      } as Tokens.Text,
      {
        type: "list",
        raw: "      - Bullet nested",
        ordered: false,
        start: "",
        loose: false,
        items: [bulletNestedItem],
      } as Tokens.List,
    ],
  }

  const result = parseNestedNumberedListItemToken(item)

  expect(result).toEqual({
    type: "numbered_list_item",
    numbered_list_item: {
      rich_text: [
        {
          type: "text",
          text: { content: "Numbered with bullet child" },
          plain_text: "Numbered with bullet child",
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
                text: { content: "Bullet nested" },
                plain_text: "Bullet nested",
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
    raw: "   1. ",
    task: false,
    checked: undefined,
    loose: false,
    text: "",
    tokens: [],
  }

  const result = parseNestedNumberedListItemToken(item)

  expect(result).toEqual({
    type: "numbered_list_item",
    numbered_list_item: {
      rich_text: [],
      children: undefined,
    },
  })
})
