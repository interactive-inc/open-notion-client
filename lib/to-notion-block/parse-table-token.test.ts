import { expect, test } from "bun:test"
import { lexer, type Tokens } from "marked"
import { parseTableToken } from "./parse-table-token"

type TableBlock = {
  type: "table"
  table: {
    table_width: number
    has_column_header: boolean
    children: Array<{
      type: "table_row"
      table_row: { cells: Array<Array<{ text: { content: string } }>> }
    }>
  }
}

function parseFirstTable(markdown: string): TableBlock {
  const token = lexer(markdown)[0]
  return parseTableToken(token as Tokens.Table) as unknown as TableBlock
}

test("マークダウンのテーブルをtableブロックに変換", () => {
  const markdown = "| 名前 | 年齢 |\n| --- | --- |\n| 田中 | 30 |\n| 佐藤 | 25 |"

  const block = parseFirstTable(markdown)

  expect(block.type).toBe("table")
  expect(block.table.table_width).toBe(2)
  expect(block.table.has_column_header).toBe(true)
  expect(block.table.children).toHaveLength(3)
  expect(block.table.children[0]?.table_row.cells[0]?.[0]?.text.content).toBe("名前")
  expect(block.table.children[1]?.table_row.cells[0]?.[0]?.text.content).toBe("田中")
  expect(block.table.children[2]?.table_row.cells[1]?.[0]?.text.content).toBe("25")
})

test("エスケープされたパイプと<br>を復元する", () => {
  const markdown = "| a\\|b | c |\n| --- | --- |\n| 1行目<br>2行目 | d |"

  const block = parseFirstTable(markdown)

  expect(block.table.children[0]?.table_row.cells[0]?.[0]?.text.content).toBe("a|b")

  const cellTexts = (block.table.children[1]?.table_row.cells[0] ?? []).map(
    (item) => item.text.content,
  )
  expect(cellTexts.join("")).toBe("1行目\n2行目")
})
