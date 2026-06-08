import { expect, test } from "bun:test"
import { toNotionFilesProperty } from "./to-notion-files-property"

test("外部URLの配列を変換", () => {
  const result = toNotionFilesProperty([
    { name: "doc.pdf", url: "https://example.com/doc.pdf" },
    { name: "image.png", url: "https://example.com/image.png" },
  ])

  expect(result).toEqual({
    files: [
      {
        name: "doc.pdf",
        type: "external",
        external: { url: "https://example.com/doc.pdf" },
      },
      {
        name: "image.png",
        type: "external",
        external: { url: "https://example.com/image.png" },
      },
    ],
  })
})

test("nullは空配列に変換", () => {
  const result = toNotionFilesProperty(null)
  expect(result).toEqual({ files: [] })
})

test("nameが空文字列だとエラー", () => {
  expect(() => toNotionFilesProperty([{ name: "", url: "x" }])).toThrow()
})

test("文字列を渡すとエラー", () => {
  expect(() => toNotionFilesProperty("not-an-array")).toThrow()
})
