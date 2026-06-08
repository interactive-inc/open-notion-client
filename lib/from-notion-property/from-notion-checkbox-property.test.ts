import { expect, test } from "bun:test"
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { fromNotionCheckboxProperty } from "./from-notion-checkbox-property"

type CheckboxProperty = Extract<PageObjectResponse["properties"][string], { type: "checkbox" }>

test("checkboxがtrueの場合", () => {
  const property: CheckboxProperty = {
    type: "checkbox",
    checkbox: true,
    id: "test",
  }

  const result = fromNotionCheckboxProperty(property)
  expect(result).toBe(true)
})

test("checkboxがfalseの場合", () => {
  const property: CheckboxProperty = {
    type: "checkbox",
    checkbox: false,
    id: "test",
  }

  const result = fromNotionCheckboxProperty(property)
  expect(result).toBe(false)
})
