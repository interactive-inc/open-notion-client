import { fromNotionBlock } from "@/from-notion-block/from-notion-block"
import type { NotionBlock } from "@/types"

type Props = {
  onUnsupportedBlock?: (blockType: string, blockId: string) => void
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
        const currentBlockType = block.type
        const nextBlock = blocks[i + 1]
        const nextBlockType = nextBlock?.type

        const isDividerTransition = currentBlockType === "divider" || nextBlockType === "divider"

        if (
          (currentBlockType === "bulleted_list_item" ||
            currentBlockType === "numbered_list_item") &&
          (nextBlockType === "bulleted_list_item" || nextBlockType === "numbered_list_item")
        ) {
          result += "\n"
        } else if (isDividerTransition) {
          result += "\n\n"
        } else if (
          currentBlockType === "paragraph" &&
          nextBlockType === "paragraph" &&
          nextBlock &&
          (getContent(i + 1) ?? "").trim() !== ""
        ) {
          result += "\n\n"
        } else {
          result += "\n"
        }
      }
    }
  }

  return result.trim()
}
