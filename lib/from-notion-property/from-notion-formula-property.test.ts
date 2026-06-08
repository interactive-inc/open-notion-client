import { expect, test } from "bun:test"
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { fromNotionFormulaProperty } from "./from-notion-formula-property"

type FormulaProperty = Extract<PageObjectResponse["properties"][string], { type: "formula" }>

test("string formulaは文字列を返す", () => {
  const property = {
    type: "formula",
    formula: { type: "string", string: "hello" },
    id: "f",
  } as unknown as FormulaProperty

  expect(fromNotionFormulaProperty(property)).toBe("hello")
})

test("number formulaは数値を返す", () => {
  const property = {
    type: "formula",
    formula: { type: "number", number: 3.14 },
    id: "f",
  } as unknown as FormulaProperty

  expect(fromNotionFormulaProperty(property)).toBe(3.14)
})

test("boolean formulaはboolean", () => {
  const property = {
    type: "formula",
    formula: { type: "boolean", boolean: false },
    id: "f",
  } as unknown as FormulaProperty

  expect(fromNotionFormulaProperty(property)).toBe(false)
})

test("date formulaはDateRange", () => {
  const property = {
    type: "formula",
    formula: {
      type: "date",
      date: { start: "2024-01-01", end: null, time_zone: null },
    },
    id: "f",
  } as unknown as FormulaProperty

  expect(fromNotionFormulaProperty(property)).toEqual({
    start: "2024-01-01",
    end: null,
    timeZone: null,
  })
})

test("date formulaがnullの場合", () => {
  const property = {
    type: "formula",
    formula: { type: "date", date: null },
    id: "f",
  } as unknown as FormulaProperty

  expect(fromNotionFormulaProperty(property)).toBe(null)
})
