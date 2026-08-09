import { expect, test } from "vite-plus/test"
import { toNotionUrlProperty } from "./to-notion-url-property"

test("URLを正しくurlプロパティに変換", () => {
  const result = toNotionUrlProperty("https://example.com")

  expect(result).toEqual({
    url: "https://example.com",
  })
})

test("空文字列を正しく変換", () => {
  const result = toNotionUrlProperty("")

  expect(result).toEqual({
    url: null,
  })
})

test("nullを正しく変換", () => {
  const result = toNotionUrlProperty(null)

  expect(result).toEqual({
    url: null,
  })
})

test("数値を渡すとエラーをthrow", () => {
  expect(() => toNotionUrlProperty(123)).toThrow()
})

test("undefinedを渡すとエラーをthrow", () => {
  expect(() => toNotionUrlProperty(undefined)).toThrow()
})

test("オブジェクトを渡すとエラーをthrow", () => {
  expect(() => toNotionUrlProperty({})).toThrow()
})

test("配列を渡すとエラーをthrow", () => {
  expect(() => toNotionUrlProperty([])).toThrow()
})

test("真偽値を渡すとエラーをthrow", () => {
  expect(() => toNotionUrlProperty(true)).toThrow()
})
