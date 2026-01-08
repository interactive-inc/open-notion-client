import type { ChildPageBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"

/**
 * Convert Notion child_page block to markdown
 */
export function fromNotionChildPageBlock(
  block: ChildPageBlockObjectResponse,
): string {
  const pageId = block.id.replace(/-/g, "")
  return `[${block.child_page.title}](https://www.notion.so/${pageId})`
}
