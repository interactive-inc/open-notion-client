type Page = { has_more: boolean; next_cursor: string | null }

/** 不整合や循環したcursorを成功扱いすると、欠落や無限ループが発生する。 */
export function paginationCursor(page: Page, visited: Set<string>): string | null {
  if (!page.has_more) return null

  const cursor = page.next_cursor

  if (!cursor || visited.has(cursor)) {
    throw new Error(`Invalid pagination cursor: ${cursor}`)
  }

  visited.add(cursor)

  return cursor
}
