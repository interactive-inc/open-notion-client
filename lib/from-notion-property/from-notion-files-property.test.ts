import { expect, test } from "bun:test"
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { fromNotionFilesProperty } from "./from-notion-files-property"

type FilesProperty = Extract<PageObjectResponse["properties"][string], { type: "files" }>

test("externalファイルを変換", () => {
  const property = {
    type: "files",
    files: [
      {
        name: "doc.pdf",
        type: "external",
        external: { url: "https://example.com/doc.pdf" },
      },
    ],
    id: "f",
  } as unknown as FilesProperty

  expect(fromNotionFilesProperty(property)).toEqual([
    { name: "doc.pdf", url: "https://example.com/doc.pdf", type: "external" },
  ])
})

test("内部fileを変換", () => {
  const property = {
    type: "files",
    files: [
      {
        name: "x.png",
        type: "file",
        file: { url: "https://files.notion/x.png", expiry_time: "x" },
      },
    ],
    id: "f",
  } as unknown as FilesProperty

  expect(fromNotionFilesProperty(property)).toEqual([
    { name: "x.png", url: "https://files.notion/x.png", type: "file" },
  ])
})

test("空のfilesは空配列", () => {
  const property = {
    type: "files",
    files: [],
    id: "f",
  } as unknown as FilesProperty

  expect(fromNotionFilesProperty(property)).toEqual([])
})
