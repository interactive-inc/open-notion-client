import type { LinkToPageBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"

/**
 * Convert Notion link_to_page block to markdown
 */
export function fromNotionLinkToPageBlock(
  block: LinkToPageBlockObjectResponse,
): string {
  const linkToPage = block.link_to_page

  if (linkToPage.type === "page_id") {
    const pageId = linkToPage.page_id.replace(/-/g, "")
    return `https://www.notion.so/${pageId}`
  }

  if (linkToPage.type === "database_id") {
    const databaseId = linkToPage.database_id.replace(/-/g, "")
    return `https://www.notion.so/${databaseId}`
  }

  return ""
}
