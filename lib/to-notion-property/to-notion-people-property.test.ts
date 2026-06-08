import { expect, test } from "bun:test"
import { toNotionPeopleProperty } from "./to-notion-people-property"

test("ユーザー配列をpeopleプロパティに変換", () => {
  const value = [{ id: "u1" }, { id: "u2" }]

  expect(toNotionPeopleProperty(value)).toEqual({
    people: [{ id: "u1" }, { id: "u2" }],
  })
})

test("単一ユーザーオブジェクトを配列として変換", () => {
  const value = { id: "u1" }

  expect(toNotionPeopleProperty(value)).toEqual({
    people: [{ id: "u1" }],
  })
})

test("nullは空のpeople配列を返す", () => {
  expect(toNotionPeopleProperty(null)).toEqual({
    people: [],
  })
})

test("不正な値はエラーを投げる", () => {
  expect(() => toNotionPeopleProperty("invalid")).toThrow()
})

test("空のid文字列はエラーを投げる", () => {
  expect(() => toNotionPeopleProperty([{ id: "" }])).toThrow()
})
