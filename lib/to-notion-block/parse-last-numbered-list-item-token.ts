import type { BlockObjectRequestWithoutChildren } from "@notionhq/client/build/src/api-endpoints"
import type { Tokens } from "marked"
import { extractListItemInline } from "@/to-notion-block/extract-list-item-inline"
import { expandInlineTokens } from "@/to-notion-block/parse-inline-token"
import { BlockType } from "@/types"

/**
 * Convert last numbered list item to Notion block
 */
export function parseLastNumberedListItem(
  item: Tokens.ListItem,
): BlockObjectRequestWithoutChildren {
  if (item.task) {
    return {
      type: BlockType.ToDo,
      to_do: {
        rich_text: expandInlineTokens(extractListItemInline(item)),
        checked: item.checked === true,
      },
    }
  }

  return {
    type: BlockType.NumberedListItem,
    numbered_list_item: {
      rich_text: expandInlineTokens(extractListItemInline(item)),
    },
  }
}
