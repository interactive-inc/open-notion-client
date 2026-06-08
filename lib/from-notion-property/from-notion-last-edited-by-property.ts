import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { fromNotionUser } from "@/from-notion-property/from-notion-user"
import type { NotionUser } from "@/types"

type LastEditedByProperty = Extract<
  PageObjectResponse["properties"][string],
  { type: "last_edited_by" }
>

/**
 * Notionのlast_edited_byプロパティを{@link NotionUser}に変換
 */
export function fromNotionLastEditedByProperty(property: LastEditedByProperty): NotionUser {
  return fromNotionUser(property.last_edited_by)
}
