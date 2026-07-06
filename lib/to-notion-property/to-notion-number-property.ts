import { z } from "zod"
import type { NotionNumberPropertyRequest } from "@/types"

const numberPropertySchema = z.number().nullable()

type Config = {
  min?: number
  max?: number
}

/**
 * 値をNotionのnumberプロパティに変換
 * nullは許可、それ以外でnumberでない場合はエラー
 * configにmin/maxが定義されている場合は範囲外の値をエラーにする
 */
export function toNotionNumberProperty(
  value: unknown,
  config?: Config,
): NotionNumberPropertyRequest {
  const data = numberPropertySchema.parse(value)

  if (data !== null && config?.min !== undefined && data < config.min) {
    throw new Error(`数値 ${data} が最小値 ${config.min} を下回っています`)
  }

  if (data !== null && config?.max !== undefined && data > config.max) {
    throw new Error(`数値 ${data} が最大値 ${config.max} を超えています`)
  }

  return {
    number: data,
  }
}
