import { fromNotionBlock } from "@/from-notion-block/from-notion-block"
import type { NotionBulletedListItemBlock } from "@/types"
import { fromNotionRichTextItem } from "@/utils"

export function fromNotionBulletedListItemBlock(
  block: NotionBulletedListItemBlock,
): string {
  const itemText = `- ${fromNotionRichTextItem(block.bulleted_list_item.rich_text)}`

  if (!block.children || block.children.length === 0) {
    return itemText
  }

  const childrenText = block.children
    .map((childBlock) => {
      const childMarkdown = fromNotionBlock(childBlock)
      return childMarkdown
        .split("\n")
        .map((line) => `    ${line}`)
        .join("\n")
    })
    .join("\n")

  return `${itemText}\n${childrenText}`.trim()
}
