import { fromNotionBlock } from "@/from-notion-block/from-notion-block"
import type { NotionToDoBlock } from "@/types"
import { fromNotionRichTextItem } from "@/utils"

/**
 * Convert Notion to_do block to markdown
 */
export function fromNotionToDoBlock(block: NotionToDoBlock): string {
  const text = fromNotionRichTextItem(block.to_do.rich_text)
  const checkbox = block.to_do.checked ? "[x]" : "[ ]"
  const itemText = `- ${checkbox} ${text}`

  if (!block.children || block.children.length === 0) {
    return itemText
  }

  const childrenText = block.children
    .map((childBlock) => {
      const childMarkdown = fromNotionBlock(childBlock)
      return childMarkdown
        .split("\n")
        .map((line) => `  ${line}`)
        .join("\n")
    })
    .join("\n")

  return `${itemText}\n${childrenText}`.trim()
}
