import { fromNotionBlock } from "@/from-notion-block/from-notion-block"
import type { NotionToggleBlock } from "@/types"
import { fromNotionRichTextItem } from "@/utils"

/**
 * Convert Notion toggle block to markdown
 */
export function fromNotionToggleBlock(block: NotionToggleBlock): string {
  const text = fromNotionRichTextItem(block.toggle.rich_text)

  if (block.children.length === 0) {
    return `**${text}**`
  }

  const childMarkdown = block.children
    .map((child) => fromNotionBlock(child))
    .filter((md) => md !== "")
    .join("\n\n")

  return `**${text}**\n\n${childMarkdown}`
}
