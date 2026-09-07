import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { notionRichText } from "@/testing/notion-rich-text"

export function notionPage(id = "page-1", title = "Title"): PageObjectResponse {
  return {
    object: "page",
    id,
    created_time: "2026-01-01T00:00:00.000Z",
    last_edited_time: "2026-01-01T00:00:00.000Z",
    in_trash: false,
    archived: false,
    is_archived: false,
    is_locked: false,
    url: `https://notion.so/${id}`,
    public_url: null,
    parent: { type: "data_source_id", data_source_id: "source-1", database_id: "database-1" },
    properties: { title: { id: "title", type: "title", title: [notionRichText(title)] } },
    icon: null,
    cover: null,
    created_by: { object: "user", id: "user-1" },
    last_edited_by: { object: "user", id: "user-1" },
  }
}
