import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"

type CheckboxProperty = Extract<PageObjectResponse["properties"][string], { type: "checkbox" }>

/**
 * Notionのcheckboxプロパティをbooleanに変換
 */
export function fromNotionCheckboxProperty(property: CheckboxProperty): boolean {
  return property.checkbox
}
