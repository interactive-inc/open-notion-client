import { expect, test } from "bun:test"
import { zNumberPropertyConfig } from "@/models"

test("Notion API仕様の全number formatを受け付ける", () => {
  const formats = [
    "number",
    "number_with_commas",
    "percent",
    "dollar",
    "canadian_dollar",
    "singapore_dollar",
    "euro",
    "pound",
    "yen",
    "ruble",
    "rupee",
    "won",
    "yuan",
    "real",
    "lira",
    "rupiah",
    "franc",
    "hong_kong_dollar",
    "new_zealand_dollar",
    "krona",
    "norwegian_krone",
    "mexican_peso",
    "rand",
    "new_taiwan_dollar",
    "danish_krone",
    "zloty",
    "baht",
    "forint",
    "koruna",
    "shekel",
    "chilean_peso",
    "philippine_peso",
    "dirham",
    "colombian_peso",
    "riyal",
    "ringgit",
    "leu",
    "argentine_peso",
    "uruguayan_peso",
    "peruvian_sol",
  ]

  for (const format of formats) {
    const result = zNumberPropertyConfig.safeParse({ type: "number", format })

    expect(result.success).toBe(true)
  }
})

test("formatを省略できる", () => {
  const result = zNumberPropertyConfig.safeParse({ type: "number" })

  expect(result.success).toBe(true)
})

test("無効なformatはエラー", () => {
  const result = zNumberPropertyConfig.safeParse({ type: "number", format: "bitcoin" })

  expect(result.success).toBe(false)
})

test("format以外の型（数値）はエラー", () => {
  const result = zNumberPropertyConfig.safeParse({ type: "number", format: 123 })

  expect(result.success).toBe(false)
})
