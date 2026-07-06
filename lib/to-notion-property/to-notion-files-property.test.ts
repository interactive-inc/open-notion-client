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

test("type: fileのエントリはfileとして書き戻す（ラウンドトリップ保全）", () => {
  const result = toNotionFilesProperty([
    {
      name: "hosted.png",
      url: "https://prod-files-secure.s3.us-west-2.amazonaws.com/x/hosted.png?X-Amz-Signature=abc",
      type: "file",
    },
  ])

  expect(result).toEqual({
    files: [
      {
        name: "hosted.png",
        type: "file",
        file: {
          url: "https://prod-files-secure.s3.us-west-2.amazonaws.com/x/hosted.png?X-Amz-Signature=abc",
        },
      },
    ],
  })
})

test("type: externalのエントリはexternalとして送信する", () => {
  const result = toNotionFilesProperty([
    { name: "doc.pdf", url: "https://example.com/doc.pdf", type: "external" },
  ])

  expect(result).toEqual({
    files: [
      {
        name: "doc.pdf",
        type: "external",
        external: { url: "https://example.com/doc.pdf" },
      },
    ],
  })
})

test("type未指定とfileが混在してもそれぞれ正しく変換される", () => {
  const result = toNotionFilesProperty([
    { name: "a.png", url: "https://example.com/a.png" },
    { name: "b.png", url: "https://files.notion.so/b.png", type: "file" },
  ])

  expect(result).toEqual({
    files: [
      { name: "a.png", type: "external", external: { url: "https://example.com/a.png" } },
      { name: "b.png", type: "file", file: { url: "https://files.notion.so/b.png" } },
    ],
  })
})

test("不正なtypeはエラー", () => {
  expect(() => toNotionFilesProperty([{ name: "x", url: "https://e/x", type: "upload" }])).toThrow()
})
