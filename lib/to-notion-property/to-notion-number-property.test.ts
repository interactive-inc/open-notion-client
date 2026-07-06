import { expect, test } from "bun:test"
import { toNotionNumberProperty } from "./to-notion-number-property"

test("数値を正しくnumberプロパティに変換", () => {
  const result = toNotionNumberProperty(123)

  expect(result).toEqual({
    number: 123,
  })
})

test("小数点を正しく変換", () => {
  const result = toNotionNumberProperty(123.45)

  expect(result).toEqual({
    number: 123.45,
  })
})

test("負の数値を正しく変換", () => {
  const result = toNotionNumberProperty(-456)

  expect(result).toEqual({
    number: -456,
  })
})

test("nullを正しく変換", () => {
  const result = toNotionNumberProperty(null)

  expect(result).toEqual({
    number: null,
  })
})

test("文字列を渡すとエラーをthrow", () => {
  expect(() => toNotionNumberProperty("123")).toThrow()
})

test("undefinedを渡すとエラーをthrow", () => {
  expect(() => toNotionNumberProperty(undefined)).toThrow()
})

test("オブジェクトを渡すとエラーをthrow", () => {
  expect(() => toNotionNumberProperty({})).toThrow()
})

test("配列を渡すとエラーをthrow", () => {
  expect(() => toNotionNumberProperty([])).toThrow()
})

test("minを下回るとエラーをthrow", () => {
  expect(() => toNotionNumberProperty(5, { min: 10 })).toThrow()
})

test("maxを超えるとエラーをthrow", () => {
  expect(() => toNotionNumberProperty(15, { max: 10 })).toThrow()
})

test("min/maxの範囲内は変換される", () => {
  const result = toNotionNumberProperty(5, { min: 0, max: 10 })

  expect(result).toEqual({ number: 5 })
})

test("min/maxちょうどの境界値は変換される", () => {
  expect(toNotionNumberProperty(0, { min: 0, max: 10 })).toEqual({ number: 0 })
  expect(toNotionNumberProperty(10, { min: 0, max: 10 })).toEqual({ number: 10 })
})

test("nullはmin/maxがあっても許可される", () => {
  const result = toNotionNumberProperty(null, { min: 0, max: 10 })

  expect(result).toEqual({ number: null })
})
