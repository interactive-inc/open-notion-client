import { fromNotionBlock } from "@/from-notion-block/from-notion-block"
import type { NotionNumberedListItemBlock } from "@/types"
import { fromNotionRichTextItem } from "@/utils"

export function fromNotionNumberedListItemBlock(block: NotionNumberedListItemBlock): string {
  const itemText = `1. ${fromNotionRichTextItem(block.numbered_list_item.rich_text)}`

  if (!block.children || block.children.length === 0) {
    return itemText
  }

  const childrenText = block.children
    .map((childBlock) => fromNotionBlock(childBlock))
    .filter((md): md is string => md !== null && md !== "")
    .map((md) =>
      md
        .split("\n")
        .map((line) => `    ${line}`)
        .join("\n"),
    )
    .join("\n")

  return `${itemText}\n${childrenText}`
}
