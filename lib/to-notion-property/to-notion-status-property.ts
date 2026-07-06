import { z } from "zod"
import type { NotionStatusPropertyRequest } from "@/types"

const statusPropertySchema = z.string().nullable()

type Config = {
  options?: ReadonlyArray<string> | null
}

/**
 * unknownをNotionのstatusプロパティに変換
 * nullまたは空文字列はステータス解除（null）として扱う
 * configにoptionsが定義されている場合はoptions外の値をエラーにする
 * statusは未知のoptionを渡すとNotion APIが400を返すため事前検証が必須
 */
export function toNotionStatusProperty(
  value: unknown,
  config?: Config,
): NotionStatusPropertyRequest {
  const data = statusPropertySchema.parse(value)

  if (data === null || data.length === 0) {
    return { status: null }
  }

  if (config?.options && config.options.length > 0 && !config.options.includes(data)) {
    throw new Error(`選択肢 "${data}" はoptionsに定義されていません`)
  }

  return {
    status: { name: data },
  }
}
