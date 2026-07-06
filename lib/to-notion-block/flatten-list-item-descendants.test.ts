import { expect, test } from "bun:test"
import { lexer, type Tokens } from "marked"
import { parseListToken } from "./parse-list-token"

type ListItemBlock = {
  type: string
  bulleted_list_item: {
    rich_text: Array<{ text: { content: string } }>
    children?: Array<{
      type: string
      bulleted_list_item: {
        rich_text: Array<{ text: { content: string } }>
        children?: Array<{
          type: string
          bulleted_list_item: { rich_text: Array<{ text: { content: string } }> }
        }>
      }
    }>
  }
}

test("4階層以上のネストリストは3階層目にフラット化して保持", () => {
  const markdown = "- a\n    - b\n        - c\n            - d\n            - e"

  const listToken = lexer(markdown)[0] as Tokens.List

  const blocks = parseListToken(listToken) as unknown as ListItemBlock[]

  expect(blocks).toHaveLength(1)

  const depth2 = blocks[0]?.bulleted_list_item.children
  expect(depth2).toHaveLength(1)
  expect(depth2?.[0]?.bulleted_list_item.rich_text[0]?.text.content).toBe("b")

  const depth3 = depth2?.[0]?.bulleted_list_item.children
  const depth3Texts = (depth3 ?? []).map(
    (block) => block.bulleted_list_item.rich_text[0]?.text.content,
  )

  // c の配下だった d, e が c の兄弟としてフラット化される
  expect(depth3Texts).toEqual(["c", "d", "e"])
})
