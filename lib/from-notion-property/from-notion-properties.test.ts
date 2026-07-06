import { expect, test } from "bun:test"
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import type { NotionPropertySchema } from "@/types"
import { fromNotionProperties } from "./from-notion-properties"

test("スキーマに基づいてプロパティを変換", () => {
  const schema: NotionPropertySchema = {
    title: { type: "title" },
    description: { type: "rich_text" },
    price: { type: "number" },
    isActive: { type: "checkbox" },
  }

  const properties: PageObjectResponse["properties"] = {
    title: {
      type: "title",
      title: [
        {
          type: "text",
          text: { content: "商品A", link: null },
          plain_text: "商品A",
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
      id: "title",
    },
    description: {
      type: "rich_text",
      rich_text: [
        {
          type: "text",
          text: { content: "説明文", link: null },
          plain_text: "説明文",
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
      id: "desc",
    },
    price: {
      type: "number",
      number: 1000,
      id: "price",
    },
    isActive: {
      type: "checkbox",
      checkbox: true,
      id: "active",
    },
  }

  const result = fromNotionProperties(schema, properties)
  expect(result).toEqual({
    title: "商品A",
    description: "説明文",
    price: 1000,
    isActive: true,
  })
})

test("オプショナルなプロパティが存在しない場合", () => {
  const schema: NotionPropertySchema = {
    title: { type: "title" },
    description: { type: "rich_text" },
  }

  const properties: PageObjectResponse["properties"] = {
    title: {
      type: "title",
      title: [
        {
          type: "text",
          text: { content: "タイトルのみ", link: null },
          plain_text: "タイトルのみ",
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
      id: "title",
    },
  }

  const result = fromNotionProperties(schema, properties)
  expect(result).toEqual({
    title: "タイトルのみ",
    description: null,
  })
})

test("プロパティタイプが一致しない場合はエラー", () => {
  const schema: NotionPropertySchema = {
    title: { type: "title" },
  }

  const properties: PageObjectResponse["properties"] = {
    title: {
      type: "number",
      number: 123,
      id: "title",
    },
  }

  expect(() => fromNotionProperties(schema, properties)).toThrow(
    "プロパティ title の型が一致しません。期待: title, 実際: number",
  )
})

test("formulaの宣言型と実際の結果型が一致しない場合はエラー", () => {
  const schema: NotionPropertySchema = {
    calc: { type: "formula", formulaType: "number" },
  }

  const properties: PageObjectResponse["properties"] = {
    calc: {
      type: "formula",
      formula: { type: "string", string: "not-a-number" },
      id: "calc",
    },
  }

  expect(() => fromNotionProperties(schema, properties)).toThrow(
    "formulaの結果型が一致しません。期待: number, 実際: string",
  )
})

test("formulaの宣言型と実際の結果型が一致する場合は変換される", () => {
  const schema: NotionPropertySchema = {
    calc: { type: "formula", formulaType: "number" },
  }

  const properties: PageObjectResponse["properties"] = {
    calc: {
      type: "formula",
      formula: { type: "number", number: 42 },
      id: "calc",
    },
  }

  const result = fromNotionProperties(schema, properties)
  expect(result).toEqual({ calc: 42 })
})

test("複数のプロパティタイプを含むスキーマを変換", () => {
  const schema: NotionPropertySchema = {
    name: { type: "title" },
    tags: { type: "multi_select", options: null },
    status: { type: "select", options: ["進行中", "完了", "未着手"] },
    deadline: { type: "date" },
  }

  const properties: PageObjectResponse["properties"] = {
    name: {
      type: "title",
      title: [
        {
          type: "text",
          text: { content: "タスク1", link: null },
          plain_text: "タスク1",
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
      id: "name",
    },
    tags: {
      type: "multi_select",
      multi_select: [
        { id: "1", name: "重要", color: "red" },
        { id: "2", name: "緊急", color: "orange" },
      ],
      id: "tags",
    },
    status: {
      type: "select",
      select: {
        id: "1",
        name: "進行中",
        color: "blue",
      },
      id: "status",
    },
    deadline: {
      type: "date",
      date: {
        start: "2023-12-31",
        end: null,
        time_zone: null,
      },
      id: "deadline",
    },
  }

  const result = fromNotionProperties(schema, properties)
  expect(result).toEqual({
    name: "タスク1",
    tags: ["重要", "緊急"],
    status: "進行中",
    deadline: {
      start: "2023-12-31",
      end: null,
      timeZone: null,
    },
  })
})
