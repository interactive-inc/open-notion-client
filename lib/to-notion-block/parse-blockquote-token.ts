import type { BlockObjectRequest } from "@notionhq/client/build/src/api-endpoints"
import type { Tokens } from "marked"
import { parseCodeToken } from "@/to-notion-block/parse-code-token"
import { expandInlineTokens } from "@/to-notion-block/parse-inline-token"
import { parseNestedBulletedListItemToken } from "@/to-notion-block/parse-nested-bulleted-list-item-token"
import { parseNestedNumberedListItemToken } from "@/to-notion-block/parse-nested-numbered-list-item-token"
import { BlockType } from "@/types"

type QuoteRequest = Extract<BlockObjectRequest, { type?: "quote" }>

type QuoteChild = NonNullable<QuoteRequest["quote"]["children"]>[number]

/**
 * markedのblockquoteトークンをNotionのquoteブロックに変換
 * 本文の段落を改行で連結して単一のquoteとし、
 * 引用内のリストとコードブロックはchildrenとして保持する
 */
export function parseBlockquoteToken(token: Tokens.Blockquote): BlockObjectRequest {
  const inline: Tokens.Generic[] = []

  const children: QuoteChild[] = []

  for (const child of token.tokens) {
    if (child.type === "paragraph") {
      if (inline.length > 0) {
        inline.push({ type: "text", text: "\n", raw: "\n" })
      }
      inline.push(...(child as Tokens.Paragraph).tokens)
      continue
    }

    if (child.type === "list") {
      const listToken = child as Tokens.List
      for (const listItem of listToken.items) {
        children.push(
          listToken.ordered
            ? parseNestedNumberedListItemToken(listItem)
            : parseNestedBulletedListItemToken(listItem),
        )
      }
      continue
    }

    if (child.type === "code") {
      children.push(parseCodeToken(child as Tokens.Code))
    }
  }

  return {
    type: BlockType.Quote,
    quote: {
      rich_text: expandInlineTokens(inline),
      children: children.length > 0 ? children : undefined,
    },
  }
}
