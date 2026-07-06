import { expect, test } from "bun:test"
import { toNotionRichTextProperty } from "./to-notion-rich-text-property"

test("文字列を正しくrich_textプロパティに変換", () => {
  const result = toNotionRichTextProperty("リッチテキスト")

  expect(result).toEqual({
    rich_text: [
      {
        type: "text",
        text: {
          content: "リッチテキスト",
        },
      },
    ],
  })
})

test("空文字列を正しく変換", () => {
  const result = toNotionRichTextProperty("")

  expect(result).toEqual({
    rich_text: [
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
  expect(() => toNotionRichTextProperty(123)).toThrow()
})

test("nullは空のrich_text配列に変換（値クリア）", () => {
  const result = toNotionRichTextProperty(null)

  expect(result).toEqual({ rich_text: [] })
})

test("2000文字ちょうどは1要素のまま", () => {
  const result = toNotionRichTextProperty("a".repeat(2000))

  expect(result.rich_text).toHaveLength(1)
})

test("2000文字を超えると複数要素に分割される", () => {
  const result = toNotionRichTextProperty("a".repeat(2001))

  expect(result.rich_text).toHaveLength(2)

  const contents = result.rich_text.map((item) => {
    if (!("text" in item)) {
      throw new Error("text要素ではありません")
    }
    return item.text.content
  })

  expect(contents[0]).toHaveLength(2000)
  expect(contents[1]).toHaveLength(1)
  expect(contents.join("")).toBe("a".repeat(2001))
})

test("undefinedを渡すとエラーをthrow", () => {
  expect(() => toNotionRichTextProperty(undefined)).toThrow()
})

test("オブジェクトを渡すとエラーをthrow", () => {
  expect(() => toNotionRichTextProperty({})).toThrow()
})

test("配列を渡すとエラーをthrow", () => {
  expect(() => toNotionRichTextProperty([])).toThrow()
})
