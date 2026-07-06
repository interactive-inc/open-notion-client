import { fromNotionBlock } from "@/from-notion-block/from-notion-block"
import type { NotionBlock } from "@/types"

type Props = {
  onUnsupportedBlock?: (blockType: string, blockId: string) => void
}

/**
 * 同種のリスト項目同士のみ改行1つで連結する
 * それ以外を空行で区切らないと、CommonMarkのlazy continuationにより
 * リスト・引用・テーブル直後の段落が前ブロックに吸収される
 */
function isSameListItemType(currentType: string, nextType: string | undefined): boolean {
  if (currentType !== nextType) return false

  if (currentType === "bulleted_list_item") return true

  if (currentType === "numbered_list_item") return true

  return currentType === "to_do"
}

export function fromNotionBlocks(blocks: NotionBlock[], props: Props = {}): string {
  let result = ""

  const contentCache = new Map<number, string | null>()

  const getContent = (index: number): string | null => {
    const cached = contentCache.get(index)
    if (cached !== undefined) return cached
    const b = blocks[index]
    if (!b) return null
    const content = fromNotionBlock(b)
    contentCache.set(index, content)
    return content
  }

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]
    if (!block) continue

    const blockContent = getContent(i)

    if (blockContent === null) {
      props.onUnsupportedBlock?.(block.type, block.id)
      continue
    }

    if (block.type === "paragraph" && blockContent.trim() === "") {
      if (result.length > 0) {
        result += "\n"
      }
      continue
    }

    if (blockContent.trim() !== "") {
      if (block.type === "paragraph" && blockContent.includes("\n")) {
        const lines = blockContent.split("\n")
        for (let j = 0; j < lines.length; j++) {
          const line = lines[j]?.trim()
          if (line) {
            result += line
            if (j < lines.length - 1) {
              result += "\n\n"
            }
          }
        }
      } else {
        result += blockContent
      }

      if (i < blocks.length - 1) {
        const nextBlock = blocks[i + 1]

        const isNextEmptyParagraph =
          nextBlock?.type === "paragraph" && (getContent(i + 1) ?? "").trim() === ""

        if (isSameListItemType(block.type, nextBlock?.type)) {
          result += "\n"
        } else if (isNextEmptyParagraph) {
          result += "\n"
        } else {
          result += "\n\n"
        }
      }
    }
  }

  return result.trim()
}
