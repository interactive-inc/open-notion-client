import { expect, test } from "bun:test"
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { fromNotionPeopleProperty } from "./from-notion-people-property"

type PeopleProperty = Extract<PageObjectResponse["properties"][string], { type: "people" }>

function makePeopleProperty(people: unknown[]): PeopleProperty {
  return {
    type: "people",
    id: "prop-1",
    people: people,
  } as PeopleProperty
}

test("複数ユーザーを変換", () => {
  const property = makePeopleProperty([
    {
      object: "user",
      id: "u1",
      name: "Alice",
      avatar_url: "https://a/u1.png",
      person: { email: "alice@example.com" },
    },
    {
      object: "user",
      id: "u2",
      name: "Bob",
      avatar_url: null,
      person: { email: "bob@example.com" },
    },
  ])

  const users = fromNotionPeopleProperty(property)

  expect(users).toHaveLength(2)
  expect(users[0]).toEqual({
    id: "u1",
    name: "Alice",
    avatarUrl: "https://a/u1.png",
    email: "alice@example.com",
  })
  expect(users[1]).toEqual({
    id: "u2",
    name: "Bob",
    avatarUrl: null,
    email: "bob@example.com",
  })
})

test("空のpeople配列は空配列を返す", () => {
  const property = makePeopleProperty([])

  expect(fromNotionPeopleProperty(property)).toEqual([])
})

test("peopleがundefinedの場合は空配列を返す", () => {
  const property = { type: "people", id: "prop-1" } as unknown as PeopleProperty

  expect(fromNotionPeopleProperty(property)).toEqual([])
})
