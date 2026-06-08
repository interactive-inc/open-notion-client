import { expect, test } from "bun:test"
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { fromNotionRelationProperty } from "./from-notion-relation-property"

type RelationProperty = Extract<PageObjectResponse["properties"][string], { type: "relation" }>

test("relation配列をid配列に変換", () => {
  const property: RelationProperty = {
    type: "relation",
    relation: [{ id: "page-1" }, { id: "page-2" }],
    id: "rel",
  }

  expect(fromNotionRelationProperty(property)).toEqual(["page-1", "page-2"])
})

test("空のrelationは空配列を返す", () => {
  const property: RelationProperty = {
    type: "relation",
    relation: [],
    id: "rel",
  }

  expect(fromNotionRelationProperty(property)).toEqual([])
})
