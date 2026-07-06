import { expect, test } from "bun:test"
import { toNotionCheckboxProperty } from "./to-notion-checkbox-property"

test("trueを正しくcheckboxプロパティに変換", () => {
  const result = toNotionCheckboxProperty(true)

  expect(result).toEqual({
    checkbox: true,
  })
})

test("falseを正しく変換", () => {
  const result = toNotionCheckboxProperty(false)

  expect(result).toEqual({
    checkbox: false,
  })
})

test("文字列を渡すとエラーをthrow", () => {
  expect(() => toNotionCheckboxProperty("true")).toThrow()
})

test("数値を渡すとエラーをthrow", () => {
  expect(() => toNotionCheckboxProperty(1)).toThrow()
})

test("nullはfalseに変換", () => {
  const result = toNotionCheckboxProperty(null)

  expect(result).toEqual({ checkbox: false })
})

test("undefinedを渡すとエラーをthrow", () => {
  expect(() => toNotionCheckboxProperty(undefined)).toThrow()
})

test("オブジェクトを渡すとエラーをthrow", () => {
  expect(() => toNotionCheckboxProperty({})).toThrow()
})

test("配列を渡すとエラーをthrow", () => {
  expect(() => toNotionCheckboxProperty([])).toThrow()
})
