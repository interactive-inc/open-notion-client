import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import type { NotionPropertySchema, SchemaType } from "@/types"
import { fromNotionProperty } from "@/from-notion-property/from-notion-property"

/**
 * Notionのプロパティをスキーマに基づいて変換
 */
export function fromNotionProperties<T extends NotionPropertySchema>(
  schema: T,
  properties: PageObjectResponse["properties"],
): SchemaType<T> {
  const result: Array<[string, unknown]> = []

  for (const entry of Object.entries(schema)) {
    const key = entry[0]
    const config = entry[1]
    const property = Object.hasOwn(properties, key) ? properties[key] : undefined

    if (!property) {
      result.push([key, null])
      continue
    }

    if (property.type !== config.type) {
      throw new Error(
        `プロパティ ${key} の型が一致しません。期待: ${config.type}, 実際: ${property.type}`,
      )
    }

    result.push([key, fromNotionProperty(property, config)])
  }

  return Object.fromEntries(result) as SchemaType<T>
}
