import type { ChildDatabaseBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"

/**
 * Convert Notion child_database block to markdown
 */
export function fromNotionChildDatabaseBlock(
  block: ChildDatabaseBlockObjectResponse,
): string {
  const databaseId = block.id.replace(/-/g, "")
  return `[${block.child_database.title}](https://www.notion.so/${databaseId})`
}
