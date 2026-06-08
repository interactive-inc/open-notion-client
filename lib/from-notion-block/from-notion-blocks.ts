import { fromNotionBlock } from "@/from-notion-block/from-notion-block"
import type { NotionBlock } from "@/types"

/**
 * Convert Notion blocks array to markdown text
 *
 * CRITICAL PARAGRAPH SEPARATION BEHAVIOR:
 * This function handles two types of paragraph separation:
 * 1. Empty paragraph blocks (created by legacy logic) -> converted to blank lines
 * 2. Paragraph blocks with internal newlines -> split into separate paragraphs with blank lines
 *
 * This ensures proper paragraph separation in markdown while avoiding redundant empty blocks.
 */
export function fromNotionBlocks(blocks: NotionBlock[]): string {
  let result = ""

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]
    if (!block) continue

    const blockContent = fromNotionBlock(block)

    // CRITICAL: Handle empty paragraph blocks (represent spacing between paragraphs)
    if (block.type === "paragraph" && blockContent.trim() === "") {
      // Only add spacing if there's already content
      if (result.length > 0) {
        result += "\n"
      }
      continue
    }

    if (blockContent.trim() !== "") {
      // CRITICAL: Handle paragraph blocks with internal newlines
      // Notion sometimes stores multiple paragraphs as single block with \n separators
      // We must split these into proper markdown paragraphs with blank lines
      if (block.type === "paragraph" && blockContent.includes("\n")) {
        const lines = blockContent.split("\n")
        for (let j = 0; j < lines.length; j++) {
          const line = lines[j]?.trim()
          if (line) {
            result += line
            // Insert blank line between paragraphs (except for last line)
            if (j < lines.length - 1) {
              result += "\n\n"
            }
          }
        }
      } else {
        result += blockContent
      }

      // Handle spacing between different blocks
      if (i < blocks.length - 1) {
        const currentBlockType = block.type
        const nextBlock = blocks[i + 1]
        const nextBlockType = nextBlock?.type

        // List items only need single newline between them
        if (
          (currentBlockType === "bulleted_list_item" ||
            currentBlockType === "numbered_list_item") &&
          (nextBlockType === "bulleted_list_item" || nextBlockType === "numbered_list_item")
        ) {
          result += "\n"
        } else if (
          // CRITICAL: Paragraph-to-paragraph spacing needs blank line
          currentBlockType === "paragraph" &&
          nextBlockType === "paragraph" &&
          nextBlock &&
          fromNotionBlock(nextBlock).trim() !== ""
        ) {
          result += "\n\n"
        } else {
          // Default: single newline for other block transitions
          result += "\n"
        }
      }
    }
  }

  return result.trim()
}
