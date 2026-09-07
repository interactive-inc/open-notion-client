import type { RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints"

export function notionRichText(
  content: string,
  annotations: Partial<RichTextItemResponse["annotations"]> = {},
): RichTextItemResponse {
  return {
    type: "text",
    text: { content, link: null },
    plain_text: content,
    href: null,
    annotations: {
      bold: false,
      italic: false,
      strikethrough: false,
      underline: false,
      code: false,
      color: "default",
      ...annotations,
    },
  }
}
