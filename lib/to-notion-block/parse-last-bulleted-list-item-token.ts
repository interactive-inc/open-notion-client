import type { BlockObjectRequestWithoutChildren } from "@notionhq/client/build/src/api-endpoints"
import type { Tokens } from "marked"
import { extractListItemInline } from "@/to-notion-block/extract-list-item-inline"
import { expandInlineTokens } from "@/to-notion-block/parse-inline-token"
import { BlockType } from "@/types"

/**
 * Convert last bulleted list item to Notion block
 */
export function parseLastBulletedListItem(
  item: Tokens.ListItem,
): BlockObjectRequestWithoutChildren {
  const richText = expandInlineTokens(extractListItemInline(item))

  if (item.task) {
    return {
      type: BlockType.ToDo,
      to_do: {
        rich_text: richText,
        checked: item.checked === true,
      },
    }
  }

  return {
    type: BlockType.BulletedListItem,
    bulleted_list_item: {
      rich_text: richText,
    },
  }
}
