import type { PdfBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { extractFileUrl } from "@/utils"

/**
 * Convert Notion PDF block to markdown
 */
export function fromNotionPdfBlock(block: PdfBlockObjectResponse): string {
  const url = extractFileUrl(block.pdf)

  if (url === "") {
    return ""
  }

  return `[PDF](${url})`
}
