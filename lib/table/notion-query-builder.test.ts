import { expect, test } from "bun:test"
import type { NotionPropertySchema } from "@/types"
import { NotionQueryBuilder } from "./notion-query-builder"

const queryBuilder = new NotionQueryBuilder()

test("buildFilter: 単純な条件", () => {
  const schema: NotionPropertySchema = {
    title: { type: "title" },
    status: { type: "select", options: ["todo", "done"] },
    priority: { type: "number" },
  }

  // タイトルの完全一致
  const titleFilter = queryBuilder.buildFilter(schema, {
    title: "検索語",
  })
  expect(titleFilter).toEqual({
    property: "title",
    title: { equals: "検索語" },
  })

  // 選択肢の完全一致
  const selectFilter = queryBuilder.buildFilter(schema, {
    status: "todo",
  })
  expect(selectFilter).toEqual({
    property: "status",
    select: { equals: "todo" },
  })

  // 数値の完全一致
  const numberFilter = queryBuilder.buildFilter(schema, {
    priority: 5,
  })
  expect(numberFilter).toEqual({
    property: "priority",
    number: { equals: 5 },
  })
})

test("buildFilter: 複数条件（AND）", () => {
  const schema: NotionPropertySchema = {
    title: { type: "title" },
    status: { type: "select", options: ["todo", "done"] },
  }

  const filter = queryBuilder.buildFilter(schema, {
    title: "タスク",
    status: "todo",
  })

  expect(filter).toEqual({
    and: [
      { property: "title", title: { equals: "タスク" } },
      { property: "status", select: { equals: "todo" } },
    ],
  })
})

test("buildFilter: or条件", () => {
  const schema = {
    status: { type: "select", options: ["todo", "in_progress", "done"] },
    priority: { type: "number" },
  } as const

  const filter = queryBuilder.buildFilter(schema, {
    or: [{ status: "todo" }, { priority: 5 }],
  })

  expect(filter).toEqual({
    or: [
      { property: "status", select: { equals: "todo" } },
      { property: "priority", number: { equals: 5 } },
    ],
  })
})

test("buildFilter: and条件", () => {
  const schema = {
    status: { type: "select", options: ["todo", "done"] },
    priority: { type: "number" },
  } as const

  const filter = queryBuilder.buildFilter(schema, {
    and: [{ status: "todo" }, { priority: 5 }],
  })

  expect(filter).toEqual({
    and: [
      { property: "status", select: { equals: "todo" } },
      { property: "priority", number: { equals: 5 } },
    ],
  })
})

test("buildFilter: Notion API filter format", () => {
  const schema: NotionPropertySchema = {
    priority: { type: "number" },
    deadline: { type: "date" },
  }

  // 数値の比較演算子
  const gtFilter = queryBuilder.buildFilter(schema, {
    priority: { greater_than: 3 },
  })
  expect(gtFilter).toEqual({
    property: "priority",
    number: { greater_than: 3 },
  })

  const gteFilter = queryBuilder.buildFilter(schema, {
    priority: { greater_than_or_equal_to: 3 },
  })
  expect(gteFilter).toEqual({
    property: "priority",
    number: { greater_than_or_equal_to: 3 },
  })

  const ltFilter = queryBuilder.buildFilter(schema, {
    priority: { less_than: 5 },
  })
  expect(ltFilter).toEqual({
    property: "priority",
    number: { less_than: 5 },
  })

  const lteFilter = queryBuilder.buildFilter(schema, {
    priority: { less_than_or_equal_to: 5 },
  })
  expect(lteFilter).toEqual({
    property: "priority",
    number: { less_than_or_equal_to: 5 },
  })

  // 日付の比較演算子
  const dateAfterFilter = queryBuilder.buildFilter(schema, {
    deadline: { after: "2024-01-01" },
  })
  expect(dateAfterFilter).toEqual({
    property: "deadline",
    date: { after: "2024-01-01" },
  })
})

test("buildFilter: contains演算子", () => {
  const schema: NotionPropertySchema = {
    title: { type: "title" },
    description: { type: "rich_text" },
    tags: { type: "multi_select", options: ["js", "ts", "react"] },
  }

  // タイトルの部分一致
  const titleContains = queryBuilder.buildFilter(schema, {
    title: { contains: "検索" },
  })
  expect(titleContains).toEqual({
    property: "title",
    title: { contains: "検索" },
  })

  // リッチテキストの部分一致
  const richTextContains = queryBuilder.buildFilter(schema, {
    description: { contains: "説明" },
  })
  expect(richTextContains).toEqual({
    property: "description",
    rich_text: { contains: "説明" },
  })

  // 複数選択の包含
  const multiSelectContains = queryBuilder.buildFilter(schema, {
    tags: "js",
  })
  expect(multiSelectContains).toEqual({
    property: "tags",
    multi_select: { contains: "js" },
  })
})

test("buildFilter: 複数選択肢のor条件", () => {
  const schema: NotionPropertySchema = {
    status: { type: "select", options: ["todo", "in_progress", "done"] },
  }

  const filter = queryBuilder.buildFilter(schema, {
    or: [{ status: "todo" }, { status: "in_progress" }],
  })

  expect(filter).toEqual({
    or: [
      { property: "status", select: { equals: "todo" } },
      { property: "status", select: { equals: "in_progress" } },
    ],
  })
})

test("buildFilter: does_not_equal演算子", () => {
  const schema: NotionPropertySchema = {
    status: { type: "select", options: ["todo", "done"] },
  }

  const filter = queryBuilder.buildFilter(schema, {
    status: { does_not_equal: "done" },
  })

  expect(filter).toEqual({
    property: "status",
    select: { does_not_equal: "done" },
  })
})

test("buildFilter: 複雑な条件の組み合わせ", () => {
  const schema = {
    title: { type: "title" },
    status: { type: "select", options: ["todo", "in_progress", "done"] },
    priority: { type: "number" },
  } as const

  const filter = queryBuilder.buildFilter(schema, {
    or: [
      { status: "todo" },
      {
        and: [{ priority: { greater_than_or_equal_to: 5 } }, { title: { contains: "重要" } }],
      },
    ],
  })

  expect(filter).toEqual({
    or: [
      { property: "status", select: { equals: "todo" } },
      {
        and: [
          { property: "priority", number: { greater_than_or_equal_to: 5 } },
          { property: "title", title: { contains: "重要" } },
        ],
      },
    ],
  })
})

test("buildFilter: フォーミュラ型のフィルター", () => {
  const schema: NotionPropertySchema = {
    calculated: { type: "formula", formulaType: "number" },
    status: { type: "formula", formulaType: "string" },
    isActive: { type: "formula", formulaType: "boolean" },
  }

  // 数値フォーミュラ
  const numberFormula = queryBuilder.buildFilter(schema, {
    calculated: 100,
  })
  expect(numberFormula).toEqual({
    property: "calculated",
    formula: { number: { equals: 100 } },
  })

  // 文字列フォーミュラ
  const stringFormula = queryBuilder.buildFilter(schema, {
    status: "active",
  })
  expect(stringFormula).toEqual({
    property: "status",
    formula: { string: { equals: "active" } },
  })

  // 真偽値フォーミュラ
  const booleanFormula = queryBuilder.buildFilter(schema, {
    isActive: true,
  })
  expect(booleanFormula).toEqual({
    property: "isActive",
    formula: { checkbox: { equals: true } },
  })
})

test("buildFilter: 空の条件", () => {
  const schema: NotionPropertySchema = {
    title: { type: "title" },
  }

  const filter = queryBuilder.buildFilter(schema, {})
  expect(filter).toBeUndefined()
})

test("buildSort: ソート条件の変換", () => {
  const _schema: NotionPropertySchema = {
    title: { type: "title" },
    priority: { type: "number" },
  }

  // 単一ソート
  const singleSort = queryBuilder.buildSort([{ field: "priority", direction: "desc" }])
  expect(singleSort).toEqual([{ property: "priority", direction: "descending" }])

  // 複数ソート
  const multiSort = queryBuilder.buildSort([
    { field: "priority", direction: "desc" },
    { field: "title", direction: "asc" },
  ])
  expect(multiSort).toEqual([
    { property: "priority", direction: "descending" },
    { property: "title", direction: "ascending" },
  ])
})

test("buildFilter: 日付型の様々な形式", () => {
  const schema: NotionPropertySchema = {
    deadline: { type: "date" },
  }

  // DateRange型
  const dateRangeFilter = queryBuilder.buildFilter(schema, {
    deadline: { start: "2024-01-01T00:00:00Z", end: null, timeZone: null },
  })
  expect(dateRangeFilter).toEqual({
    property: "deadline",
    date: { equals: "2024-01-01" },
  })

  // Date型
  const dateFilter = queryBuilder.buildFilter(schema, {
    deadline: { start: "2024-01-01T12:34:56Z", end: null, timeZone: null },
  })
  expect(dateFilter).toEqual({
    property: "deadline",
    date: { equals: "2024-01-01" },
  })

  // 文字列型
  const stringDateFilter = queryBuilder.buildFilter(schema, {
    deadline: { start: "2024-01-01T00:00:00Z", end: null, timeZone: null },
  })
  expect(stringDateFilter).toEqual({
    property: "deadline",
    date: { equals: "2024-01-01" },
  })
})

test("buildFilter: 無効なプロパティはスキップ", () => {
  const schema: NotionPropertySchema = {
    title: { type: "title" },
  }

  const filter = queryBuilder.buildFilter(schema, {
    title: "有効",
  })

  expect(filter).toEqual({
    property: "title",
    title: { equals: "有効" },
  })
})

test("buildFilter: checkbox型", () => {
  const schema: NotionPropertySchema = {
    done: { type: "checkbox" },
  }

  const filter = queryBuilder.buildFilter(schema, { done: true })

  expect(filter).toEqual({
    property: "done",
    checkbox: { equals: true },
  })
})

test("buildFilter: シンプルな文字列条件", () => {
  const schema: NotionPropertySchema = {
    slug: { type: "rich_text" },
  }

  const result = queryBuilder.buildFilter(schema, { slug: "test" })

  expect(result).toEqual({
    property: "slug",
    rich_text: { equals: "test" },
  })
})

test("buildFilter: 数値の等価条件", () => {
  const schema: NotionPropertySchema = {
    count: { type: "number" },
  }

  const result = queryBuilder.buildFilter(schema, { count: 42 })

  expect(result).toEqual({
    property: "count",
    number: { equals: 42 },
  })
})

test("buildFilter: 複数フィールドは自動的に and になる", () => {
  const schema: NotionPropertySchema = {
    status: { type: "select", options: ["todo"] },
    priority: { type: "number" },
  }

  const result = queryBuilder.buildFilter(schema, {
    status: "todo",
    priority: 5,
  })

  expect(result).toEqual({
    and: [
      {
        property: "status",
        select: { equals: "todo" },
      },
      {
        property: "priority",
        number: { equals: 5 },
      },
    ],
  })
})

test("buildFilter: 空の条件は undefined を返す", () => {
  const schema: NotionPropertySchema = {
    slug: { type: "rich_text" },
  }

  const result = queryBuilder.buildFilter(schema, {})

  expect(result).toBeUndefined()
})

test("buildFilter: 存在しないフィールドは無視される", () => {
  const schema: NotionPropertySchema = {
    slug: { type: "rich_text" },
  }

  const result = queryBuilder.buildFilter(schema, {
    nonexistent: "value",
  })

  expect(result).toBeUndefined()
})

test("buildFilter: Notion API filter format - equals", () => {
  const schema: NotionPropertySchema = {
    slug: { type: "rich_text" },
  }

  const result = queryBuilder.buildFilter(schema, {
    slug: { equals: "test-1" },
  })

  expect(result).toEqual({
    property: "slug",
    rich_text: { equals: "test-1" },
  })
})

test("buildFilter: Notion API filter format - contains", () => {
  const schema: NotionPropertySchema = {
    title: { type: "title" },
  }

  const result = queryBuilder.buildFilter(schema, {
    title: { contains: "hello" },
  })

  expect(result).toEqual({
    property: "title",
    title: { contains: "hello" },
  })
})

test("buildFilter: Notion API filter format - number greater_than", () => {
  const schema: NotionPropertySchema = {
    count: { type: "number" },
  }

  const result = queryBuilder.buildFilter(schema, {
    count: { greater_than: 10 },
  })

  expect(result).toEqual({
    property: "count",
    number: { greater_than: 10 },
  })
})

test("buildFilter: multi_selectに配列を渡すとAND条件になる", () => {
  const schema: NotionPropertySchema = {
    tags: { type: "multi_select", options: ["js", "ts", "react"] },
  }

  const result = queryBuilder.buildFilter(schema, {
    tags: ["js", "ts"],
  })

  expect(result).toEqual({
    and: [
      { property: "tags", multi_select: { contains: "js" } },
      { property: "tags", multi_select: { contains: "ts" } },
    ],
  })
})

test("buildFilter: multi_selectに単一要素の配列を渡すと単一条件になる", () => {
  const schema: NotionPropertySchema = {
    tags: { type: "multi_select", options: ["js", "ts"] },
  }

  const result = queryBuilder.buildFilter(schema, {
    tags: ["js"],
  })

  expect(result).toEqual({
    property: "tags",
    multi_select: { contains: "js" },
  })
})

test("buildFilter: multi_selectに空配列を渡すとundefined", () => {
  const schema: NotionPropertySchema = {
    tags: { type: "multi_select", options: ["js"] },
  }

  const result = queryBuilder.buildFilter(schema, {
    tags: [],
  })

  expect(result).toBeUndefined()
})

test("getDateString: 不正な値でエラーを投げる", () => {
  const schema: NotionPropertySchema = {
    deadline: { type: "date" },
  }

  expect(() => queryBuilder.buildFilter(schema, { deadline: 12345 })).toThrow("Invalid date value")
})

test("buildFilter: nullやundefinedの値はスキップされる", () => {
  const schema: NotionPropertySchema = {
    title: { type: "title" },
    count: { type: "number" },
  }

  const resultNull = queryBuilder.buildFilter(schema, {
    title: null,
    count: 5,
  })

  expect(resultNull).toEqual({
    property: "count",
    number: { equals: 5 },
  })

  const resultUndefined = queryBuilder.buildFilter(schema, {
    title: undefined,
    count: 5,
  })

  expect(resultUndefined).toEqual({
    property: "count",
    number: { equals: 5 },
  })
})

test("buildFilter: ネストしたor/and条件", () => {
  const schema: NotionPropertySchema = {
    title: { type: "title" },
    status: { type: "select", options: ["a", "b", "c"] },
    priority: { type: "number" },
  }

  const result = queryBuilder.buildFilter(schema, {
    and: [{ or: [{ status: "a" }, { status: "b" }] }, { priority: { greater_than: 3 } }],
  })

  expect(result).toEqual({
    and: [
      {
        or: [
          { property: "status", select: { equals: "a" } },
          { property: "status", select: { equals: "b" } },
        ],
      },
      { property: "priority", number: { greater_than: 3 } },
    ],
  })
})

test("buildFilter: status型の単純な値", () => {
  const schema: NotionPropertySchema = {
    state: { type: "status", options: ["todo", "done"] },
  }

  const result = queryBuilder.buildFilter(schema, { state: "todo" })

  expect(result).toEqual({
    property: "state",
    status: { equals: "todo" },
  })
})
