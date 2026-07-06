import { expect, test } from "bun:test"
import type { NotionPropertySchema } from "@/types"
import { toNotionProperties } from "./to-notion-properties"

test("スキーマに基づいてプロパティを変換", () => {
  const schema: NotionPropertySchema = {
    title: { type: "title" },
    count: { type: "number" },
  }

  const properties = toNotionProperties(schema, {
    title: "テスト",
    count: 42,
  })

  expect(properties.title).toEqual({
    title: [{ type: "text", text: { content: "テスト" } }],
  })
  expect(properties.count).toEqual({ number: 42 })
})

test("undefinedのフィールドはスキップされる", () => {
  const schema: NotionPropertySchema = {
    title: { type: "title" },
    count: { type: "number" },
  }

  const properties = toNotionProperties(schema, {
    title: "テスト",
  })

  expect(properties.title).toBeDefined()
  expect(properties.count).toBeUndefined()
})

test("読み取り専用プロパティはスキップされる", () => {
  const schema: NotionPropertySchema = {
    title: { type: "title" },
    createdAt: { type: "created_time" },
    createdBy: { type: "created_by" },
    editedAt: { type: "last_edited_time" },
    editedBy: { type: "last_edited_by" },
    calc: { type: "formula", formulaType: "number" },
  }

  const properties = toNotionProperties(schema, {
    title: "テスト",
    createdAt: "2024-01-01",
    createdBy: { id: "u1", name: null, avatarUrl: null, email: null },
    editedAt: "2024-01-01",
    editedBy: { id: "u1", name: null, avatarUrl: null, email: null },
    calc: 100,
  })

  expect(Object.keys(properties)).toEqual(["title"])
})

test("read-modify-writeでnullのtitle/rich_text/checkboxがthrowしない", () => {
  const schema: NotionPropertySchema = {
    title: { type: "title" },
    description: { type: "rich_text" },
    isActive: { type: "checkbox" },
  }

  const properties = toNotionProperties(schema, {
    title: null,
    description: null,
    isActive: null,
  })

  expect(properties.title).toEqual({ title: [] })
  expect(properties.description).toEqual({ rich_text: [] })
  expect(properties.isActive).toEqual({ checkbox: false })
})

test("空のデータは空のオブジェクトを返す", () => {
  const schema: NotionPropertySchema = {
    title: { type: "title" },
  }

  const properties = toNotionProperties(schema, {})

  expect(properties).toEqual({})
})
