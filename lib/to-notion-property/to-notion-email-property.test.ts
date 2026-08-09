import { expect, test } from "vite-plus/test"
import { toNotionEmailProperty } from "./to-notion-email-property"

test("メールアドレスを正しくemailプロパティに変換", () => {
  const result = toNotionEmailProperty("test@example.com")

  expect(result).toEqual({
    email: "test@example.com",
  })
})

test("空文字列を正しく変換", () => {
  const result = toNotionEmailProperty("")

  expect(result).toEqual({
    email: null,
  })
})

test("nullを正しく変換", () => {
  const result = toNotionEmailProperty(null)

  expect(result).toEqual({
    email: null,
  })
})

test("数値を渡すとエラーをthrow", () => {
  expect(() => toNotionEmailProperty(123)).toThrow()
})

test("undefinedを渡すとエラーをthrow", () => {
  expect(() => toNotionEmailProperty(undefined)).toThrow()
})

test("オブジェクトを渡すとエラーをthrow", () => {
  expect(() => toNotionEmailProperty({})).toThrow()
})

test("配列を渡すとエラーをthrow", () => {
  expect(() => toNotionEmailProperty([])).toThrow()
})

test("真偽値を渡すとエラーをthrow", () => {
  expect(() => toNotionEmailProperty(true)).toThrow()
})
