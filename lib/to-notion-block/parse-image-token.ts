import type { BlockObjectRequest } from "@notionhq/client/build/src/api-endpoints"
import type { Tokens } from "marked"
import { BlockType } from "@/types"

/**
 * markedのimageトークンをNotionのimageブロック(external)に変換する
 * altテキストはcaptionとして保持する
 */
export function parseImageToken(token: Tokens.Image): BlockObjectRequest {
  const caption = token.text
    ? [
        {
          type: "text" as const,
          text: { content: token.text },
          plain_text: token.text,
          annotations: {},
        },
      ]
    : []

  return {
    type: BlockType.Image,
    image: {
      type: "external",
      external: { url: token.href },
      caption: caption,
    },
  }
}
