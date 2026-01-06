import { expect, test } from "bun:test"
import type { EquationBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { fromNotionEquationBlock } from "./from-notion-equation-block"

const block = {
  object: "block",
  id: "1d8842f9-6181-80d8-af1c-dece63b450b0",
  parent: {
    type: "page_id",
    page_id: "1d8842f9-6181-8042-8c77-d5c2f6cb333b",
  },
  created_time: "2025-04-17T16:09:00.000Z",
  last_edited_time: "2025-04-20T16:01:00.000Z",
  created_by: {
    object: "user",
    id: "63fd3a0c-d05f-48d4-8009-0a0e997edfca",
  },
  last_edited_by: {
    object: "user",
    id: "63fd3a0c-d05f-48d4-8009-0a0e997edfca",
  },
  has_children: false,
  archived: false,
  in_trash: false,
  type: "equation",
  equation: {
    expression: "E = mc^2",
  },
} as const satisfies EquationBlockObjectResponse

test("equationブロックをマークダウン数式に変換できる", () => {
  const result = fromNotionEquationBlock(block)
  expect(result).toBe("$E = mc^2$")
})

test("複雑な数式も正しく変換できる", () => {
  const complexBlock = {
    ...block,
    equation: {
      expression: "\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}",
    },
  } as EquationBlockObjectResponse

  const result = fromNotionEquationBlock(complexBlock)
  expect(result).toBe(
    "$\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$",
  )
})
