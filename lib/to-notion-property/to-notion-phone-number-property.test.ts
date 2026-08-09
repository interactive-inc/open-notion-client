import { expect, test } from "vite-plus/test"
import { toNotionPhoneNumberProperty } from "./to-notion-phone-number-property"

test("電話番号を正しくphone_numberプロパティに変換", () => {
  const result = toNotionPhoneNumberProperty("090-1234-5678")

  expect(result).toEqual({
    phone_number: "090-1234-5678",
  })
})

test("空文字列を正しく変換", () => {
  const result = toNotionPhoneNumberProperty("")

  expect(result).toEqual({
    phone_number: null,
  })
})

test("nullを正しく変換", () => {
  const result = toNotionPhoneNumberProperty(null)

  expect(result).toEqual({
    phone_number: null,
  })
})

test("数値を渡すとエラーをthrow", () => {
  expect(() => toNotionPhoneNumberProperty(123)).toThrow()
})

test("undefinedを渡すとエラーをthrow", () => {
  expect(() => toNotionPhoneNumberProperty(undefined)).toThrow()
})

test("オブジェクトを渡すとエラーをthrow", () => {
  expect(() => toNotionPhoneNumberProperty({})).toThrow()
})

test("配列を渡すとエラーをthrow", () => {
  expect(() => toNotionPhoneNumberProperty([])).toThrow()
})

test("真偽値を渡すとエラーをthrow", () => {
  expect(() => toNotionPhoneNumberProperty(true)).toThrow()
})
