import type { Heading3BlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { fromNotionRichTextItem } from "@/utils"

export function fromNotionHeadingThreeBlock(block: Heading3BlockObjectResponse): string {
  return `### ${fromNotionRichTextItem(block.heading_3.rich_text)}`.trim()
}
