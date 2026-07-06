import { z } from "zod"
import type { NotionSelectPropertyRequest } from "@/types"

const selectPropertySchema = z.string().nullable()

type Config = {
  options?: ReadonlyArray<string> | null
}

/**
 * unknownをNotionのselectプロパティに変換
 * nullは許可、それ以外でstringでない場合はエラー
 * configにoptionsが定義されている場合はoptions外の値をエラーにする
 */
export function toNotionSelectProperty(
  value: unknown,
  config?: Config,
): NotionSelectPropertyRequest {
  const data = selectPropertySchema.parse(value)

  if (data === null || data.length === 0) {
    return { select: null }
  }

  if (config?.options && config.options.length > 0 && !config.options.includes(data)) {
    throw new Error(`選択肢 "${data}" はoptionsに定義されていません`)
  }

  return {
    select: { name: data },
  }
}
