import { expect, test } from "vite-plus/test"
import type { Tokens } from "marked"
import type { RichTextItemResponse } from "@/types"
import { parseListToken } from "./parse-list-token"

test("箇条書きリストを変換", () => {
  const token: Tokens.List = {
    type: "list",
    raw: "- Item 1\n- Item 2\n- Item 3",
    ordered: false,
    start: "",
    loose: false,
    items: [
      {
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
      },
      {
        type: "list_item",
        raw: "- Item 2",
        task: false,
        checked: undefined,
        loose: false,
        text: "Item 2",
        tokens: [
          {
            type: "text",
            raw: "Item 2",
            text: "Item 2",
          } as Tokens.Text,
        ],
      },
      {
        type: "list_item",
        raw: "- Item 3",
        task: false,
        checked: undefined,
        loose: false,
        text: "Item 3",
        tokens: [
          {
            type: "text",
            raw: "Item 3",
            text: "Item 3",
          } as Tokens.Text,
        ],
      },
    ],
  }

  const result = parseListToken(token)

  expect(result).toEqual([
    {
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
    },
    {
      type: "bulleted_list_item",
      bulleted_list_item: {
        rich_text: [
          {
            type: "text",
            text: { content: "Item 2" },
            plain_text: "Item 2",
            annotations: {},
          } as RichTextItemResponse,
        ],
        children: undefined,
      },
    },
    {
      type: "bulleted_list_item",
      bulleted_list_item: {
        rich_text: [
          {
            type: "text",
            text: { content: "Item 3" },
            plain_text: "Item 3",
            annotations: {},
          } as RichTextItemResponse,
        ],
        children: undefined,
      },
    },
  ])
})

test("番号付きリストを変換", () => {
  const token: Tokens.List = {
    type: "list",
    raw: "1. First\n2. Second\n3. Third",
    ordered: true,
    start: 1,
    loose: false,
    items: [
      {
        type: "list_item",
        raw: "1. First",
        task: false,
        checked: undefined,
        loose: false,
        text: "First",
        tokens: [
          {
            type: "text",
            raw: "First",
            text: "First",
          } as Tokens.Text,
        ],
      },
      {
        type: "list_item",
        raw: "2. Second",
        task: false,
        checked: undefined,
        loose: false,
        text: "Second",
        tokens: [
          {
            type: "text",
            raw: "Second",
            text: "Second",
          } as Tokens.Text,
        ],
      },
      {
        type: "list_item",
        raw: "3. Third",
        task: false,
        checked: undefined,
        loose: false,
        text: "Third",
        tokens: [
          {
            type: "text",
            raw: "Third",
            text: "Third",
          } as Tokens.Text,
        ],
      },
    ],
  }

  const result = parseListToken(token)

  expect(result).toEqual([
    {
      type: "numbered_list_item",
      numbered_list_item: {
        rich_text: [
          {
            type: "text",
            text: { content: "First" },
            plain_text: "First",
            annotations: {},
          } as RichTextItemResponse,
        ],
        children: undefined,
      },
    },
    {
      type: "numbered_list_item",
      numbered_list_item: {
        rich_text: [
          {
            type: "text",
            text: { content: "Second" },
            plain_text: "Second",
            annotations: {},
          } as RichTextItemResponse,
        ],
        children: undefined,
      },
    },
    {
      type: "numbered_list_item",
      numbered_list_item: {
        rich_text: [
          {
            type: "text",
            text: { content: "Third" },
            plain_text: "Third",
            annotations: {},
          } as RichTextItemResponse,
        ],
        children: undefined,
      },
    },
  ])
})

test("空のリストを変換", () => {
  const token: Tokens.List = {
    type: "list",
    raw: "",
    ordered: false,
    start: "",
    loose: false,
    items: [],
  }

  const result = parseListToken(token)

  expect(result).toEqual([])
})

test("ネストを含むリストを変換", () => {
  const nestedItem: Tokens.ListItem = {
    type: "list_item",
    raw: "  - Nested",
    task: false,
    checked: undefined,
    loose: false,
    text: "Nested",
    tokens: [
      {
        type: "text",
        raw: "Nested",
        text: "Nested",
      } as Tokens.Text,
    ],
  }

  const token: Tokens.List = {
    type: "list",
    raw: "- Parent\n  - Nested",
    ordered: false,
    start: "",
    loose: false,
    items: [
      {
        type: "list_item",
        raw: "- Parent\n  - Nested",
        task: false,
        checked: undefined,
        loose: false,
        text: "Parent",
        tokens: [
          {
            type: "text",
            raw: "Parent",
            text: "Parent",
          } as Tokens.Text,
          {
            type: "list",
            raw: "  - Nested",
            ordered: false,
            start: "",
            loose: false,
            items: [nestedItem],
          } as Tokens.List,
        ],
      },
    ],
  }

  const result = parseListToken(token)

  expect(result).toEqual([
    {
      type: "bulleted_list_item",
      bulleted_list_item: {
        rich_text: [
          {
            type: "text",
            text: { content: "Parent" },
            plain_text: "Parent",
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
                  text: { content: "Nested" },
                  plain_text: "Nested",
                  annotations: {},
                } as RichTextItemResponse,
              ],
            },
          },
        ],
      },
    },
  ])
})
