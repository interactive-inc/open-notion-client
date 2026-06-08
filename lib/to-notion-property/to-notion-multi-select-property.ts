import { z } from "zod"
import type { NotionMultiSelectPropertyRequest } from "@/types"

const multiSelectPropertySchema = z.union([z.array(z.string()), z.string()]).nullable()

/**
 * unknownをNotionのmulti_selectプロパティに変換
 * nullは許可して空配列相当を返す、それ以外でstring[]またはstringでない場合はエラー
 */
export function toNotionMultiSelectProperty(value: unknown): NotionMultiSelectPropertyRequest {
  const data = multiSelectPropertySchema.parse(value)

  if (data === null) {
    return { multi_select: [] }
  }

  let values: string[] = []

  if (Array.isArray(data)) {
    values = data.filter((v) => v.length > 0)
  } else if (data && data.length > 0) {
    values = [data]
  }

  return {
    multi_select: values.map((v) => ({ name: v })),
  }
}
