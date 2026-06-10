import { fromNotionBlock } from "@/from-notion-block/from-notion-block"
import type { NotionBlock } from "@/types"

/**
 * Convert Notion column block to markdown
 */
export function fromNotionColumnBlock(block: NotionBlock): string {
  return block.children
    .map((child) => fromNotionBlock(child))
    .filter((md): md is string => md !== null && md !== "")
    .join("\n\n")
}
