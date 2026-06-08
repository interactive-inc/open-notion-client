import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"

type NumberProperty = Extract<PageObjectResponse["properties"][string], { type: "number" }>

/**
 * Notionのnumberプロパティを数値に変換
 */
export function fromNotionNumberProperty(property: NumberProperty): number | null {
  return property.number
}
