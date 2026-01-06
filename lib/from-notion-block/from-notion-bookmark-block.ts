import type { BookmarkBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"

/**
 * Convert Notion bookmark block to markdown
 */
export function fromNotionBookmarkBlock(
  block: BookmarkBlockObjectResponse,
): string {
  return block.bookmark.url
}
