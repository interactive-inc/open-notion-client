import { expect, test } from "vite-plus/test"
import { toNotionBlocks } from "@/to-notion-block/to-notion-blocks"
import { fromNotionRichTextItem } from "@/utils"
import { notionRichText } from "@/testing/notion-rich-text"
import { fromNotionCodeBlock } from "@/from-notion-block/from-notion-code-block"
import { notionParagraph } from "@/testing/notion-paragraph"
import { fromNotionBlocks } from "@/from-notion-block/from-notion-blocks"

test.each([1999, 2000, 2001, 4001])(
  "段落・見出し・リスト・引用・コードの%s文字を欠落なくAPI制限内に分割する",
  (length) => {
    const content =
      length < 2001 ? "a".repeat(length) : "a".repeat(1999) + "😀" + "b".repeat(length - 2001)
    const markdowns = [
      content,
      `# ${content}`,
      `- ${content}`,
      `> ${content}`,
      `\`\`\`\n${content}\n\`\`\``,
    ]
    for (const markdown of markdowns) {
      const blocks = toNotionBlocks(markdown)
      const block = blocks[0]
      if (!block) throw new Error("Missing block")
      const body =
        "paragraph" in block
          ? block.paragraph
          : "heading_1" in block
            ? block.heading_1
            : "bulleted_list_item" in block
              ? block.bulleted_list_item
              : "quote" in block
                ? block.quote
                : "code" in block
                  ? block.code
                  : null
      if (!body) throw new Error("Unexpected block")
      const texts = body.rich_text?.map((item) => ("text" in item ? item.text.content : "")) ?? []
      expect(texts.join("")).toBe(content)
      expect(texts.every((text) => text.length <= 2000 && text.isWellFormed())).toBe(true)
    }
  },
)

test("長い装飾付きリンクでも全セグメントの注釈とリンクを保つ", () => {
  const content = "字".repeat(4001)
  const block = toNotionBlocks(`[**${content}**](https://example.com)`)[0]
  if (!block || !("paragraph" in block)) throw new Error("Missing paragraph")
  expect(block.paragraph.rich_text).toHaveLength(3)
  for (const item of block.paragraph.rich_text ?? []) {
    expect(item.annotations?.bold).toBe(true)
    expect("text" in item && item.text.link?.url).toBe("https://example.com")
  }
})

test.each(["`value`", "a``b", "`", "````", "a`b`c"])(
  "インラインコード %s は実際に往復して内容を保持する",
  (content) => {
    const markdown = fromNotionRichTextItem([notionRichText(content, { code: true })])
    const block = toNotionBlocks(markdown)[0]
    if (!block || !("paragraph" in block)) throw new Error("Missing paragraph")
    const texts = block.paragraph.rich_text ?? []
    expect(texts.map((item) => ("text" in item ? item.text.content : "")).join("")).toBe(content)
    expect(texts.every((item) => item.annotations?.code)).toBe(true)
  },
)

test("コードブロックの文字列にrich textの装飾記法を混入させない", () => {
  const paragraph = notionParagraph()
  const content = "const x = `value`"
  const markdown = fromNotionCodeBlock({
    ...paragraph,
    type: "code",
    code: {
      rich_text: [notionRichText(content, { bold: true, code: true })],
      caption: [],
      language: "javascript",
    },
  })
  expect(markdown).toBe("```javascript\nconst x = `value`\n```")
})

test.each([
  "*literal*",
  "**literal**",
  "_literal_",
  "~~literal~~",
  "`literal`",
  "[text](https://example.com)",
  "<b>literal</b>",
  "# literal",
  "> literal",
  "- literal",
  "1. literal",
  "a\\b",
  "日本語😀の本文",
  "[label]",
  "a_b_c",
  "&amp;",
])("装飾のないNotion本文 %j をMarkdown構文として誤解せず往復する", (content) => {
  const markdown = fromNotionBlocks([notionParagraph("page-1", content)])
  const block = toNotionBlocks(markdown)[0]
  if (!block || !("paragraph" in block)) throw new Error(`Expected paragraph: ${markdown}`)
  const texts = block.paragraph.rich_text ?? []
  expect(texts.map((item) => ("text" in item ? item.text.content : "")).join("")).toBe(content)
  expect(
    texts.every(
      (item) =>
        !item.annotations?.bold &&
        !item.annotations?.italic &&
        !item.annotations?.code &&
        !item.annotations?.strikethrough,
    ),
  ).toBe(true)
})
