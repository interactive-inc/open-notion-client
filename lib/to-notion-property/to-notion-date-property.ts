import { z } from "zod"
import type { NotionDatePropertyRequest } from "@/types"

const datePropertySchema = z
  .object({
    start: z.string().min(1),
    end: z.string().nullable().optional(),
    timeZone: z.string().nullable().optional(),
  })
  .nullable()

/**
 * unknownをNotionのdateプロパティに変換
 * fromNotionDatePropertyの戻り値（end: string | null, timeZone?: string）と
 * 双方向で互換性を持つ
 */
export function toNotionDateProperty(value: unknown): NotionDatePropertyRequest {
  const data = datePropertySchema.parse(value)

  if (data === null) {
    return { date: null }
  }

  const end = data.end && data.end.length > 0 ? data.end : null
  const timeZone = data.timeZone && data.timeZone.length > 0 ? data.timeZone : null

  return {
    date: {
      start: data.start,
      end: end,
      time_zone: timeZone,
    },
  }
}
