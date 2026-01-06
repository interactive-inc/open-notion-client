import { fromNotionBlock } from "@/from-notion-block/from-notion-block"
import type { NotionBlock } from "@/types"

/**
 * Convert Notion column_list block to markdown
 */
export function fromNotionColumnListBlock(block: NotionBlock): string {
  return block.children
    .map((child) => fromNotionBlock(child))
    .filter((md) => md !== "")
    .join("\n\n")
}
