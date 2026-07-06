import { z } from "zod"
import type { NotionMultiSelectPropertyRequest } from "@/types"

const multiSelectPropertySchema = z.union([z.array(z.string()), z.string()]).nullable()

type Config = {
  options?: ReadonlyArray<string> | null
}

/**
 * unknownをNotionのmulti_selectプロパティに変換
 * nullは許可して空配列相当を返す、それ以外でstring[]またはstringでない場合はエラー
 * configにoptionsが定義されている場合はoptions外の値をエラーにする
 */
export function toNotionMultiSelectProperty(
  value: unknown,
  config?: Config,
): NotionMultiSelectPropertyRequest {
  const data = multiSelectPropertySchema.parse(value)

  if (data === null) {
    return { multi_select: [] }
  }

  const names = Array.isArray(data)
    ? data.filter((name) => name.length > 0)
    : data.length > 0
      ? [data]
      : []

  for (const name of names) {
    if (config?.options && config.options.length > 0 && !config.options.includes(name)) {
      throw new Error(`選択肢 "${name}" はoptionsに定義されていません`)
    }
  }

  return {
    multi_select: names.map((name) => ({ name })),
  }
}
