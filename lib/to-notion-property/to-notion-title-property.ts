import { z } from "zod"
import { splitTextContent } from "@/to-notion-property/split-text-content"
import type { NotionTitlePropertyRequest } from "@/types"

const titlePropertySchema = z.string().nullable()

/**
 * 値をNotionのtitleプロパティに変換
 * nullは空のrich_text配列（値クリア）として扱う
 * 2000文字を超える文字列はNotion APIの制限に合わせて複数要素に分割する
 */
export function toNotionTitleProperty(value: unknown): NotionTitlePropertyRequest {
  const data = titlePropertySchema.parse(value)

  if (data === null) {
    return { title: [] }
  }

  return {
    title: splitTextContent(data).map((content) => ({
      type: "text",
      text: {
        content,
      },
    })),
  }
}
