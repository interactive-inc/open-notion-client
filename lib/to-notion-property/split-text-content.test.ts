import { expect, test } from "bun:test"
import { splitTextContent } from "./split-text-content"

test("2000文字以下はそのまま1要素", () => {
  expect(splitTextContent("abc")).toEqual(["abc"])
  expect(splitTextContent("a".repeat(2000))).toEqual(["a".repeat(2000)])
})

test("空文字列は空文字列1要素", () => {
  expect(splitTextContent("")).toEqual([""])
})

test("2001文字は2要素に分割", () => {
  const chunks = splitTextContent("a".repeat(2001))

  expect(chunks).toHaveLength(2)
  expect(chunks[0]).toHaveLength(2000)
  expect(chunks[1]).toHaveLength(1)
})

test("分割しても結合すると元の文字列に戻る", () => {
  const text = "あ".repeat(5000)

  const chunks = splitTextContent(text)

  expect(chunks.join("")).toBe(text)

  for (const chunk of chunks) {
    expect(chunk.length).toBeLessThanOrEqual(2000)
  }
})

test("サロゲートペアの途中で分割しない", () => {
  const text = `${"a".repeat(1999)}😀${"b".repeat(100)}`

  const chunks = splitTextContent(text)

  expect(chunks.join("")).toBe(text)

  for (const chunk of chunks) {
    expect(chunk).not.toMatch(/[\uD800-\uDBFF]$/)
    expect(chunk).not.toMatch(/^[\uDC00-\uDFFF]/)
  }
})
