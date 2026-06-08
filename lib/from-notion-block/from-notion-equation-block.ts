import type { EquationBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"

/**
 * Notionの数式ブロックをLaTeXのdisplayスタイル($$...$$)に変換する
 * インライン数式($..$)ではなく、ブロックレベルの数式として描画させる
 */
export function fromNotionEquationBlock(block: EquationBlockObjectResponse): string {
  return `$$${block.equation.expression}$$`
}
