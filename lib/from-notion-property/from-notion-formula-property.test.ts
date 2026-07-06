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

test("期待型と実際の結果型が一致する場合は変換される", () => {
  const property = {
    type: "formula",
    formula: { type: "number", number: 42 },
    id: "f",
  } as unknown as FormulaProperty

  expect(fromNotionFormulaProperty(property, "number")).toBe(42)
})

test("期待型numberに対しstringが返るとエラーをthrow", () => {
  const property = {
    type: "formula",
    formula: { type: "string", string: "not-a-number" },
    id: "f",
  } as unknown as FormulaProperty

  expect(() => fromNotionFormulaProperty(property, "number")).toThrow()
})

test("期待型dateに対しbooleanが返るとエラーをthrow", () => {
  const property = {
    type: "formula",
    formula: { type: "boolean", boolean: true },
    id: "f",
  } as unknown as FormulaProperty

  expect(() => fromNotionFormulaProperty(property, "date")).toThrow()
})
