import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"

type RelationProperty = Extract<PageObjectResponse["properties"][string], { type: "relation" }>

/**
 * Notionのrelationプロパティをページid配列に変換
 */
export function fromNotionRelationProperty(property: RelationProperty): string[] {
  if (!property.relation || !Array.isArray(property.relation)) {
    return []
  }

  return property.relation.map((item) => item.id)
}
