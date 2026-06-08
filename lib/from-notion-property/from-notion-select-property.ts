import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"

type SelectProperty = Extract<PageObjectResponse["properties"][string], { type: "select" }>

/**
 * Notionのselectプロパティを文字列に変換
 */
export function fromNotionSelectProperty(property: SelectProperty): string | null {
  return property.select?.name || null
}
