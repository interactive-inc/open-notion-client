import type { ParagraphBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { notionRichText } from "@/testing/notion-rich-text"

export function notionParagraph(
  id = "block-1",
  content = "Body",
): ParagraphBlockObjectResponse & { children: [] } {
  return {
    object: "block",
    type: "paragraph",
    id,
    parent: { type: "page_id", page_id: "page-1" },
    created_time: "2026-01-01T00:00:00.000Z",
    last_edited_time: "2026-01-01T00:00:00.000Z",
    created_by: { object: "user", id: "user-1" },
    last_edited_by: { object: "user", id: "user-1" },
    archived: false,
    in_trash: false,
    has_children: false,
    children: [],
    paragraph: { rich_text: [notionRichText(content)], color: "default", icon: null },
  }
}
