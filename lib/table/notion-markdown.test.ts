import { expect, test } from "bun:test"
import type { BlockObjectRequest } from "@notionhq/client/build/src/api-endpoints"
import { NotionMarkdown } from "./notion-markdown"

function headingBlock(
  type: "heading_1" | "heading_2" | "heading_3",
  content: string,
): BlockObjectRequest {
  const rich_text = [{ type: "text" as const, text: { content: content } }]
  if (type === "heading_1") {
    return { type: "heading_1", heading_1: { rich_text: rich_text } }
  }
  if (type === "heading_2") {
    return { type: "heading_2", heading_2: { rich_text: rich_text } }
  }
  return { type: "heading_3", heading_3: { rich_text: rich_text } }
}

test("デフォルトはブロックを変えない", () => {
  const enhancer = new NotionMarkdown()

  const block = headingBlock("heading_1", "見出し")

  expect(enhancer.enhanceBlock(block)).toEqual(block)
})

test("見出しレベルを差し替えるとtypeと中身のkeyを同時に書き換える", () => {
  const enhancer = new NotionMarkdown({
    heading_1: "heading_2",
    heading_2: "heading_3",
  })

  const result = enhancer.enhanceBlock(headingBlock("heading_1", "Title"))

  expect(result).toEqual({
    type: "heading_2",
    heading_2: {
      rich_text: [{ type: "text", text: { content: "Title" } }],
    },
  } as BlockObjectRequest)
})

test("マッピング未指定の見出しはそのまま", () => {
  const enhancer = new NotionMarkdown({ heading_1: "heading_2" })

  const block = headingBlock("heading_3", "h3")

  expect(enhancer.enhanceBlock(block)).toEqual(block)
})

test("見出し以外のブロックはそのまま", () => {
  const enhancer = new NotionMarkdown({ heading_1: "heading_2" })

  const block: BlockObjectRequest = {
    type: "paragraph",
    paragraph: {
      rich_text: [{ type: "text", text: { content: "本文" } }],
    },
  }

  expect(enhancer.enhanceBlock(block)).toEqual(block)
})

test("マッピング取得は防御コピー", () => {
  const mapping = { heading_1: "heading_2" } as const
  const enhancer = new NotionMarkdown(mapping)
  const retrieved = enhancer.getMapping()

  expect(retrieved).toEqual(mapping)

  retrieved.heading_1 = "heading_3"
  expect(enhancer.getMapping().heading_1).toBe("heading_2")
})

test("withMappingで差し替え済みの新インスタンスが返る", () => {
  const original = new NotionMarkdown()

  const updated = original.withMapping({ heading_1: "heading_3" })

  const result = updated.enhanceBlock(headingBlock("heading_1", "x"))

  expect(result).toEqual({
    type: "heading_3",
    heading_3: {
      rich_text: [{ type: "text", text: { content: "x" } }],
    },
  } as BlockObjectRequest)
})
