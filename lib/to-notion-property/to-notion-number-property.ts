import { z } from "zod"
import type { NotionNumberPropertyRequest } from "@/types"

const numberPropertySchema = z.number().nullable()

/**
 * 値をNotionのnumberプロパティに変換
 * nullは許可、それ以外でnumberでない場合はエラー
 */
export function toNotionNumberProperty(value: unknown): NotionNumberPropertyRequest {
  const data = numberPropertySchema.parse(value)

  return {
    number: data,
  }
}
