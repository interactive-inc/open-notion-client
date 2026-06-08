import type { NotionUser } from "@/types"

type UserLike = {
  id: string
  name?: string | null
  avatar_url?: string | null
  person?: { email?: string | null } | null
}

/**
 * Notion APIのユーザーオブジェクトを{@link NotionUser}に正規化する
 * PartialUserObjectResponseとUserObjectResponse両方を許容する
 */
export function fromNotionUser(value: unknown): NotionUser {
  const user = value as UserLike

  const email =
    user.person && typeof user.person === "object" && user.person.email ? user.person.email : null

  return {
    id: user.id,
    name: user.name ?? null,
    avatarUrl: user.avatar_url ?? null,
    email: email,
  }
}
