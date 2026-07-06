import { z } from "zod"
import { splitTextContent } from "@/to-notion-property/split-text-content"
import type { NotionRichTextPropertyRequest } from "@/types"

const richTextPropertySchema = z.string().nullable()

/**
 * 値をNotionのrich_textプロパティに変換
 * nullは空のrich_text配列（値クリア）として扱う
 * 2000文字を超える文字列はNotion APIの制限に合わせて複数要素に分割する
 */
export function toNotionRichTextProperty(value: unknown): NotionRichTextPropertyRequest {
  const data = richTextPropertySchema.parse(value)

  if (data === null) {
    return { rich_text: [] }
  }

  return {
    rich_text: splitTextContent(data).map((content) => ({
      type: "text",
      text: {
        content,
      },
    })),
  }
}
