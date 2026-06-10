import { z } from "zod"
import type { NotionUser } from "@/types"

const zUserLike = z.object({
  id: z.string(),
  name: z.string().nullish(),
  avatar_url: z.string().nullish(),
  person: z.object({ email: z.string().nullish() }).nullish(),
})

/**
 * Notion APIのユーザーオブジェクトを{@link NotionUser}に正規化する
 * PartialUserObjectResponseとUserObjectResponse両方を許容する
 */
export function fromNotionUser(value: unknown): NotionUser {
  const user = zUserLike.parse(value)

  return {
    id: user.id,
    name: user.name ?? null,
    avatarUrl: user.avatar_url ?? null,
    email: user.person?.email ?? null,
  }
}
