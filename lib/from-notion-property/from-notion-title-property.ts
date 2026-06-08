import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"

type TitleProperty = Extract<PageObjectResponse["properties"][string], { type: "title" }>

/**
 * Notionのtitleプロパティを文字列に変換
 */
export function fromNotionTitleProperty(property: TitleProperty): string {
  if (!property.title || !Array.isArray(property.title)) {
    return ""
  }

  return property.title.map((richText) => richText.plain_text).join("")
}
