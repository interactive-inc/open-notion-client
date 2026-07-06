import { expect, test } from "bun:test"
import { lexer, type Tokens } from "marked"
import { parseBlockquoteToken } from "./parse-blockquote-token"

test("単一段落のblockquoteをquoteブロックに変換", () => {
  const token: Tokens.Blockquote = {
    type: "blockquote",
    raw: "> Hello",
    text: "Hello",
    tokens: [
      {
        type: "paragraph",
        raw: "Hello",
        text: "Hello",
        tokens: [{ type: "text", raw: "Hello", text: "Hello" }],
      } as Tokens.Paragraph,
    ],
  }

  const block = parseBlockquoteToken(token)

  expect(block.type).toBe("quote")
  expect(
    (block as { quote: { rich_text: Array<{ text: { content: string } }> } }).quote.rich_text,
  ).toHaveLength(1)
  expect(
    (block as { quote: { rich_text: Array<{ text: { content: string } }> } }).quote.rich_text[0]
      ?.text.content,
  ).toBe("Hello")
})

test("複数段落のblockquoteを改行で連結", () => {
  const token: Tokens.Blockquote = {
    type: "blockquote",
    raw: "> Line 1\n>\n> Line 2",
    text: "Line 1\n\nLine 2",
    tokens: [
      {
        type: "paragraph",
        raw: "Line 1",
        text: "Line 1",
        tokens: [{ type: "text", raw: "Line 1", text: "Line 1" }],
      } as Tokens.Paragraph,
      {
        type: "paragraph",
        raw: "Line 2",
        text: "Line 2",
        tokens: [{ type: "text", raw: "Line 2", text: "Line 2" }],
      } as Tokens.Paragraph,
    ],
  }

  const block = parseBlockquoteToken(token)
  const richText = (block as { quote: { rich_text: Array<{ text: { content: string } }> } }).quote
    .rich_text

  expect(richText).toHaveLength(3)
  expect(richText[0]?.text.content).toBe("Line 1")
  expect(richText[1]?.text.content).toBe("\n")
  expect(richText[2]?.text.content).toBe("Line 2")
})

test("blockquote内のリストをchildrenとして保持", () => {
  const token = lexer("> intro\n> - item1\n> - item2")[0] as Tokens.Blockquote

  const block = parseBlockquoteToken(token) as unknown as {
    type: string
    quote: {
      rich_text: Array<{ text: { content: string } }>
      children: Array<{ type: string }>
    }
  }

  expect(block.type).toBe("quote")
  expect(block.quote.rich_text[0]?.text.content).toBe("intro")
  expect(block.quote.children).toHaveLength(2)
  expect(block.quote.children[0]?.type).toBe("bulleted_list_item")
  expect(block.quote.children[1]?.type).toBe("bulleted_list_item")
})

test("blockquote内のコードブロックをchildrenとして保持", () => {
  const token = lexer("> before\n> ```js\n> const a = 1\n> ```")[0] as Tokens.Blockquote

  const block = parseBlockquoteToken(token) as unknown as {
    quote: {
      children: Array<{ type: string; code?: { rich_text: Array<{ text: { content: string } }> } }>
    }
  }

  expect(block.quote.children).toHaveLength(1)
  expect(block.quote.children[0]?.type).toBe("code")
  expect(block.quote.children[0]?.code?.rich_text[0]?.text.content).toBe("const a = 1")
})
