import { expect, test } from "bun:test"
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { fromNotionLastEditedByProperty } from "./from-notion-last-edited-by-property"

type LastEditedByProperty = Extract<
  PageObjectResponse["properties"][string],
  { type: "last_edited_by" }
>

function makeLastEditedByProperty(user: unknown): LastEditedByProperty {
  return {
    type: "last_edited_by",
    id: "prop-1",
    last_edited_by: user,
  } as LastEditedByProperty
}

test("last_edited_byプロパティをNotionUserに変換", () => {
  const property = makeLastEditedByProperty({
    object: "user",
    id: "u1",
    name: "Alice",
    avatar_url: "https://a/u1.png",
    person: { email: "alice@example.com" },
  })

  expect(fromNotionLastEditedByProperty(property)).toEqual({
    id: "u1",
    name: "Alice",
    avatarUrl: "https://a/u1.png",
    email: "alice@example.com",
  })
})

test("最小限のユーザー情報でも変換できる", () => {
  const property = makeLastEditedByProperty({
    object: "user",
    id: "u2",
  })

  expect(fromNotionLastEditedByProperty(property)).toEqual({
    id: "u2",
    name: null,
    avatarUrl: null,
    email: null,
  })
})
