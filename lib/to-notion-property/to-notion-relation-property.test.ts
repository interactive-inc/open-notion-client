import { expect, test } from "vite-plus/test"
import { toNotionRelationProperty } from "./to-notion-relation-property"

test("ID配列を正しくrelationプロパティに変換", () => {
  const result = toNotionRelationProperty(["id1", "id2", "id3"])

  expect(result).toEqual({
    relation: [{ id: "id1" }, { id: "id2" }, { id: "id3" }],
  })
})

test("単一のIDを正しく変換", () => {
  const result = toNotionRelationProperty("single-id")

  expect(result).toEqual({
    relation: [{ id: "single-id" }],
  })
})

test("空配列を正しく変換", () => {
  const result = toNotionRelationProperty([])

  expect(result).toEqual({
    relation: [],
  })
})

test("nullを正しく変換", () => {
  const result = toNotionRelationProperty(null)

  expect(result).toEqual({
    relation: [],
  })
})

test("数値を渡すとエラーをthrow", () => {
  expect(() => toNotionRelationProperty(123)).toThrow()
})

test("undefinedを渡すとエラーをthrow", () => {
  expect(() => toNotionRelationProperty(undefined)).toThrow()
})

test("オブジェクトを渡すとエラーをthrow", () => {
  expect(() => toNotionRelationProperty({})).toThrow()
})

test("真偽値を渡すとエラーをthrow", () => {
  expect(() => toNotionRelationProperty(true)).toThrow()
})

test("数値配列を渡すとエラーをthrow", () => {
  expect(() => toNotionRelationProperty([1, 2, 3])).toThrow()
})
