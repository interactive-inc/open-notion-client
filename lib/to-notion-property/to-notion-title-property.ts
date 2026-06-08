import { z } from "zod"
import type { NotionTitlePropertyRequest } from "@/types"

const titlePropertySchema = z.string()

/**
 * 値をNotionのtitleプロパティに変換
 */
export function toNotionTitleProperty(value: unknown): NotionTitlePropertyRequest {
  const data = titlePropertySchema.parse(value)

  return {
    title: [
      {
        type: "text",
        text: {
          content: data,
        },
      },
    ],
  }
}
