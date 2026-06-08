import { expect, test } from "bun:test"
import { toNotionDateProperty } from "./to-notion-date-property"

test("日付オブジェクトを正しくdateプロパティに変換", () => {
  const result = toNotionDateProperty({
    start: "2023-12-01",
    end: "2023-12-31",
  })

  expect(result).toEqual({
    date: {
      start: "2023-12-01",
      end: "2023-12-31",
      time_zone: null,
    },
  })
})

test("開始日のみの日付オブジェクトを正しく変換", () => {
  const result = toNotionDateProperty({
    start: "2023-12-01",
  })

  expect(result).toEqual({
    date: {
      start: "2023-12-01",
      end: null,
      time_zone: null,
    },
  })
})

test("空文字列のendを正しく変換", () => {
  const result = toNotionDateProperty({
    start: "2023-12-01",
    end: "",
  })

  expect(result).toEqual({
    date: {
      start: "2023-12-01",
      end: null,
      time_zone: null,
    },
  })
})

test("nullを正しく変換", () => {
  const result = toNotionDateProperty(null)

  expect(result).toEqual({
    date: null,
  })
})

test("文字列を渡すとエラーをthrow", () => {
  expect(() => toNotionDateProperty("2023-12-01")).toThrow()
})

test("数値を渡すとエラーをthrow", () => {
  expect(() => toNotionDateProperty(123)).toThrow()
})

test("undefinedを渡すとエラーをthrow", () => {
  expect(() => toNotionDateProperty(undefined)).toThrow()
})

test("startが空文字列の場合エラーをthrow", () => {
  expect(() => toNotionDateProperty({ start: "" })).toThrow()
})

test("startが無い場合エラーをthrow", () => {
  expect(() => toNotionDateProperty({ end: "2023-12-31" })).toThrow()
})

test("空オブジェクトを渡すとエラーをthrow", () => {
  expect(() => toNotionDateProperty({})).toThrow()
})

test("end: nullを許容してそのまま渡す", () => {
  const result = toNotionDateProperty({
    start: "2024-01-15",
    end: null,
    timeZone: null,
  })

  expect(result).toEqual({
    date: {
      start: "2024-01-15",
      end: null,
      time_zone: null,
    },
  })
})

test("timeZoneを保持する", () => {
  const result = toNotionDateProperty({
    start: "2024-01-15T09:00:00",
    end: null,
    timeZone: "Asia/Tokyo",
  })

  expect(result).toEqual({
    date: {
      start: "2024-01-15T09:00:00",
      end: null,
      time_zone: "Asia/Tokyo",
    },
  })
})

test("fromNotionDatePropertyの出力（end: null, timeZone: null）で往復", () => {
  const result = toNotionDateProperty({
    start: "2024-05-01",
    end: null,
    timeZone: null,
  })

  expect(result).toEqual({
    date: {
      start: "2024-05-01",
      end: null,
      time_zone: null,
    },
  })
})
