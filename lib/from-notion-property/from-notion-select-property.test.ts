import { expect, test } from "bun:test"
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { fromNotionSelectProperty } from "./from-notion-select-property"

type SelectProperty = Extract<PageObjectResponse["properties"][string], { type: "select" }>

test("選択肢を変換", () => {
  const property: SelectProperty = {
    type: "select",
    select: {
      id: "1",
      name: "選択肢A",
      color: "blue",
    },
    id: "test",
  }

  const result = fromNotionSelectProperty(property)
  expect(result).toBe("選択肢A")
})

test("別の色の選択肢を変換", () => {
  const property: SelectProperty = {
    type: "select",
    select: {
      id: "2",
      name: "高優先度",
      color: "red",
    },
    id: "test",
  }

  const result = fromNotionSelectProperty(property)
  expect(result).toBe("高優先度")
})

test("selectがnullの場合", () => {
  const property: SelectProperty = {
    type: "select",
    select: null,
    id: "test",
  }

  const result = fromNotionSelectProperty(property)
  expect(result).toBe(null)
})

test("selectのnameが空文字の場合", () => {
  const property: SelectProperty = {
    type: "select",
    select: {
      id: "3",
      name: "",
      color: "green",
    },
    id: "test",
  }

  const result = fromNotionSelectProperty(property)
  expect(result).toBe(null)
})
