import type { BlockObjectRequest } from "@notionhq/client/build/src/api-endpoints"
import type { Tokens } from "marked"
import { expandInlineTokens } from "@/to-notion-block/parse-inline-token"
import { BlockType } from "@/types"

/**
 * markedのblockquoteトークンをNotionのquoteブロックに変換
 * 本文の段落を改行で連結して単一のquoteとする
 */
export function parseBlockquoteToken(token: Tokens.Blockquote): BlockObjectRequest {
  const inline: Tokens.Generic[] = []

  for (const child of token.tokens) {
    if (child.type === "paragraph") {
      const para = child as Tokens.Paragraph
      if (inline.length > 0) {
        inline.push({ type: "text", text: "\n", raw: "\n" } as Tokens.Generic)
      }
      inline.push(...para.tokens)
    }
  }

  return {
    type: BlockType.Quote,
    quote: {
      rich_text: expandInlineTokens(inline),
    },
  } as const
}
