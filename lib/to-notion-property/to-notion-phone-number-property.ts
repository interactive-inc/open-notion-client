import { z } from "zod"
import type { NotionPhoneNumberPropertyRequest } from "@/types"

const phoneNumberPropertySchema = z.string().nullable()

/**
 * unknownをNotionのphone_numberプロパティに変換
 * nullは許可、それ以外でstringでない場合はエラー
 */
export function toNotionPhoneNumberProperty(value: unknown): NotionPhoneNumberPropertyRequest {
  const data = phoneNumberPropertySchema.parse(value)

  return {
    phone_number: data && data.length > 0 ? data : null,
  }
}
