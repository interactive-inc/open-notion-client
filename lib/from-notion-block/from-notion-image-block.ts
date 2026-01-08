import type { ImageBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { extractFileUrl, fromNotionRichTextItem } from "@/utils"

/**
 * Convert Notion image block to markdown
 */
export function fromNotionImageBlock(block: ImageBlockObjectResponse): string {
  const caption = fromNotionRichTextItem(block.image.caption)
  const alt = caption !== "" ? caption : "image"
  const url = extractFileUrl(block.image)

  if (url === "") {
    return ""
  }

  return `![${alt}](${url})`
}
