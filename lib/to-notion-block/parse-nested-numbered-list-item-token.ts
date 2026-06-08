import type { BlockObjectRequest } from "@notionhq/client/build/src/api-endpoints"
import type { Tokens } from "marked"
import { extractListItemInline } from "@/to-notion-block/extract-list-item-inline"
import { expandInlineTokens } from "@/to-notion-block/parse-inline-token"
import { parseLastBulletedListItem } from "@/to-notion-block/parse-last-bulleted-list-item-token"
import { parseLastNumberedListItem } from "@/to-notion-block/parse-last-numbered-list-item-token"
import { BlockType } from "@/types"

type NumberedRequest = Extract<BlockObjectRequest, { type?: "numbered_list_item" }>
type NestedChild = NonNullable<
  NonNullable<NumberedRequest["numbered_list_item"]>["children"]
>[number]

/**
 * Convert nested numbered list item token to Notion block
 */
export function parseNestedNumberedListItemToken(item: Tokens.ListItem): NestedChild {
  const inline = extractListItemInline(item)

  const itemListToken = item.tokens.find((t) => t.type === "list") as Tokens.List | undefined

  const children = itemListToken?.items.map((child) => {
    return itemListToken.ordered
      ? parseLastNumberedListItem(child)
      : parseLastBulletedListItem(child)
  })

  return {
    type: BlockType.NumberedListItem,
    numbered_list_item: {
      rich_text: expandInlineTokens(inline),
      children: children,
    },
  }
}
