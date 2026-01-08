import type { NotionTableBlock } from "@/types"
import { fromNotionRichTextItem } from "@/utils"

/**
 * Convert Notion table block to markdown
 */
export function fromNotionTableBlock(block: NotionTableBlock): string {
  if (block.children.length === 0) {
    return ""
  }

  const rows: string[][] = []

  for (const child of block.children) {
    if (child.type !== "table_row") {
      continue
    }
    const cells = child.table_row.cells.map((cell) =>
      fromNotionRichTextItem(cell),
    )
    rows.push(cells)
  }

  if (rows.length === 0) {
    return ""
  }

  const headerRow = rows[0]
  if (headerRow === undefined) {
    return ""
  }

  const lines: string[] = []
  lines.push(`| ${headerRow.join(" | ")} |`)
  lines.push(`| ${headerRow.map(() => "---").join(" | ")} |`)

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (row === undefined) {
      continue
    }
    lines.push(`| ${row.join(" | ")} |`)
  }

  return lines.join("\n")
}
