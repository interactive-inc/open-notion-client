import type { BlockObjectRequest } from "@notionhq/client/build/src/api-endpoints"
import { lexer, type Tokens } from "marked"
import { parseBlockquoteToken } from "@/to-notion-block/parse-blockquote-token"
import { parseCodeToken } from "@/to-notion-block/parse-code-token"
import { parseHeadingToken } from "@/to-notion-block/parse-heading-token"
import { parseHrToken } from "@/to-notion-block/parse-hr-token"
import { parseListToken } from "@/to-notion-block/parse-list-token"
import { parseParagraphToken } from "@/to-notion-block/parse-paragraph-token"
import { parseTableToken } from "@/to-notion-block/parse-table-token"

/**
 * Convert markdown string to Notion blocks
 *
 * CRITICAL PARAGRAPH SEPARATION BEHAVIOR:
 * - We deliberately SKIP 'space' tokens to avoid creating unnecessary empty paragraph blocks
 * - Paragraph separation is handled by fromNotionBlocks through proper spacing between blocks
 * - This ensures clean paragraph separation without redundant empty blocks in Notion
 */
export function toNotionBlocks(markdown: string): BlockObjectRequest[] {
  const tokenList = lexer(markdown)

  const blocks: BlockObjectRequest[] = []

  for (const token of tokenList) {
    if (token.type === "heading") {
      blocks.push(parseHeadingToken(token as Tokens.Heading))
      continue
    }

    if (token.type === "list") {
      const objects = parseListToken(token as Tokens.List)
      for (const node of objects) {
        blocks.push(node)
      }
      continue
    }

    if (token.type === "code") {
      blocks.push(parseCodeToken(token as Tokens.Code))
      continue
    }

    if (token.type === "paragraph") {
      blocks.push(parseParagraphToken(token as Tokens.Paragraph))
      continue
    }

    if (token.type === "blockquote") {
      blocks.push(parseBlockquoteToken(token as Tokens.Blockquote))
      continue
    }

    if (token.type === "table") {
      blocks.push(parseTableToken(token as Tokens.Table))
      continue
    }

    if (token.type === "hr") {
      blocks.push(parseHrToken())
    }

    // CRITICAL: DO NOT process 'space' tokens here!
    // Space tokens (markdown blank lines) should NOT create empty paragraph blocks.
    // Paragraph spacing is handled in fromNotionBlocks to ensure proper paragraph separation
    // without creating redundant empty blocks that show as unwanted blank lines in Notion.
  }

  return blocks
}
