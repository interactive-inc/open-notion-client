import { z } from "zod"
import type { NotionPeoplePropertyRequest } from "@/types"

const peoplePropertySchema = z
  .union([z.array(z.object({ id: z.string().min(1) })), z.object({ id: z.string().min(1) })])
  .nullable()

/**
 * unknownをNotionのpeopleプロパティに変換
 * nullは許可して空配列相当を返す、それ以外で適切な配列構造でない場合はエラー
 */
export function toNotionPeopleProperty(value: unknown): NotionPeoplePropertyRequest {
  const data = peoplePropertySchema.parse(value)

  if (data === null) {
    return { people: [] }
  }

  let users: { id: string }[] = []

  if (Array.isArray(data)) {
    users = data
  } else {
    users = [data]
  }

  return {
    people: users.map((user) => ({ id: user.id })),
  }
}
