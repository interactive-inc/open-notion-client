import type { LinkPreviewBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"

/**
 * Convert Notion link preview block to markdown
 */
export function fromNotionLinkPreviewBlock(
  block: LinkPreviewBlockObjectResponse,
): string {
  return block.link_preview.url
}
