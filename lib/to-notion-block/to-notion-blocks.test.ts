import { expect, test } from "bun:test"
import { sampleMarkdown } from "@/samples/markdown"
import { sampleNotionBlocks } from "@/samples/notion-blocks"
import { toNotionBlocks } from "./to-notion-blocks"

test("toNotionBlocks", () => {
  const blocks = toNotionBlocks(sampleMarkdown.data)

  expect(JSON.stringify(blocks)).toBe(JSON.stringify(sampleNotionBlocks.data))
})

test("blockquoteをquoteブロックに変換", () => {
  const blocks = toNotionBlocks("> quoted text")

  expect(blocks).toHaveLength(1)
  const first = blocks[0] as Extract<(typeof blocks)[number], { type?: "quote" }>
  expect(first.type).toBe("quote")
})

test("水平線をdividerに変換", () => {
  const blocks = toNotionBlocks("---")

  expect(blocks).toHaveLength(1)
  expect((blocks[0] as { type: string }).type).toBe("divider")
})

test("段落内のリンクをlink付きrich_textに変換", () => {
  const blocks = toNotionBlocks("Visit [home](https://example.com).")

  expect(blocks).toHaveLength(1)
  const para = blocks[0] as {
    type: "paragraph"
    paragraph: {
      rich_text: Array<{ text: { content: string; link?: { url: string } } }>
    }
  }
  const richTexts = para.paragraph.rich_text
  expect(richTexts.length).toBeGreaterThan(1)
  const linkItem = richTexts.find((rt) => rt.text.link)
  expect(linkItem?.text.link?.url).toBe("https://example.com")
  expect(linkItem?.text.content).toBe("home")
})

test("リスト項目内の装飾が保持される", () => {
  const blocks = toNotionBlocks("- **bold** and `code`")

  expect(blocks).toHaveLength(1)
  const item = blocks[0] as {
    type: "bulleted_list_item"
    bulleted_list_item: {
      rich_text: Array<{
        text: { content: string }
        annotations: { bold?: boolean; code?: boolean }
      }>
    }
  }
  const rt = item.bulleted_list_item.rich_text
  expect(rt.length).toBeGreaterThanOrEqual(3)
  expect(rt[0]?.annotations.bold).toBe(true)
  expect(rt[0]?.text.content).toBe("bold")
  expect(rt[rt.length - 1]?.annotations.code).toBe(true)
})

test("段落間の空行が正しく処理される", () => {
  const markdown = `段落1

段落2`

  const blocks = toNotionBlocks(markdown)

  expect(blocks).toHaveLength(2)
  expect(blocks[0]).toEqual({
    type: "paragraph",
    paragraph: {
      rich_text: [
        {
          type: "text",
          text: { content: "段落1" },
          // @ts-expect-error テストでplain_textプロパティを検証するが実際の型にはない
          plain_text: "段落1",
          annotations: {},
        },
      ],
    },
  })
  expect(blocks[1]).toEqual({
    type: "paragraph",
    paragraph: {
      rich_text: [
        {
          type: "text",
          text: { content: "段落2" },
          // @ts-expect-error テストでplain_textプロパティを検証するが実際の型にはない
          plain_text: "段落2",
          annotations: {},
        },
      ],
    },
  })
})
