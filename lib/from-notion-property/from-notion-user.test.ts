import { expect, test } from "bun:test"
import { fromNotionUser } from "./from-notion-user"

test("完全なユーザーオブジェクトを変換", () => {
  const value = {
    id: "u1",
    name: "Alice",
    avatar_url: "https://a/u1.png",
    person: { email: "alice@example.com" },
  }

  expect(fromNotionUser(value)).toEqual({
    id: "u1",
    name: "Alice",
    avatarUrl: "https://a/u1.png",
    email: "alice@example.com",
  })
})

test("idのみのpartial userを変換", () => {
  expect(fromNotionUser({ id: "u2" })).toEqual({
    id: "u2",
    name: null,
    avatarUrl: null,
    email: null,
  })
})

test("personがnullの場合はemailもnull", () => {
  expect(fromNotionUser({ id: "u3", name: "Bot", person: null })).toEqual({
    id: "u3",
    name: "Bot",
    avatarUrl: null,
    email: null,
  })
})
