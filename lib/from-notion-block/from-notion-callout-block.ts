import { fromNotionBlock } from "@/from-notion-block/from-notion-block"
import type { NotionCalloutBlock } from "@/types"
import { extractIconText, fromNotionRichTextItem } from "@/utils"

/**
 * Convert Notion callout block to markdown
 */
export function fromNotionCalloutBlock(block: NotionCalloutBlock): string {
  const text = fromNotionRichTextItem(block.callout.rich_text)
  const icon = extractIconText(block.callout.icon)
  const prefix = icon !== "" ? `${icon} ` : ""
  const content = `${prefix}${text}`
  const lines = content.split("\n").map((line) => `> ${line}`)

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
