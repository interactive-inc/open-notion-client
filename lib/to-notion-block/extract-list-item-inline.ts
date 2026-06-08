import type { Tokens } from "marked"

/**
 * marked のリスト項目トークンからインライントークン列を抽出する
 * ネストしたリストは除き、textトークン内のnested tokensは展開して返す
 */
export function extractListItemInline(item: Tokens.ListItem): Tokens.Generic[] {
  const inline: Tokens.Generic[] = []

  for (const token of item.tokens) {
    if (token.type === "list") {
      continue
    }

    if (token.type === "text") {
      const text = token as Tokens.Text
      if (text.tokens && text.tokens.length > 0) {
        inline.push(...text.tokens)
        continue
      }
      inline.push(text)
      continue
    }

    if (token.type === "space") {
      continue
    }

    if (token.type === "paragraph") {
      const para = token as Tokens.Paragraph
      if (para.tokens && para.tokens.length > 0) {
        inline.push(...para.tokens)
        continue
      }
      continue
    }

    inline.push(token)
  }

  return inline
}
