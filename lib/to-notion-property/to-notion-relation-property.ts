import { z } from "zod"
import type { NotionRelationPropertyRequest } from "@/types"

const relationPropertySchema = z.union([z.array(z.string()), z.string()]).nullable()

/**
 * unknownをNotionのrelationプロパティに変換
 * nullは許可して空配列相当を返す、それ以外でstring[]またはstringでない場合はエラー
 */
export function toNotionRelationProperty(value: unknown): NotionRelationPropertyRequest {
  const data = relationPropertySchema.parse(value)

  if (data === null) {
    return { relation: [] }
  }

  let ids: string[] = []

  if (Array.isArray(data)) {
    ids = data.filter((v) => v.length > 0)
  } else if (data && data.length > 0) {
    ids = [data]
  }

  return {
    relation: ids.map((id) => ({ id })),
  }
}
