import type { BlockObjectRequest } from "@notionhq/client/build/src/api-endpoints"
import type { Token, Tokens } from "marked"
import { parseImageToken } from "@/to-notion-block/parse-image-token"
import { expandInlineTokens } from "@/to-notion-block/parse-inline-token"
import { BlockType } from "@/types"

/**
 * テキスト全体が $$...$$ の場合に数式表現を取り出す
 */
function extractEquationExpression(text: string): string | null {
  const matched = text.trim().match(/^\$\$([\s\S]+)\$\$$/)

  if (!matched || matched[1] === undefined) return null

  // 内側に $$ が現れる場合は複数の数式や平文が混在した段落なので数式ブロックにしない
  if (matched[1].includes("$$")) return null

  return matched[1].trim()
}

/**
 * 段落直下が単独のimageトークンの場合にそれを取り出す
 */
function extractSoleImageToken(tokens: Token[]): Tokens.Image | null {
  const meaningfulTokens = tokens.filter(
    (token) => !(token.type === "text" && token.raw.trim() === ""),
  )

  const first = meaningfulTokens[0]

  if (meaningfulTokens.length === 1 && first && first.type === "image") {
    return first as Tokens.Image
  }

  return null
}

/**
 * Convert paragraph token to Notion block
 * $$...$$ のみの段落はequationブロック、単独画像はimageブロックとして生成する
 */
export function parseParagraphToken(token: Tokens.Paragraph): BlockObjectRequest {
  const equationExpression = extractEquationExpression(token.text)

  if (equationExpression !== null) {
    return {
      type: BlockType.Equation,
      equation: { expression: equationExpression },
    }
  }

  const soleImageToken = extractSoleImageToken(token.tokens)

  if (soleImageToken !== null) {
    return parseImageToken(soleImageToken)
  }

  return {
    type: BlockType.Paragraph,
    paragraph: {
      rich_text: expandInlineTokens(token.tokens),
    },
  } as const
}
