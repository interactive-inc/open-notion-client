import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import type { DateRange } from "@/types"

type DateProperty = Extract<PageObjectResponse["properties"][string], { type: "date" }>

/**
 * Notionのdateプロパティを日付範囲に変換
 */
export function fromNotionDateProperty(property: DateProperty): DateRange | null {
  if (!property.date) {
    return null
  }

  return {
    start: property.date.start,
    end: property.date.end,
    timeZone: property.date.time_zone,
  }
}
