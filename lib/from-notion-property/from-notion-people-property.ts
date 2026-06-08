import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { fromNotionUser } from "@/from-notion-property/from-notion-user"
import type { NotionUser } from "@/types"

type PeopleProperty = Extract<PageObjectResponse["properties"][string], { type: "people" }>

/**
 * Notionのpeopleプロパティを{@link NotionUser}配列に変換
 */
export function fromNotionPeopleProperty(property: PeopleProperty): NotionUser[] {
  if (!property.people || !Array.isArray(property.people)) {
    return []
  }

  return property.people.map(fromNotionUser)
}
