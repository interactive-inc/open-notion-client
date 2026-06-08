import { z } from "zod"
import type { NotionRichTextPropertyRequest } from "@/types"

const richTextPropertySchema = z.string()

/**
 * 値をNotionのrich_textプロパティに変換
 */
export function toNotionRichTextProperty(value: unknown): NotionRichTextPropertyRequest {
  const data = richTextPropertySchema.parse(value)

  return {
    rich_text: [
      {
        type: "text",
        text: {
          content: data,
        },
      },
    ],
  }
}
