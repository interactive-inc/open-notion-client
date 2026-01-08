import type { DividerBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"

/**
 * Convert Notion divider block to markdown
 */
export function fromNotionDividerBlock(
  block: DividerBlockObjectResponse,
): string {
  return "---"
}
