import type { VideoBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { extractFileUrl } from "@/utils"

/**
 * Convert Notion video block to markdown
 */
export function fromNotionVideoBlock(block: VideoBlockObjectResponse): string {
  return extractFileUrl(block.video)
}
