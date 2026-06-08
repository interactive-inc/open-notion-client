import { expect, test } from "bun:test"
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { fromNotionMultiSelectProperty } from "./from-notion-multi-select-property"

type MultiSelectProperty = Extract<
  PageObjectResponse["properties"][string],
  { type: "multi_select" }
>

test("複数の選択肢を変換", () => {
  const property: MultiSelectProperty = {
    type: "multi_select",
    multi_select: [
      { id: "1", name: "タグ1", color: "blue" },
      { id: "2", name: "タグ2", color: "red" },
      { id: "3", name: "タグ3", color: "green" },
    ],
    id: "test",
  }

  const result = fromNotionMultiSelectProperty(property)
  expect(result).toEqual(["タグ1", "タグ2", "タグ3"])
})

test("単一の選択肢を変換", () => {
  const property: MultiSelectProperty = {
    type: "multi_select",
    multi_select: [{ id: "1", name: "タグ1", color: "blue" }],
    id: "test",
  }

  const result = fromNotionMultiSelectProperty(property)
  expect(result).toEqual(["タグ1"])
})

test("空の選択肢リストを変換", () => {
  const property: MultiSelectProperty = {
    type: "multi_select",
    multi_select: [],
    id: "test",
  }

  const result = fromNotionMultiSelectProperty(property)
  expect(result).toEqual([])
})

test("multi_selectがnullの場合", () => {
  const property: MultiSelectProperty = {
    type: "multi_select",
    multi_select: null as unknown as MultiSelectProperty["multi_select"],
    id: "test",
  }

  const result = fromNotionMultiSelectProperty(property)
  expect(result).toEqual([])
})

test("multi_selectが配列でない場合", () => {
  const property: MultiSelectProperty = {
    type: "multi_select",
    multi_select: "not an array" as unknown as MultiSelectProperty["multi_select"],
    id: "test",
  }

  const result = fromNotionMultiSelectProperty(property)
  expect(result).toEqual([])
})
