import type { BlockObjectRequest } from "@notionhq/client/build/src/api-endpoints"
import type { Tokens } from "marked"
import { extractListItemInline } from "@/to-notion-block/extract-list-item-inline"
import { expandInlineTokens } from "@/to-notion-block/parse-inline-token"
import { parseNestedBulletedListItemToken } from "@/to-notion-block/parse-nested-bulleted-list-item-token"
import { parseNestedNumberedListItemToken } from "@/to-notion-block/parse-nested-numbered-list-item-token"
import { BlockType } from "@/types"

/**
 * Convert numbered list item token to Notion block
 */
export function parseNumberedListItemToken(item: Tokens.ListItem): BlockObjectRequest {
  const inline = extractListItemInline(item)

  const itemListToken = item.tokens.find((t) => t.type === "list") as Tokens.List | undefined

  const children = itemListToken?.items.map((child) => {
    return itemListToken.ordered
      ? parseNestedNumberedListItemToken(child)
      : parseNestedBulletedListItemToken(child)
  })

  // GFMではタスクリストは番号付きリストでも有効。checked情報を落とさずto_doにする
  if (item.task) {
    return {
      type: BlockType.ToDo,
      to_do: {
        rich_text: expandInlineTokens(inline),
        checked: item.checked === true,
        children: children && children.length > 0 ? children : undefined,
      },
    }
  }

  return {
    type: BlockType.NumberedListItem,
    numbered_list_item: {
      rich_text: expandInlineTokens(inline),
      children: children && children.length > 0 ? children : undefined,
    },
  }
}
