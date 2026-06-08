import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"

type RichTextProperty = Extract<PageObjectResponse["properties"][string], { type: "rich_text" }>

/**
 * Notionのrich_textプロパティを文字列に変換
 */
export function fromNotionRichTextProperty(property: RichTextProperty): string {
  if (!property.rich_text || !Array.isArray(property.rich_text)) {
    return ""
  }

  return property.rich_text.map((richText) => richText.plain_text).join("")
}
