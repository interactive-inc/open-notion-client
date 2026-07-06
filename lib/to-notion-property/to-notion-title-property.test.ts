import { expect, test } from "bun:test"
import { toNotionTitleProperty } from "./to-notion-title-property"

test("文字列を正しくtitleプロパティに変換", () => {
  const result = toNotionTitleProperty("テストタイトル")

  expect(result).toEqual({
    title: [
      {
        type: "text",
        text: {
          content: "テストタイトル",
        },
      },
    ],
  })
})

test("空文字列を正しく変換", () => {
  const result = toNotionTitleProperty("")

  expect(result).toEqual({
    title: [
      {
        type: "text",
        text: {
          content: "",
        },
      },
    ],
  })
})

test("数値を渡すとエラーをthrow", () => {
  expect(() => toNotionTitleProperty(123)).toThrow()
})

test("nullは空のtitle配列に変換（値クリア）", () => {
  const result = toNotionTitleProperty(null)

  expect(result).toEqual({ title: [] })
})

test("2000文字ちょうどは1要素のまま", () => {
  const result = toNotionTitleProperty("a".repeat(2000))

  expect(result.title).toHaveLength(1)
})

test("2000文字を超えると複数要素に分割される", () => {
  const result = toNotionTitleProperty("a".repeat(4500))

  expect(result.title).toHaveLength(3)

  const contents = result.title.map((item) => {
    if (!("text" in item)) {
      throw new Error("text要素ではありません")
    }
    return item.text.content
  })

  expect(contents[0]).toHaveLength(2000)
  expect(contents[1]).toHaveLength(2000)
  expect(contents[2]).toHaveLength(500)
  expect(contents.join("")).toBe("a".repeat(4500))
})

test("undefinedを渡すとエラーをthrow", () => {
  expect(() => toNotionTitleProperty(undefined)).toThrow()
})

test("オブジェクトを渡すとエラーをthrow", () => {
  expect(() => toNotionTitleProperty({})).toThrow()
})

test("配列を渡すとエラーをthrow", () => {
  expect(() => toNotionTitleProperty([])).toThrow()
})
