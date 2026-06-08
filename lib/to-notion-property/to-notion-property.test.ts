import { expect, test } from "bun:test"
import { toNotionProperty } from "./to-notion-property"

test("statusはstatusキーで包む（selectで包んではいけない）", () => {
  const result = toNotionProperty({ type: "status", options: ["進行中", "完了"] }, "進行中")

  expect(result).toEqual({
    status: { name: "進行中" },
  })
})

test("selectはselectキーで包む", () => {
  const result = toNotionProperty({ type: "select", options: ["a", "b"] }, "a")

  expect(result).toEqual({
    select: { name: "a" },
  })
})

test("filesは外部URLとして包む", () => {
  const result = toNotionProperty({ type: "files" }, [{ name: "x.png", url: "https://e/x.png" }])

  expect(result).toEqual({
    files: [{ name: "x.png", type: "external", external: { url: "https://e/x.png" } }],
  })
})

test("created_time等の読み取り専用プロパティはnullを返す", () => {
  expect(toNotionProperty({ type: "created_time" }, "2024-01-01")).toBeNull()
  expect(toNotionProperty({ type: "last_edited_time" }, "2024-01-01")).toBeNull()
  expect(toNotionProperty({ type: "created_by" }, { id: "user-1" })).toBeNull()
  expect(toNotionProperty({ type: "last_edited_by" }, { id: "user-2" })).toBeNull()
  expect(toNotionProperty({ type: "formula", formulaType: "string" }, "anything")).toBeNull()
})
