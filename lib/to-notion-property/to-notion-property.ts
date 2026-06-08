import type { NotionPropertyRequest, PropertyConfig } from "@/types"
import { toNotionCheckboxProperty } from "@/to-notion-property/to-notion-checkbox-property"
import { toNotionDateProperty } from "@/to-notion-property/to-notion-date-property"
import { toNotionEmailProperty } from "@/to-notion-property/to-notion-email-property"
import { toNotionFilesProperty } from "@/to-notion-property/to-notion-files-property"
import { toNotionMultiSelectProperty } from "@/to-notion-property/to-notion-multi-select-property"
import { toNotionNumberProperty } from "@/to-notion-property/to-notion-number-property"
import { toNotionPeopleProperty } from "@/to-notion-property/to-notion-people-property"
import { toNotionPhoneNumberProperty } from "@/to-notion-property/to-notion-phone-number-property"
import { toNotionRelationProperty } from "@/to-notion-property/to-notion-relation-property"
import { toNotionRichTextProperty } from "@/to-notion-property/to-notion-rich-text-property"
import { toNotionSelectProperty } from "@/to-notion-property/to-notion-select-property"
import { toNotionStatusProperty } from "@/to-notion-property/to-notion-status-property"
import { toNotionTitleProperty } from "@/to-notion-property/to-notion-title-property"
import { toNotionUrlProperty } from "@/to-notion-property/to-notion-url-property"

/**
 * 値をNotionプロパティ形式に変換
 * 読み取り専用プロパティ（created_*, last_edited_*, formula）はNotion API側で
 * 更新できないためnullを返し呼び出し元でスキップさせる
 */
export function toNotionProperty<T extends PropertyConfig>(
  config: T,
  value: unknown,
): NotionPropertyRequest | null {
  if (config.type === "title") {
    return toNotionTitleProperty(value)
  }

  if (config.type === "rich_text") {
    return toNotionRichTextProperty(value)
  }

  if (config.type === "number") {
    return toNotionNumberProperty(value)
  }

  if (config.type === "checkbox") {
    return toNotionCheckboxProperty(value)
  }

  if (config.type === "select") {
    return toNotionSelectProperty(value)
  }

  if (config.type === "multi_select") {
    return toNotionMultiSelectProperty(value)
  }

  if (config.type === "date") {
    return toNotionDateProperty(value)
  }

  if (config.type === "url") {
    return toNotionUrlProperty(value)
  }

  if (config.type === "email") {
    return toNotionEmailProperty(value)
  }

  if (config.type === "phone_number") {
    return toNotionPhoneNumberProperty(value)
  }

  if (config.type === "relation") {
    return toNotionRelationProperty(value)
  }

  if (config.type === "people") {
    return toNotionPeopleProperty(value)
  }

  if (config.type === "status") {
    return toNotionStatusProperty(value)
  }

  if (config.type === "files") {
    return toNotionFilesProperty(value)
  }

  if (config.type === "created_time") return null

  if (config.type === "last_edited_time") return null

  if (config.type === "created_by") return null

  if (config.type === "last_edited_by") return null

  if (config.type === "formula") return null

  throw new Error(`Unknown property type: ${(config as PropertyConfig).type}`)
}
