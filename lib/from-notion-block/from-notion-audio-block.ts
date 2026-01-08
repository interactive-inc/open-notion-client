import type { AudioBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { extractFileUrl } from "@/utils"

/**
 * Convert Notion audio block to markdown
 */
export function fromNotionAudioBlock(block: AudioBlockObjectResponse): string {
  const url = extractFileUrl(block.audio)

  if (url === "") {
    return ""
  }

  return `[音声](${url})`
}
