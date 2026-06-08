import type { BlockObjectRequest } from "@notionhq/client/build/src/api-endpoints"
import { BlockType } from "@/types"

/**
 * Markdownの水平線をNotionのdividerブロックに変換
 */
export function parseHrToken(): BlockObjectRequest {
  return {
    type: BlockType.Divider,
    divider: {},
  } as const
}
