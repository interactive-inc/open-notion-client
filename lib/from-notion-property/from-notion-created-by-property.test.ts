import { expect, test } from "bun:test"
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { fromNotionCreatedByProperty } from "./from-notion-created-by-property"

type CreatedByProperty = Extract<PageObjectResponse["properties"][string], { type: "created_by" }>

function makeCreatedByProperty(user: unknown): CreatedByProperty {
  return {
    type: "created_by",
    id: "prop-1",
    created_by: user,
  } as CreatedByProperty
}

test("created_byプロパティをNotionUserに変換", () => {
  const property = makeCreatedByProperty({
    object: "user",
    id: "u1",
    name: "Alice",
    avatar_url: "https://a/u1.png",
    person: { email: "alice@example.com" },
  })

  expect(fromNotionCreatedByProperty(property)).toEqual({
    id: "u1",
    name: "Alice",
    avatarUrl: "https://a/u1.png",
    email: "alice@example.com",
  })
})

test("最小限のユーザー情報でも変換できる", () => {
  const property = makeCreatedByProperty({
    object: "user",
    id: "u2",
  })

  expect(fromNotionCreatedByProperty(property)).toEqual({
    id: "u2",
    name: null,
    avatarUrl: null,
    email: null,
  })
})
