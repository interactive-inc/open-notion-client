import { expect, test } from "bun:test"
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { fromNotionDateProperty } from "./from-notion-date-property"

type DateProperty = Extract<PageObjectResponse["properties"][string], { type: "date" }>

test("日付範囲を変換", () => {
  const property: DateProperty = {
    type: "date",
    date: {
      start: "2023-01-01",
      end: "2023-01-31",
      time_zone: null,
    },
    id: "test",
  }

  const result = fromNotionDateProperty(property)
  expect(result).toEqual({
    start: "2023-01-01",
    end: "2023-01-31",
    timeZone: null,
  })
})

test("開始日のみの日付を変換", () => {
  const property: DateProperty = {
    type: "date",
    date: {
      start: "2023-01-01",
      end: null,
      time_zone: null,
    },
    id: "test",
  }

  const result = fromNotionDateProperty(property)
  expect(result).toEqual({
    start: "2023-01-01",
    end: null,
    timeZone: null,
  })
})

test("タイムゾーン付きの日付を変換", () => {
  const property: DateProperty = {
    type: "date",
    date: {
      start: "2023-01-01T09:00:00.000+09:00",
      end: null,
      time_zone: "Asia/Tokyo",
    },
    id: "test",
  }

  const result = fromNotionDateProperty(property)
  expect(result).toEqual({
    start: "2023-01-01T09:00:00.000+09:00",
    end: null,
    timeZone: "Asia/Tokyo",
  })
})

test("dateがnullの場合", () => {
  const property: DateProperty = {
    type: "date",
    date: null,
    id: "test",
  }

  const result = fromNotionDateProperty(property)
  expect(result).toBe(null)
})
