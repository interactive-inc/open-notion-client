import type { NotionTableBlock } from "@/types"
import { fromNotionRichTextItem } from "@/utils"

/**
 * セル内容の `|` はエスケープし、改行は `<br>` に置換する
 * そのままだとマークダウンのテーブル構造が壊れる
 */
function escapeTableCell(cellText: string): string {
  return cellText.replaceAll("|", "\\|").replaceAll("\n", "<br>")
}

/**
 * Convert Notion table block to markdown
 */
export function fromNotionTableBlock(block: NotionTableBlock): string {
  if (!block.children || block.children.length === 0) {
    return ""
  }

  const rows: string[][] = []

  for (const child of block.children) {
    if (child.type !== "table_row") {
      continue
    }
    const cells = child.table_row.cells.map((cell) => escapeTableCell(fromNotionRichTextItem(cell)))
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
