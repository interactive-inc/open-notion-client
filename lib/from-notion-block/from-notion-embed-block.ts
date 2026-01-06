import type { EmbedBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"

/**
 * Convert Notion embed block to markdown
 */
export function fromNotionEmbedBlock(block: EmbedBlockObjectResponse): string {
  return block.embed.url
}
