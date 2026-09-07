import type { QueryDataSourceResponse } from "@notionhq/client/build/src/api-endpoints"

/** カーソルの有無を明示し、正常応答は has_more と必ず整合させる。 */
export function notionList(
  results: QueryDataSourceResponse["results"],
  nextCursor: string | null = null,
): QueryDataSourceResponse {
  return {
    type: "page_or_data_source",
    page_or_data_source: {},
    object: "list",
    results,
    next_cursor: nextCursor,
    has_more: nextCursor !== null,
  }
}
