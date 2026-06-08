import { expect, test } from "bun:test"
import type {
  PageObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints"
import type { NotionPropertySchema } from "@/types"
import { NotionPropertyConverter } from "./notion-property-converter"

const converter = new NotionPropertyConverter()

// ヘルパー関数：完全なRichTextItemResponseを作成
function createRichTextItem(content: string): RichTextItemResponse {
  return {
    type: "text",
    text: { content, link: null },
    plain_text: content,
    annotations: {
      bold: false,
      italic: false,
      strikethrough: false,
      underline: false,
      code: false,
      color: "default",
    },
    href: null,
  }
}

test("fromNotion: スキーマに基づいてプロパティを変換", () => {
  const schema: NotionPropertySchema = {
    title: { type: "title" },
    content: { type: "rich_text" },
    score: { type: "number" },
    completed: { type: "checkbox" },
  }

  const properties: PageObjectResponse["properties"] = {
    title: {
      id: "title-id",
      type: "title",
      title: [createRichTextItem("テストタイトル")],
    },
    content: {
      id: "content-id",
      type: "rich_text",
      rich_text: [createRichTextItem("テキスト内容")],
    },
    score: {
      id: "score-id",
      type: "number",
      number: 85,
    },
    completed: {
      id: "completed-id",
      type: "checkbox",
      checkbox: true,
    },
  }

  const result = converter.fromNotion(schema, properties)

  expect(result.title).toBe("テストタイトル")
  expect(result.content).toBe("テキスト内容")
  expect(result.score).toBe(85)
  expect(result.completed).toBe(true)
})

test("fromNotion: オプショナルなプロパティが存在しない場合", () => {
  const schema: NotionPropertySchema = {
    title: { type: "title" },
    description: { type: "rich_text" },
  }

  const properties: PageObjectResponse["properties"] = {
    title: {
      id: "title-id",
      type: "title",
      title: [createRichTextItem("タイトルのみ")],
    },
  }

  const result = converter.fromNotion(schema, properties)

  expect(result.title).toBe("タイトルのみ")
  expect(result.description).toBeNull()
})

test("toNotion: スキーマに基づいてデータを変換", () => {
  const schema: NotionPropertySchema = {
    title: { type: "title" },
    content: { type: "rich_text" },
    score: { type: "number" },
    completed: { type: "checkbox" },
  }

  const data = {
    title: "新しいタイトル",
    content: "新しい内容",
    score: 95,
    completed: false,
  }

  const result = converter.toNotion(schema, data)

  expect(result.title).toEqual({
    title: [{ type: "text", text: { content: "新しいタイトル" } }],
  })
  expect(result.content).toEqual({
    rich_text: [{ type: "text", text: { content: "新しい内容" } }],
  })
  expect(result.score).toEqual({ number: 95 })
  expect(result.completed).toEqual({ checkbox: false })
})

test("toNotion: 部分的なデータを変換", () => {
  const schema: NotionPropertySchema = {
    title: { type: "title" },
    content: { type: "rich_text" },
    score: { type: "number" },
  }

  const data = {
    title: "タイトルのみ更新",
  }

  const result = converter.toNotion(schema, data)

  expect(result.title).toEqual({
    title: [{ type: "text", text: { content: "タイトルのみ更新" } }],
  })
  expect(result.content).toBeUndefined()
  expect(result.score).toBeUndefined()
})

test("toNotion: 日付プロパティを正しく変換", () => {
  const schema: NotionPropertySchema = {
    deadline: { type: "date" },
  }

  const data = {
    deadline: { start: "2024-01-15", end: "2024-01-20", timeZone: null },
  }

  const result = converter.toNotion(schema, data)

  expect(result.deadline).toEqual({
    date: {
      start: "2024-01-15",
      end: "2024-01-20",
      time_zone: null,
    },
  })
})

test("toNotion: 複数選択プロパティを正しく変換", () => {
  const schema: NotionPropertySchema = {
    tags: { type: "multi_select", options: ["TypeScript", "Notion", "テスト"] },
  }

  const data = {
    tags: ["TypeScript", "Notion", "テスト"],
  }

  const result = converter.toNotion(schema, data)

  expect(result.tags).toEqual({
    multi_select: [{ name: "TypeScript" }, { name: "Notion" }, { name: "テスト" }],
  })
})

test("型安全性の確認", () => {
  const articleSchema: NotionPropertySchema = {
    title: { type: "title" },
    author: { type: "rich_text" },
    publishedDate: { type: "date" },
    isPublished: { type: "checkbox" },
    tags: { type: "multi_select", options: ["技術"] },
  }

  const properties: PageObjectResponse["properties"] = {
    title: {
      id: "title-id",
      type: "title",
      title: [createRichTextItem("記事タイトル")],
    },
    author: {
      id: "author-id",
      type: "rich_text",
      rich_text: [createRichTextItem("著者名")],
    },
    publishedDate: {
      id: "date-id",
      type: "date",
      date: { start: "2024-01-01", end: null, time_zone: null },
    },
    isPublished: {
      id: "published-id",
      type: "checkbox",
      checkbox: true,
    },
    tags: {
      id: "tags-id",
      type: "multi_select",
      multi_select: [{ id: "tag1", name: "技術", color: "blue" }],
    },
  }

  const result = converter.fromNotion(articleSchema, properties)

  // 型推論によって適切な型が設定されることを確認
  expect(typeof result.title).toBe("string")
  expect(typeof result.author).toBe("string")
  expect(typeof result.isPublished).toBe("boolean")
  expect(Array.isArray(result.tags)).toBe(true)
  expect(result.publishedDate).toEqual({
    start: "2024-01-01",
    end: null,
    timeZone: null,
  })
})

test("クラスのインスタンス化", () => {
  const converter1 = new NotionPropertyConverter()
  const converter2 = new NotionPropertyConverter()

  // 異なるインスタンスであることを確認
  expect(converter1).not.toBe(converter2)

  // 同じメソッドを持つことを確認
  expect(typeof converter1.fromNotion).toBe("function")
  expect(typeof converter1.toNotion).toBe("function")
  expect(typeof converter2.fromNotion).toBe("function")
  expect(typeof converter2.toNotion).toBe("function")
})
