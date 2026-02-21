import type { Client } from "@notionhq/client"
import type {
  CreatePageParameters,
  PageObjectResponse,
  UpdatePageParameters,
} from "@notionhq/client/build/src/api-endpoints"
import type { z } from "zod"
import type { zNotionPropertyConfig, zPropertyConfig } from "./models"

/* Notion page object type */
export type NotionPage = PageObjectResponse

/* Notion base data types */
export type NotionPropertyType =
  | "title"
  | "rich_text"
  | "number"
  | "select"
  | "multi_select"
  | "status"
  | "date"
  | "people"
  | "files"
  | "checkbox"
  | "url"
  | "email"
  | "phone_number"
  | "relation"
  | "created_time"
  | "created_by"
  | "last_edited_time"
  | "last_edited_by"
  | "formula"

/* Notion user type */
export type NotionUser = {
  id: string
  name?: string
  avatar_url?: string
  email?: string
}

/* Notion file type */
export type NotionFile = {
  name: string
  url: string
  type: "file" | "external"
}

/* Date range type */
export type DateRange = {
  start: string
  end: string | null
  timeZone?: string
}

/* Rich text types */
/**
 * Type for rich text item response
 * Includes plain_text field that exists in Notion API response
 */
export type RichTextItemResponse = {
  type: "text"
  text: {
    content: string
    link?: {
      url: string
    } | null
  }
  plain_text: string
  annotations: {
    bold?: boolean
    italic?: boolean
    strikethrough?: boolean
    underline?: boolean
    code?: boolean
    color?:
      | "default"
      | "gray"
      | "brown"
      | "orange"
      | "yellow"
      | "green"
      | "blue"
      | "purple"
      | "pink"
      | "red"
      | "gray_background"
      | "brown_background"
      | "orange_background"
      | "yellow_background"
      | "green_background"
      | "blue_background"
      | "purple_background"
      | "pink_background"
      | "red_background"
  }
}

/**
 * Type for rich text item request
 * Used when sending data to Notion API (does not include plain_text)
 */
export type RichTextItemRequest = {
  type: "text"
  text: {
    content: string
    link?: {
      url: string
    } | null
  }
  annotations?: {
    bold?: boolean
    italic?: boolean
    strikethrough?: boolean
    underline?: boolean
    code?: boolean
    color?:
      | "default"
      | "gray"
      | "brown"
      | "orange"
      | "yellow"
      | "green"
      | "blue"
      | "purple"
      | "pink"
      | "red"
      | "gray_background"
      | "brown_background"
      | "orange_background"
      | "yellow_background"
      | "green_background"
      | "blue_background"
      | "purple_background"
      | "pink_background"
      | "red_background"
  }
}

/* Number format type */
type NumberFormat =
  | "number"
  | "number_with_commas"
  | "percent"
  | "dollar"
  | "euro"
  | "pound"
  | "yen"
  | "ruble"
  | "rupee"
  | "won"
  | "yuan"

export type TitlePropertyConfig = {
  type: "title"
}

export type RichTextPropertyConfig = {
  type: "rich_text"
}

export type NumberPropertyConfig = {
  type: "number"
  format?: NumberFormat
  min?: number
  max?: number
}

export type SelectPropertyConfig = {
  type: "select"
  options: readonly string[] | string[]
}

export type MultiSelectPropertyConfig = {
  type: "multi_select"
  options: string[] | null
}

export type StatusPropertyConfig = {
  type: "status"
  options: readonly string[] | string[]
}

export type DatePropertyConfig = {
  type: "date"
}

export type PeoplePropertyConfig = {
  type: "people"
}

export type FilesPropertyConfig = {
  type: "files"
}

export type CheckboxPropertyConfig = {
  type: "checkbox"
}

export type UrlPropertyConfig = {
  type: "url"
}

export type EmailPropertyConfig = {
  type: "email"
}

export type PhoneNumberPropertyConfig = {
  type: "phone_number"
}

export type RelationPropertyConfig = {
  type: "relation"
}

export type CreatedTimePropertyConfig = {
  type: "created_time"
}

export type CreatedByPropertyConfig = {
  type: "created_by"
}

export type LastEditedTimePropertyConfig = {
  type: "last_edited_time"
}

export type LastEditedByPropertyConfig = {
  type: "last_edited_by"
}

export type FormulaPropertyConfig = {
  type: "formula"
  formulaType: "string" | "number" | "boolean" | "date"
}

/* All property config types - inferred from zod */
export type PropertyConfig = z.infer<typeof zPropertyConfig>

/* Database schema definition - inferred from zod */
export type NotionPropertySchema = z.infer<typeof zNotionPropertyConfig>

/* Type mapping for schema */
export type PropertyTypeMapping<T extends PropertyConfig> = T extends
  | TitlePropertyConfig
  | RichTextPropertyConfig
  ? string
  : T extends NumberPropertyConfig
    ? number
    : T extends SelectPropertyConfig | StatusPropertyConfig
      ? T["options"] extends readonly (infer U)[]
        ? U
        : T["options"] extends (infer U)[]
          ? U
          : never
      : T extends MultiSelectPropertyConfig
        ? T["options"] extends null
          ? string[]
          : T["options"] extends string[]
            ? T["options"][number][]
            : string[]
        : T extends DatePropertyConfig
          ? DateRange
          : T extends PeoplePropertyConfig
            ? NotionUser[]
            : T extends FilesPropertyConfig
              ? NotionFile[]
              : T extends CheckboxPropertyConfig
                ? boolean
                : T extends
                      | UrlPropertyConfig
                      | EmailPropertyConfig
                      | PhoneNumberPropertyConfig
                  ? string
                  : T extends RelationPropertyConfig
                    ? string[]
                    : T extends
                          | CreatedTimePropertyConfig
                          | LastEditedTimePropertyConfig
                      ? Date
                      : T extends
                            | CreatedByPropertyConfig
                            | LastEditedByPropertyConfig
                        ? NotionUser
                        : T extends FormulaPropertyConfig
                          ? T["formulaType"] extends "string"
                            ? string
                            : T["formulaType"] extends "number"
                              ? number
                              : T["formulaType"] extends "boolean"
                                ? boolean
                                : T["formulaType"] extends "date"
                                  ? DateRange
                                  : never
                          : never

/* Generate type from schema */
export type SchemaType<T extends NotionPropertySchema> = {
  [K in keyof T]: PropertyTypeMapping<T[K]> | null
}

/* Record type definition */
export type TableRecord<T> = T & {
  id: string
  createdAt: string
  updatedAt: string
  isDeleted: boolean
}

/* Page reference type */
export type PageReferenceType<T> = {
  id: string
  url: string
  createdAt: string
  updatedAt: string
  isArchived: boolean
  isDeleted: boolean
  properties(): T
  raw(): PageObjectResponse
  body(): Promise<string>
}

/* Sort option type */
export type SortOption<T extends NotionPropertySchema> = {
  field: keyof SchemaType<T>
  direction: "asc" | "desc"
}

/* Table creation options */
export type TableOptions<T extends NotionPropertySchema> = {
  notion: Client
  tableId: string
  schema: T
}

/* Advanced query operators */
import type {
  CheckboxPropertyFilter,
  DatePropertyFilter,
  MultiSelectPropertyFilter,
  NumberPropertyFilter,
  PeoplePropertyFilter,
  RelationPropertyFilter,
  SelectPropertyFilter,
  StatusPropertyFilter,
  TextPropertyFilter,
} from "./notion-types"

type PropertyFilterForType<Config> = Config extends { type: "title" }
  ? TextPropertyFilter
  : Config extends { type: "rich_text" }
    ? TextPropertyFilter
    : Config extends { type: "number" }
      ? NumberPropertyFilter
      : Config extends { type: "checkbox" }
        ? CheckboxPropertyFilter
        : Config extends { type: "select" }
          ? SelectPropertyFilter
          : Config extends { type: "multi_select" }
            ? MultiSelectPropertyFilter
            : Config extends { type: "status" }
              ? StatusPropertyFilter
              : Config extends { type: "date" }
                ? DatePropertyFilter
                : Config extends { type: "people" }
                  ? PeoplePropertyFilter
                  : Config extends { type: "relation" }
                    ? RelationPropertyFilter
                    : never

type WhereFieldCondition<T extends NotionPropertySchema> = {
  [K in keyof SchemaType<T>]?: SchemaType<T>[K] | PropertyFilterForType<T[K]>
}

export type WhereCondition<T extends NotionPropertySchema> =
  | {
      or: WhereCondition<T>[]
    }
  | {
      and: WhereCondition<T>[]
    }
  | WhereFieldCondition<T>

export type FindOptions<T extends NotionPropertySchema> = {
  where?: WhereCondition<T>
  limit?: number
  cursor?: string
  sorts?: SortOption<T> | SortOption<T>[]
}

export type CreateInput<T extends NotionPropertySchema> = {
  properties: Partial<SchemaType<T>>
  body?: string
}

export type UpdateInput<T extends NotionPropertySchema> = {
  properties: Partial<SchemaType<T>>
  body?: string | null
}

export type UpdateManyOptions<T extends NotionPropertySchema> = {
  where?: WhereCondition<T>
  update: UpdateInput<T>
  limit?: number
}

export type UpsertOptions<T extends NotionPropertySchema> = {
  where: WhereCondition<T>
  insert: CreateInput<T>
  update: UpdateInput<T>
}

/* Query result type */
export type QueryResult<T> = {
  records: TableRecord<T>[]
  cursor: string | null
  hasMore: boolean
}

/* Batch operation result */
export type BatchResult<T> = {
  succeeded: T[]
  failed: Array<{
    data: unknown
    error: Error
  }>
}

/* Cache entry */
export type CacheEntry<T> = {
  data: T
  timestamp: number
  ttl: number
}

/* Cache interface */
export type NotionMemoeryCacheInterface = {
  get<T>(key: string): T | undefined
  set<T>(key: string, value: T, ttl?: number): void
  delete(key: string): void
  clear(): void
}

/* Validator interface */
export type ValidatorInterface = {
  validate(schema: NotionPropertySchema, data: unknown): Record<string, unknown>
}

/* Query builder interface */
export type NotionQueryBuilderInterface = {
  buildFilter<T extends NotionPropertySchema>(
    schema: T,
    where: WhereCondition<T>,
  ): Record<string, unknown> | undefined
  buildSort<T extends NotionPropertySchema>(
    sorts: SortOption<T>[],
  ): Array<Record<string, unknown>>
}

/* Converter interface */
export type NotionConverterInterface = {
  fromNotion<T extends NotionPropertySchema>(
    schema: T,
    properties: Record<string, unknown>,
  ): SchemaType<T>
  toNotion<T extends NotionPropertySchema, D extends Partial<SchemaType<T>>>(
    schema: T,
    data: D,
  ): Record<string, unknown>
}

/* Block types */
import type {
  BlockObjectResponse,
  BulletedListItemBlockObjectResponse,
  CalloutBlockObjectResponse,
  ColumnBlockObjectResponse,
  ColumnListBlockObjectResponse,
  NumberedListItemBlockObjectResponse,
  QuoteBlockObjectResponse,
  TableBlockObjectResponse,
  ToDoBlockObjectResponse,
  ToggleBlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints"

/**
 * Notion block type constants
 */
export const BlockType = {
  Paragraph: "paragraph",
  Heading1: "heading_1",
  Heading2: "heading_2",
  Heading3: "heading_3",
  BulletedListItem: "bulleted_list_item",
  NumberedListItem: "numbered_list_item",
  Code: "code",
  Quote: "quote",
  Callout: "callout",
  ToDo: "to_do",
  Toggle: "toggle",
  Divider: "divider",
  Image: "image",
  Video: "video",
  Audio: "audio",
  File: "file",
  Pdf: "pdf",
  Embed: "embed",
  Bookmark: "bookmark",
  LinkPreview: "link_preview",
  LinkToPage: "link_to_page",
  ChildPage: "child_page",
  ChildDatabase: "child_database",
  Table: "table",
  TableRow: "table_row",
  ColumnList: "column_list",
  Column: "column",
  Equation: "equation",
  Title: "title",
} as const

/**
 * Notion block type union
 */
export type BlockTypeValue = (typeof BlockType)[keyof typeof BlockType]

/**
 * Custom rich text item type
 */
export type CustomRichTextItem = {
  text: {
    content: string
  }
  type: "text"
  plain_text: string
  annotations?: {
    bold?: boolean
    italic?: boolean
    code?: boolean
    strikethrough?: boolean
  }
}

/**
 * Notion block type definition
 */
export type NotionBlock = BlockObjectResponse & {
  children: NotionBlock[]
}

/**
 * Notion bulleted list item block type
 */
export type NotionBulletedListItemBlock =
  BulletedListItemBlockObjectResponse & {
    children: NotionBlock[]
  }

/**
 * Notion numbered list item block type
 */
export type NotionNumberedListItemBlock =
  NumberedListItemBlockObjectResponse & {
    children: NotionBlock[]
  }

/**
 * Notion quote block type
 */
export type NotionQuoteBlock = QuoteBlockObjectResponse & {
  children: NotionBlock[]
}

/**
 * Notion callout block type
 */
export type NotionCalloutBlock = CalloutBlockObjectResponse & {
  children: NotionBlock[]
}

/**
 * Notion to_do block type
 */
export type NotionToDoBlock = ToDoBlockObjectResponse & {
  children: NotionBlock[]
}

/**
 * Notion toggle block type
 */
export type NotionToggleBlock = ToggleBlockObjectResponse & {
  children: NotionBlock[]
}

/**
 * Notion table block type
 */
export type NotionTableBlock = TableBlockObjectResponse & {
  children: NotionBlock[]
}

/**
 * Notion column list block type
 */
export type NotionColumnListBlock = ColumnListBlockObjectResponse & {
  children: NotionBlock[]
}

/**
 * Notion column block type
 */
export type NotionColumnBlock = ColumnBlockObjectResponse & {
  children: NotionBlock[]
}

/* Notion API Request Property Types */

/**
 * Notion APIのリクエスト用プロパティ型
 */
export type NotionPropertyRequest =
  | NonNullable<CreatePageParameters["properties"]>[string]
  | NonNullable<UpdatePageParameters["properties"]>[string]

/**
 * Notion APIのタイトルプロパティ型
 */
export type NotionTitlePropertyRequest = Extract<
  NotionPropertyRequest,
  { title?: unknown }
>

/**
 * Notion APIのリッチテキストプロパティ型
 */
export type NotionRichTextPropertyRequest = Extract<
  NotionPropertyRequest,
  { rich_text?: unknown }
>

/**
 * Notion APIの数値プロパティ型
 */
export type NotionNumberPropertyRequest = Extract<
  NotionPropertyRequest,
  { number?: unknown }
>

/**
 * Notion APIのチェックボックスプロパティ型
 */
export type NotionCheckboxPropertyRequest = Extract<
  NotionPropertyRequest,
  { checkbox?: unknown }
>

/**
 * Notion APIのセレクトプロパティ型
 */
export type NotionSelectPropertyRequest = Extract<
  NotionPropertyRequest,
  { select?: unknown }
>

/**
 * Notion APIのマルチセレクトプロパティ型
 */
export type NotionMultiSelectPropertyRequest = Extract<
  NotionPropertyRequest,
  { multi_select?: unknown }
>

/**
 * Notion APIの日付プロパティ型
 */
export type NotionDatePropertyRequest = Extract<
  NotionPropertyRequest,
  { date?: unknown }
>

/**
 * Notion APIのURLプロパティ型
 */
export type NotionUrlPropertyRequest = Extract<
  NotionPropertyRequest,
  { url?: unknown }
>

/**
 * Notion APIのメールプロパティ型
 */
export type NotionEmailPropertyRequest = Extract<
  NotionPropertyRequest,
  { email?: unknown }
>

/**
 * Notion APIの電話番号プロパティ型
 */
export type NotionPhoneNumberPropertyRequest = Extract<
  NotionPropertyRequest,
  { phone_number?: unknown }
>

/**
 * Notion APIのリレーションプロパティ型
 */
export type NotionRelationPropertyRequest = Extract<
  NotionPropertyRequest,
  { relation?: unknown }
>

/**
 * Notion APIのピープルプロパティ型
 */
export type NotionPeoplePropertyRequest = Extract<
  NotionPropertyRequest,
  { people?: unknown }
>
