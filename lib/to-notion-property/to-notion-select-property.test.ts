import { expect, test } from "bun:test"
import { toNotionSelectProperty } from "./to-notion-select-property"

test("文字列を正しくselectプロパティに変換", () => {
  const result = toNotionSelectProperty("選択肢A")

  expect(result).toEqual({
    select: {
      name: "選択肢A",
    },
  })
})

test("空文字列を正しく変換", () => {
  const result = toNotionSelectProperty("")

  expect(result).toEqual({
    select: null,
  })
})

test("nullを正しく変換", () => {
  const result = toNotionSelectProperty(null)

  expect(result).toEqual({
    select: null,
  })
})

test("数値を渡すとエラーをthrow", () => {
  expect(() => toNotionSelectProperty(123)).toThrow()
})

test("undefinedを渡すとエラーをthrow", () => {
  expect(() => toNotionSelectProperty(undefined)).toThrow()
})

test("オブジェクトを渡すとエラーをthrow", () => {
  expect(() => toNotionSelectProperty({})).toThrow()
})

test("配列を渡すとエラーをthrow", () => {
  expect(() => toNotionSelectProperty([])).toThrow()
})

test("真偽値を渡すとエラーをthrow", () => {
  expect(() => toNotionSelectProperty(true)).toThrow()
})

test("optionsに含まれる値は変換される", () => {
  const result = toNotionSelectProperty("A", { options: ["A", "B"] })

  expect(result).toEqual({ select: { name: "A" } })
})

test("options外の値はエラーをthrow", () => {
  expect(() => toNotionSelectProperty("C", { options: ["A", "B"] })).toThrow()
})

test("optionsがあってもnullと空文字列は解除として許可される", () => {
  expect(toNotionSelectProperty(null, { options: ["A"] })).toEqual({ select: null })
  expect(toNotionSelectProperty("", { options: ["A"] })).toEqual({ select: null })
})

test("空のoptionsは検証をスキップして値を通す", () => {
  expect(toNotionSelectProperty("X", { options: [] })).toEqual({ select: { name: "X" } })
})
