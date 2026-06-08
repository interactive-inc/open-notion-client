import { z } from "zod"
import type { NotionCheckboxPropertyRequest } from "@/types"

const checkboxPropertySchema = z.boolean()

/**
 * unknownをNotionのcheckboxプロパティに変換
 * booleanでない場合はエラー（nullも許可しない）
 */
export function toNotionCheckboxProperty(value: unknown): NotionCheckboxPropertyRequest {
  const data = checkboxPropertySchema.parse(value)

  return {
    checkbox: data,
  }
}
