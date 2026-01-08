import { fromNotionBlock } from "@/from-notion-block/from-notion-block"
import type { NotionQuoteBlock } from "@/types"
import { fromNotionRichTextItem } from "@/utils"

/**
 * Convert Notion quote block to markdown
 */
export function fromNotionQuoteBlock(block: NotionQuoteBlock): string {
  const text = fromNotionRichTextItem(block.quote.rich_text)
  const lines = text.split("\n").map((line) => `> ${line}`)

  if (!block.children || block.children.length === 0) {
    return lines.join("\n")
  }

  const childLines = block.children
    .map((child) => fromNotionBlock(child))
    .filter((md) => md !== "")
    .map((md) =>
      md
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n"),
    )

  return `${lines.join("\n")}\n${childLines.join("\n")}`
}
