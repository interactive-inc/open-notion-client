import { expect, test } from "bun:test"
import { parseHrToken } from "./parse-hr-token"

test("dividerブロックを返す", () => {
  const block = parseHrToken()

  expect(block).toEqual({
    type: "divider",
    divider: {},
  })
})
