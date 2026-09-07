import { expect, test } from "vite-plus/test"
import { NotionQueryBuilder } from "@/table/notion-query-builder"
import type { NotionPropertySchema } from "@/types"

const schema = {
  title: { type: "title" },
  count: { type: "number" },
  date: { type: "date" },
  tags: { type: "multi_select", options: null },
} satisfies NotionPropertySchema
const builder = new NotionQueryBuilder()

test("orと同階層のフィールド条件を両方適用する", () => {
  expect(builder.buildFilter(schema, { or: [{ title: "A" }, { title: "B" }], count: 0 })).toEqual({
    and: [
      {
        or: [
          { property: "title", title: { equals: "A" } },
          { property: "title", title: { equals: "B" } },
        ],
      },
      { property: "count", number: { equals: 0 } },
    ],
  })
})

test("andとorを同階層で使ってもどちらの条件も失わない", () => {
  expect(
    builder.buildFilter(schema, {
      or: [{ title: "A" }, { title: "B" }],
      and: [{ count: { greater_than: 0 } }],
    }),
  ).toEqual({
    and: [
      {
        or: [
          { property: "title", title: { equals: "A" } },
          { property: "title", title: { equals: "B" } },
        ],
      },
      { property: "count", number: { greater_than: 0 } },
    ],
  })
})

test.each([
  { this_week: {} },
  { past_week: {} },
  { past_month: {} },
  { past_year: {} },
  { next_week: {} },
  { next_month: {} },
  { next_year: {} },
])("日付の相対条件 %j をAPIフィルターに変換する", (filter) => {
  expect(builder.buildFilter(schema, { date: filter })).toEqual({
    property: "date",
    date: filter,
  })
})

test("スキーマに存在しないキーを全件検索へ変換しない", () => {
  const dynamicSchema: NotionPropertySchema = schema
  expect(() => builder.buildFilter(dynamicSchema, { typo: "target" })).toThrow(/Unknown property/)
})

test("orという名前の配列プロパティを論理演算子と誤認しない", () => {
  const namedSchema = { or: { type: "multi_select", options: null } } satisfies NotionPropertySchema
  expect(builder.buildFilter(namedSchema, { or: ["A", "B"] })).toEqual({
    and: [
      { property: "or", multi_select: { contains: "A" } },
      { property: "or", multi_select: { contains: "B" } },
    ],
  })
})

test("Object.prototype由来のフィールドをスキーマとして使わない", () => {
  const dynamicSchema: NotionPropertySchema = schema
  expect(() => builder.buildFilter(dynamicSchema, { constructor: "x" })).toThrow(/Unknown property/)
})

test("公式APIの全対応型に対して高度なフィルターを型安全に指定できる", () => {
  const filterSchema = {
    website: { type: "url" },
    email: { type: "email" },
    phone: { type: "phone_number" },
    files: { type: "files" },
    created: { type: "created_time" },
    edited: { type: "last_edited_time" },
    author: { type: "created_by" },
    editor: { type: "last_edited_by" },
    formula: { type: "formula", formulaType: "number" },
  } satisfies NotionPropertySchema
  expect(
    builder.buildFilter(filterSchema, {
      website: { contains: "example.com" },
      email: { is_empty: true },
      phone: { starts_with: "+81" },
      files: { is_not_empty: true },
      created: { past_week: {} },
      edited: { after: "2026-01-01" },
      author: { contains: "user-1" },
      editor: { does_not_contain: "user-2" },
      formula: { number: { greater_than: 5 } },
    }),
  ).toEqual({
    and: [
      { property: "website", url: { contains: "example.com" } },
      { property: "email", email: { is_empty: true } },
      { property: "phone", phone_number: { starts_with: "+81" } },
      { property: "files", files: { is_not_empty: true } },
      { property: "created", created_time: { past_week: {} } },
      { property: "edited", last_edited_time: { after: "2026-01-01" } },
      { property: "author", created_by: { contains: "user-1" } },
      { property: "editor", last_edited_by: { does_not_contain: "user-2" } },
      { property: "formula", formula: { number: { greater_than: 5 } } },
    ],
  })
})

test("peopleの単一ユーザーオブジェクトと文字列IDを型安全に扱う", () => {
  const peopleSchema = { people: { type: "people" } } satisfies NotionPropertySchema
  const user = { id: "user-1", name: null, avatarUrl: null, email: null }
  const expected = { property: "people", people: { contains: "user-1" } }
  expect(builder.buildFilter(peopleSchema, { people: user })).toEqual(expected)
  expect(builder.buildFilter(peopleSchema, { people: "user-1" })).toEqual(expected)
})

test("不正なDateをNaN入りの日付文字列として送信しない", () => {
  expect(() => builder.buildFilter(schema, { date: new Date(NaN) })).toThrow("Invalid date value")
})
