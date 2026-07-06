import type { BlockObjectRequestWithoutChildren } from "@notionhq/client/build/src/api-endpoints"
import type { Tokens } from "marked"
import { parseLastBulletedListItem } from "@/to-notion-block/parse-last-bulleted-list-item-token"
import { parseLastNumberedListItem } from "@/to-notion-block/parse-last-numbered-list-item-token"

/**
 * リスト項目配下の4階層目以降の項目をフラットに収集する
 * Notion APIは1リクエストで2階層までのchildrenしか受け付けないため、
 * 深い項目は3階層目の兄弟として保持する(黙って消失させない)
 */
export function flattenListItemDescendants(
  item: Tokens.ListItem,
): BlockObjectRequestWithoutChildren[] {
  const collected: BlockObjectRequestWithoutChildren[] = []

  for (const token of item.tokens) {
    if (token.type !== "list") continue

    for (const child of token.items) {
      collected.push(
        token.ordered ? parseLastNumberedListItem(child) : parseLastBulletedListItem(child),
      )
      collected.push(...flattenListItemDescendants(child))
    }
  }

  return collected
}
