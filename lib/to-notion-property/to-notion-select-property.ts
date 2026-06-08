import { z } from "zod"
import type { NotionSelectPropertyRequest } from "@/types"

const selectPropertySchema = z.string().nullable()

/**
 * unknownをNotionのselectプロパティに変換
 * nullは許可、それ以外でstringでない場合はエラー
 */
export function toNotionSelectProperty(value: unknown): NotionSelectPropertyRequest {
  const data = selectPropertySchema.parse(value)

  return {
    select: data && data.length > 0 ? { name: data } : null,
  }
}
