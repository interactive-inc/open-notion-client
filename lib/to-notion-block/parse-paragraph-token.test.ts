import { expect, test } from "bun:test"
import { lexer, type Tokens } from "marked"
import type { RichTextItemResponse } from "@/types"
import { parseParagraphToken } from "./parse-paragraph-token"

test("シンプルなテキストの段落を変換", () => {
  const token: Tokens.Paragraph = {
    type: "paragraph",
    raw: "This is a simple paragraph.",
    text: "This is a simple paragraph.",
    tokens: [
      {
        type: "text",
        raw: "This is a simple paragraph.",
        text: "This is a simple paragraph.",
      } as Tokens.Text,
    ],
  }

  const result = parseParagraphToken(token)

  expect(result).toEqual({
    type: "paragraph",
    paragraph: {
      rich_text: [
        {
          type: "text",
          text: { content: "This is a simple paragraph." },
          plain_text: "This is a simple paragraph.",
          annotations: {},
        } as RichTextItemResponse,
      ],
    },
  })
})

test("太字を含む段落を変換", () => {
  const token: Tokens.Paragraph = {
    type: "paragraph",
    raw: "This is **bold** text.",
    text: "This is bold text.",
    tokens: [
      {
        type: "text",
        raw: "This is ",
        text: "This is ",
      } as Tokens.Text,
      {
        type: "strong",
        raw: "**bold**",
        text: "bold",
        tokens: [
          {
            type: "text",
            raw: "bold",
            text: "bold",
          } as Tokens.Text,
        ],
      } as Tokens.Strong,
      {
        type: "text",
        raw: " text.",
        text: " text.",
      } as Tokens.Text,
    ],
  }

  const result = parseParagraphToken(token)

  expect(result).toEqual({
    type: "paragraph",
    paragraph: {
      rich_text: [
        {
          type: "text",
          text: { content: "This is " },
          plain_text: "This is ",
          annotations: {},
        } as RichTextItemResponse,
        {
          type: "text",
          text: { content: "bold" },
          plain_text: "bold",
          annotations: {
            bold: true,
          },
        } as RichTextItemResponse,
        {
          type: "text",
          text: { content: " text." },
          plain_text: " text.",
          annotations: {},
        } as RichTextItemResponse,
      ],
    },
  })
})

test("複数の装飾を含む段落を変換", () => {
  const token: Tokens.Paragraph = {
    type: "paragraph",
    raw: "**Bold**, *italic*, `code` and ~~strikethrough~~.",
    text: "Bold, italic, code and strikethrough.",
    tokens: [
      {
        type: "strong",
        raw: "**Bold**",
        text: "Bold",
        tokens: [
          {
            type: "text",
            raw: "Bold",
            text: "Bold",
          } as Tokens.Text,
        ],
      } as Tokens.Strong,
      {
        type: "text",
        raw: ", ",
        text: ", ",
      } as Tokens.Text,
      {
        type: "em",
        raw: "*italic*",
        text: "italic",
        tokens: [
          {
            type: "text",
            raw: "italic",
            text: "italic",
          } as Tokens.Text,
        ],
      } as Tokens.Em,
      {
        type: "text",
        raw: ", ",
        text: ", ",
      } as Tokens.Text,
      {
        type: "codespan",
        raw: "`code`",
        text: "code",
      } as Tokens.Codespan,
      {
        type: "text",
        raw: " and ",
        text: " and ",
      } as Tokens.Text,
      {
        type: "del",
        raw: "~~strikethrough~~",
        text: "strikethrough",
        tokens: [
          {
            type: "text",
            raw: "strikethrough",
            text: "strikethrough",
          } as Tokens.Text,
        ],
      } as Tokens.Del,
      {
        type: "text",
        raw: ".",
        text: ".",
      } as Tokens.Text,
    ],
  }

  const result = parseParagraphToken(token)

  expect(result).toEqual({
    type: "paragraph",
    paragraph: {
      rich_text: [
        {
          type: "text",
          text: { content: "Bold" },
          plain_text: "Bold",
          annotations: {
            bold: true,
          },
        } as RichTextItemResponse,
        {
          type: "text",
          text: { content: ", " },
          plain_text: ", ",
          annotations: {},
        } as RichTextItemResponse,
        {
          type: "text",
          text: { content: "italic" },
          plain_text: "italic",
          annotations: {
            italic: true,
          },
        } as RichTextItemResponse,
        {
          type: "text",
          text: { content: ", " },
          plain_text: ", ",
          annotations: {},
        } as RichTextItemResponse,
        {
          type: "text",
          text: { content: "code" },
          plain_text: "code",
          annotations: {
            code: true,
          },
        } as RichTextItemResponse,
        {
          type: "text",
          text: { content: " and " },
          plain_text: " and ",
          annotations: {},
        } as RichTextItemResponse,
        {
          type: "text",
          text: { content: "strikethrough" },
          plain_text: "strikethrough",
          annotations: {
            strikethrough: true,
          },
        } as RichTextItemResponse,
        {
          type: "text",
          text: { content: "." },
          plain_text: ".",
          annotations: {},
        } as RichTextItemResponse,
      ],
    },
  })
})

test("空の段落を変換", () => {
  const token: Tokens.Paragraph = {
    type: "paragraph",
    raw: "",
    text: "",
    tokens: [],
  }

  const result = parseParagraphToken(token)

  expect(result).toEqual({
    type: "paragraph",
    paragraph: {
      rich_text: [],
    },
  })
})

test("$$...$$のみの段落をequationブロックに変換", () => {
  const token = lexer("$$e = mc^2$$")[0] as Tokens.Paragraph

  const block = parseParagraphToken(token) as unknown as {
    type: string
    equation: { expression: string }
  }

  expect(block.type).toBe("equation")
  expect(block.equation.expression).toBe("e = mc^2")
})

test("段落直下の単独画像をimageブロックに変換", () => {
  const token = lexer("![サンプル](https://example.com/a.png)")[0] as Tokens.Paragraph

  const block = parseParagraphToken(token) as unknown as {
    type: string
    image: { external: { url: string }; caption: Array<{ text: { content: string } }> }
  }

  expect(block.type).toBe("image")
  expect(block.image.external.url).toBe("https://example.com/a.png")
  expect(block.image.caption[0]?.text.content).toBe("サンプル")
})

test("テキスト中のインライン画像はリンクとして保持", () => {
  const token = lexer("前 ![alt](https://example.com/a.png) 後")[0] as Tokens.Paragraph

  const block = parseParagraphToken(token) as unknown as {
    type: string
    paragraph: { rich_text: Array<{ text: { content: string; link?: { url: string } } }> }
  }

  expect(block.type).toBe("paragraph")
  const linkItem = block.paragraph.rich_text.find((item) => item.text.link)
  expect(linkItem?.text.link?.url).toBe("https://example.com/a.png")
  expect(linkItem?.text.content).toBe("alt")
})

test("複数の数式と平文が混在する段落はequationブロックにしない", () => {
  const token = lexer("$$a$$ と本文 $$b$$")[0] as Tokens.Paragraph

  const block = parseParagraphToken(token)

  expect(block.type).toBe("paragraph")
})
