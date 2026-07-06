import type { BlockObjectRequest } from "@notionhq/client/build/src/api-endpoints"
import type { Tokens } from "marked"
import { extractListItemInline } from "@/to-notion-block/extract-list-item-inline"
import { flattenListItemDescendants } from "@/to-notion-block/flatten-list-item-descendants"
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
 * 4階層目以降の項目は3階層目の兄弟としてフラット化して保持する
 */
export function parseNestedNumberedListItemToken(item: Tokens.ListItem): NestedChild {
  const inline = extractListItemInline(item)

  const itemListToken = item.tokens.find((t) => t.type === "list") as Tokens.List | undefined

  const children = itemListToken?.items.flatMap((child) => {
    const childBlock = itemListToken.ordered
      ? parseLastNumberedListItem(child)
      : parseLastBulletedListItem(child)
    return [childBlock, ...flattenListItemDescendants(child)]
  })

  if (item.task) {
    return {
      type: BlockType.ToDo,
      to_do: {
        rich_text: expandInlineTokens(inline),
        checked: item.checked === true,
        children: children,
      },
    }
  }

  return {
    type: BlockType.NumberedListItem,
    numbered_list_item: {
      rich_text: expandInlineTokens(inline),
      children: children,
    },
  }
}
