import type { FileBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { extractFileUrl } from "@/utils"

/**
 * Convert Notion file block to markdown
 */
export function fromNotionFileBlock(block: FileBlockObjectResponse): string {
  const url = extractFileUrl(block.file)

  if (url === "") {
    return ""
  }

  return `[ファイル](${url})`
}
