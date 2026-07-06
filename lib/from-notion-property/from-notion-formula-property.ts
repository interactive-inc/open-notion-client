import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import type { DateRange } from "@/types"

type FormulaProperty = Extract<PageObjectResponse["properties"][string], { type: "formula" }>

type FormulaValue = string | number | boolean | DateRange | null

type FormulaType = "string" | "number" | "boolean" | "date"

/**
 * Notionのformulaプロパティを実値に変換
 * formulaTypeに応じてstring/number/boolean/DateRangeのいずれかを返す
 * expectedTypeが指定され実際の結果型と一致しない場合はエラー
 */
export function fromNotionFormulaProperty(
  property: FormulaProperty,
  expectedType?: FormulaType,
): FormulaValue {
  const formula = property.formula

  if (expectedType !== undefined && formula.type !== expectedType) {
    throw new Error(`formulaの結果型が一致しません。期待: ${expectedType}, 実際: ${formula.type}`)
  }

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
