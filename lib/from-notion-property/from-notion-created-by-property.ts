import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { fromNotionUser } from "@/from-notion-property/from-notion-user"
import type { NotionUser } from "@/types"

type CreatedByProperty = Extract<PageObjectResponse["properties"][string], { type: "created_by" }>

/**
 * Notionのcreated_byプロパティを{@link NotionUser}に変換
 */
export function fromNotionCreatedByProperty(property: CreatedByProperty): NotionUser {
  return fromNotionUser(property.created_by)
}
