import { expect, test } from "bun:test"
import { toNotionStatusProperty } from "./to-notion-status-property"

test("文字列を正しくstatusプロパティに変換", () => {
  const result = toNotionStatusProperty("進行中")

  expect(result).toEqual({
    status: {
      name: "進行中",
    },
  })
})

test("空文字列はnullに変換", () => {
  const result = toNotionStatusProperty("")

  expect(result).toEqual({
    status: null,
  })
})

test("nullを正しく変換", () => {
  const result = toNotionStatusProperty(null)

  expect(result).toEqual({
    status: null,
  })
})

test("数値を渡すとエラーをthrow", () => {
  expect(() => toNotionStatusProperty(123)).toThrow()
})

test("オブジェクトを渡すとエラーをthrow", () => {
  expect(() => toNotionStatusProperty({})).toThrow()
})
