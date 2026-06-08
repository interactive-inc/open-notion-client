import { z } from "zod"
import type { NotionStatusPropertyRequest } from "@/types"

const statusPropertySchema = z.string().nullable()

/**
 * unknownをNotionのstatusプロパティに変換
 * nullまたは空文字列はステータス解除（null）として扱う
 */
export function toNotionStatusProperty(value: unknown): NotionStatusPropertyRequest {
  const data = statusPropertySchema.parse(value)

  return {
    status: data && data.length > 0 ? { name: data } : null,
  }
}
