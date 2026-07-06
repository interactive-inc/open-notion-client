import { z } from "zod"
import type { NotionCheckboxPropertyRequest } from "@/types"

const checkboxPropertySchema = z.boolean().nullable()

/**
 * unknownをNotionのcheckboxプロパティに変換
 * Notionのcheckboxに未設定状態はないためnullはfalseとして扱う
 */
export function toNotionCheckboxProperty(value: unknown): NotionCheckboxPropertyRequest {
  const data = checkboxPropertySchema.parse(value)

  return {
    checkbox: data === null ? false : data,
  }
}
