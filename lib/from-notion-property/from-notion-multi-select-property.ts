import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"

type MultiSelectProperty = Extract<
  PageObjectResponse["properties"][string],
  { type: "multi_select" }
>

/**
 * Notionのmulti_selectプロパティを文字列配列に変換
 */
export function fromNotionMultiSelectProperty(property: MultiSelectProperty): string[] {
  if (!property.multi_select || !Array.isArray(property.multi_select)) {
    return []
  }

  return property.multi_select.map((item) => item.name)
}
