import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import type { DateRange } from "@/types"

type FormulaProperty = Extract<PageObjectResponse["properties"][string], { type: "formula" }>

type FormulaValue = string | number | boolean | DateRange | null

/**
 * Notionのformulaプロパティを実値に変換
 * formulaTypeに応じてstring/number/boolean/DateRangeのいずれかを返す
 */
export function fromNotionFormulaProperty(property: FormulaProperty): FormulaValue {
  const formula = property.formula

  if (formula.type === "string") {
    return formula.string
  }

  if (formula.type === "number") {
    return formula.number
  }

  if (formula.type === "boolean") {
    return formula.boolean
  }

  if (formula.type === "date") {
    if (!formula.date) {
      return null
    }
    return {
      start: formula.date.start,
      end: formula.date.end,
      timeZone: formula.date.time_zone,
    }
  }

  return null
}
