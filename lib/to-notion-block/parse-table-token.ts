import type { BlockObjectRequest } from "@notionhq/client/build/src/api-endpoints"
import type { Tokens } from "marked"
import { expandInlineTokens } from "@/to-notion-block/parse-inline-token"
import type { RichTextItemResponse } from "@/types"
import { BlockType } from "@/types"

type TableRequest = Extract<BlockObjectRequest, { type?: "table" }>

type TableRowRequest = TableRequest["table"]["children"][number]

/**
 * セル内の `<br>` は改行として復元する(from側で改行を `<br>` に変換しているため)
 */
function toTableCellRichText(cell: Tokens.TableCell): RichTextItemResponse[] {
  const inlineTokens: Tokens.Generic[] = []

  for (const token of cell.tokens) {
    if (token.type === "html" && /^<br\s*\/?>$/i.test(token.raw)) {
      inlineTokens.push({ type: "text", raw: "\n", text: "\n" })
      continue
    }
    inlineTokens.push(token)
  }

  return expandInlineTokens(inlineTokens)
}

function toTableRowRequest(cells: Tokens.TableCell[]): TableRowRequest {
  return {
    type: BlockType.TableRow,
    table_row: {
      cells: cells.map((cell) => toTableCellRichText(cell)),
    },
  }
}

/**
 * markedのtableトークンをNotionのtableブロックに変換する
 * 1行目をヘッダー行として has_column_header: true を設定する
 */
export function parseTableToken(token: Tokens.Table): BlockObjectRequest {
  const rowTokens = [token.header, ...token.rows]

  return {
    type: BlockType.Table,
    table: {
      table_width: token.header.length,
      has_column_header: true,
      children: rowTokens.map((cells) => toTableRowRequest(cells)),
    },
  }
}
