import type { Tokens } from "marked"
import type { RichTextItemResponse } from "@/types"

type Annotations = NonNullable<RichTextItemResponse["annotations"]>

type Carry = {
  bold: boolean
  italic: boolean
  strikethrough: boolean
  underline: boolean
  code: boolean
  href: string | null
}

const baseAnnotations: Carry = {
  bold: false,
  italic: false,
  strikethrough: false,
  underline: false,
  code: false,
  href: null,
}

function withFlag(carry: Carry, flag: keyof Omit<Carry, "href">): Carry {
  return { ...carry, [flag]: true }
}

function withHref(carry: Carry, href: string): Carry {
  return { ...carry, href: href }
}

function toAnnotations(carry: Carry): Annotations {
  const annotations: Annotations = {}
  if (carry.bold) annotations.bold = true
  if (carry.italic) annotations.italic = true
  if (carry.strikethrough) annotations.strikethrough = true
  if (carry.underline) annotations.underline = true
  if (carry.code) annotations.code = true
  return annotations
}

function buildItem(text: string, carry: Carry): RichTextItemResponse {
  const annotations = toAnnotations(carry)

  if (carry.href) {
    return {
      type: "text",
      text: {
        content: text,
        link: { url: carry.href },
      },
      plain_text: text,
      annotations: annotations,
    }
  }

  return {
    type: "text",
    text: {
      content: text,
    },
    plain_text: text,
    annotations: annotations,
  }
}

/**
 * markedのインライントークンを再帰的に展開し、Notionのrich_text配列に変換する
 * strong/em/del/codespan/linkの組み合わせやネストを正しく扱う
 */
export function expandInlineTokens(
  tokens: Tokens.Generic[],
  carry: Carry = baseAnnotations,
): RichTextItemResponse[] {
  const result: RichTextItemResponse[] = []

  for (const token of tokens) {
    if (token.type === "strong") {
      const next = withFlag(carry, "bold")
      const nested = (token as Tokens.Strong).tokens
      if (nested && nested.length > 0) {
        result.push(...expandInlineTokens(nested, next))
        continue
      }
      result.push(buildItem(token.text, next))
      continue
    }

    if (token.type === "em") {
      const next = withFlag(carry, "italic")
      const nested = (token as Tokens.Em).tokens
      if (nested && nested.length > 0) {
        result.push(...expandInlineTokens(nested, next))
        continue
      }
      result.push(buildItem(token.text, next))
      continue
    }

    if (token.type === "del") {
      const next = withFlag(carry, "strikethrough")
      const nested = (token as Tokens.Del).tokens
      if (nested && nested.length > 0) {
        result.push(...expandInlineTokens(nested, next))
        continue
      }
      result.push(buildItem(token.text, next))
      continue
    }

    if (token.type === "codespan") {
      result.push(buildItem(token.text, withFlag(carry, "code")))
      continue
    }

    if (token.type === "link") {
      const link = token as Tokens.Link
      const next = withHref(carry, link.href)
      if (link.tokens && link.tokens.length > 0) {
        result.push(...expandInlineTokens(link.tokens, next))
        continue
      }
      result.push(buildItem(link.text, next))
      continue
    }

    if (token.type === "br") {
      result.push(buildItem("\n", carry))
      continue
    }

    const text = (token as Tokens.Text).text ?? ""
    result.push(buildItem(text, carry))
  }

  return result
}

/**
 * 単一のインライントークンをNotionのrich_text項目に変換
 * 後方互換のため単一項目を返す。複数項目を返すべきケースでは{@link expandInlineTokens}を使う
 */
export function parseInlineToken(token: Tokens.Generic): RichTextItemResponse {
  const items = expandInlineTokens([token])
  if (items.length === 0) {
    return buildItem("", baseAnnotations)
  }
  return items[0] as RichTextItemResponse
}
