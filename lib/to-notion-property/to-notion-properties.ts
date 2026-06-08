import type { NotionPropertyRequest, NotionPropertySchema, SchemaType } from "@/types"
import { toNotionProperty } from "./to-notion-property"

/**
 * スキーマに基づいてオブジェクトをNotionプロパティに変換
 * 読み取り専用プロパティ（created_*, last_edited_*, formula）は黙ってスキップする
 */
export function toNotionProperties<
  T extends NotionPropertySchema,
  D extends Partial<SchemaType<T>>,
>(schema: T, data: D): Record<string, NotionPropertyRequest> {
  const properties: Record<string, NotionPropertyRequest> = {}

  for (const [key, config] of Object.entries(schema)) {
    const value = data[key as keyof SchemaType<T>]

    if (value === undefined) {
      continue
    }

    const converted = toNotionProperty(config, value)

    if (converted === null) {
      continue
    }

    properties[key] = converted
  }

  return properties
}
