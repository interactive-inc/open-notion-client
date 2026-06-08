import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { fromNotionCheckboxProperty } from "@/from-notion-property/from-notion-checkbox-property"
import { fromNotionCreatedByProperty } from "@/from-notion-property/from-notion-created-by-property"
import { fromNotionDateProperty } from "@/from-notion-property/from-notion-date-property"
import { fromNotionFilesProperty } from "@/from-notion-property/from-notion-files-property"
import { fromNotionFormulaProperty } from "@/from-notion-property/from-notion-formula-property"
import { fromNotionLastEditedByProperty } from "@/from-notion-property/from-notion-last-edited-by-property"
import { fromNotionMultiSelectProperty } from "@/from-notion-property/from-notion-multi-select-property"
import { fromNotionNumberProperty } from "@/from-notion-property/from-notion-number-property"
import { fromNotionPeopleProperty } from "@/from-notion-property/from-notion-people-property"
import { fromNotionRelationProperty } from "@/from-notion-property/from-notion-relation-property"
import { fromNotionRichTextProperty } from "@/from-notion-property/from-notion-rich-text-property"
import { fromNotionSelectProperty } from "@/from-notion-property/from-notion-select-property"
import { fromNotionTitleProperty } from "@/from-notion-property/from-notion-title-property"

type NotionProperty = PageObjectResponse["properties"][string]

/**
 * Notionのプロパティを宣言された型に揃えて変換
 */
export function fromNotionProperty(property: NotionProperty): unknown {
  if (property.type === "title") {
    return fromNotionTitleProperty(property)
  }

  if (property.type === "rich_text") {
    return fromNotionRichTextProperty(property)
  }

  if (property.type === "number") {
    return fromNotionNumberProperty(property)
  }

  if (property.type === "checkbox") {
    return fromNotionCheckboxProperty(property)
  }

  if (property.type === "select") {
    return fromNotionSelectProperty(property)
  }

  if (property.type === "multi_select") {
    return fromNotionMultiSelectProperty(property)
  }

  if (property.type === "date") {
    return fromNotionDateProperty(property)
  }

  if (property.type === "email") {
    return property.email
  }

  if (property.type === "phone_number") {
    return property.phone_number
  }

  if (property.type === "url") {
    return property.url
  }

  if (property.type === "created_time") {
    return property.created_time
  }

  if (property.type === "last_edited_time") {
    return property.last_edited_time
  }

  if (property.type === "created_by") {
    return fromNotionCreatedByProperty(property)
  }

  if (property.type === "last_edited_by") {
    return fromNotionLastEditedByProperty(property)
  }

  if (property.type === "status") {
    return property.status?.name || null
  }

  if (property.type === "files") {
    return fromNotionFilesProperty(property)
  }

  if (property.type === "people") {
    return fromNotionPeopleProperty(property)
  }

  if (property.type === "relation") {
    return fromNotionRelationProperty(property)
  }

  if (property.type === "formula") {
    return fromNotionFormulaProperty(property)
  }

  return null
}
