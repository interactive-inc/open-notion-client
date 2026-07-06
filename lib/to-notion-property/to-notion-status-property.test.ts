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

test("optionsに含まれる値は変換される", () => {
  const result = toNotionStatusProperty("進行中", { options: ["未着手", "進行中", "完了"] })

  expect(result).toEqual({ status: { name: "進行中" } })
})

test("options外の値はエラーをthrow", () => {
  expect(() => toNotionStatusProperty("保留", { options: ["未着手", "完了"] })).toThrow()
})

test("optionsがあってもnullは解除として許可される", () => {
  expect(toNotionStatusProperty(null, { options: ["完了"] })).toEqual({ status: null })
})
