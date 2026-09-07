import type { ListBlockChildrenResponse } from "@notionhq/client/build/src/api-endpoints"

export function notionBlockList(
  results: ListBlockChildrenResponse["results"],
  nextCursor: string | null = null,
): ListBlockChildrenResponse {
  return {
    object: "list",
    type: "block",
    block: {},
    results,
    next_cursor: nextCursor,
    has_more: nextCursor !== null,
  }
}
