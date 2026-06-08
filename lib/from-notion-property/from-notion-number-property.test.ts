import { expect, test } from "bun:test"
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { fromNotionNumberProperty } from "./from-notion-number-property"

type NumberProperty = Extract<PageObjectResponse["properties"][string], { type: "number" }>

test("正の整数を変換", () => {
  const property: NumberProperty = {
    type: "number",
    number: 123,
    id: "test",
  }

  const result = fromNotionNumberProperty(property)
  expect(result).toBe(123)
})

test("負の整数を変換", () => {
  const property: NumberProperty = {
    type: "number",
    number: -456,
    id: "test",
  }

  const result = fromNotionNumberProperty(property)
  expect(result).toBe(-456)
})

test("小数を変換", () => {
  const property: NumberProperty = {
    type: "number",
    number: 123.456,
    id: "test",
  }

  const result = fromNotionNumberProperty(property)
  expect(result).toBe(123.456)
})

test("ゼロを変換", () => {
  const property: NumberProperty = {
    type: "number",
    number: 0,
    id: "test",
  }

  const result = fromNotionNumberProperty(property)
  expect(result).toBe(0)
})

test("numberがnullの場合", () => {
  const property: NumberProperty = {
    type: "number",
    number: null,
    id: "test",
  }

  const result = fromNotionNumberProperty(property)
  expect(result).toBe(null)
})
