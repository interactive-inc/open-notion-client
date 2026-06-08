import { z } from "zod"
import type { NotionEmailPropertyRequest } from "@/types"

const emailPropertySchema = z.string().nullable()

/**
 * unknownをNotionのemailプロパティに変換
 * nullは許可、それ以外でstringでない場合はエラー
 */
export function toNotionEmailProperty(value: unknown): NotionEmailPropertyRequest {
  const data = emailPropertySchema.parse(value)

  return {
    email: data && data.length > 0 ? data : null,
  }
}
