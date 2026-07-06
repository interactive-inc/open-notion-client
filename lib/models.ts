import { z } from "zod"

/**
 * タイトルプロパティ設定のスキーマ
 */
export const zTitlePropertyConfig = z.object({
  type: z.literal("title"),
})

/**
 * リッチテキストプロパティ設定のスキーマ
 */
export const zRichTextPropertyConfig = z.object({
  type: z.literal("rich_text"),
})

/**
 * 数値フォーマット（Notion API仕様の全フォーマット）
 */
const zNumberFormat = z.enum([
  "number",
  "number_with_commas",
  "percent",
  "dollar",
  "canadian_dollar",
  "singapore_dollar",
  "euro",
  "pound",
  "yen",
  "ruble",
  "rupee",
  "won",
  "yuan",
  "real",
  "lira",
  "rupiah",
  "franc",
  "hong_kong_dollar",
  "new_zealand_dollar",
  "krona",
  "norwegian_krone",
  "mexican_peso",
  "rand",
  "new_taiwan_dollar",
  "danish_krone",
  "zloty",
  "baht",
  "forint",
  "koruna",
  "shekel",
  "chilean_peso",
  "philippine_peso",
  "dirham",
  "colombian_peso",
  "riyal",
  "ringgit",
  "leu",
  "argentine_peso",
  "uruguayan_peso",
  "peruvian_sol",
])

/**
 * 数値プロパティ設定のスキーマ
 */
export const zNumberPropertyConfig = z.object({
  type: z.literal("number"),
  format: zNumberFormat.optional(),
  min: z.number().optional(),
  max: z.number().optional(),
})

/**
 * チェックボックスプロパティ設定のスキーマ
 */
export const zCheckboxPropertyConfig = z.object({
  type: z.literal("checkbox"),
})

/**
 * セレクトプロパティ設定のスキーマ
 */
export const zSelectPropertyConfig = z.object({
  type: z.literal("select"),
  options: z.union([z.array(z.string()).readonly(), z.array(z.string())]),
})

/**
 * マルチセレクトプロパティ設定のスキーマ
 */
export const zMultiSelectPropertyConfig = z.object({
  type: z.literal("multi_select"),
  options: z.union([z.array(z.string()).readonly(), z.array(z.string())]).nullable(),
})

/**
 * ステータスプロパティ設定のスキーマ
 */
export const zStatusPropertyConfig = z.object({
  type: z.literal("status"),
  options: z.union([z.array(z.string()).readonly(), z.array(z.string())]),
})

/**
 * 日付プロパティ設定のスキーマ
 */
export const zDatePropertyConfig = z.object({
  type: z.literal("date"),
})

/**
 * URLプロパティ設定のスキーマ
 */
export const zUrlPropertyConfig = z.object({
  type: z.literal("url"),
})

/**
 * メールプロパティ設定のスキーマ
 */
export const zEmailPropertyConfig = z.object({
  type: z.literal("email"),
})

/**
 * 電話番号プロパティ設定のスキーマ
 */
export const zPhoneNumberPropertyConfig = z.object({
  type: z.literal("phone_number"),
})

/**
 * リレーションプロパティ設定のスキーマ
 */
export const zRelationPropertyConfig = z.object({
  type: z.literal("relation"),
})

/**
 * ピープルプロパティ設定のスキーマ
 */
export const zPeoplePropertyConfig = z.object({
  type: z.literal("people"),
})

/**
 * ファイルプロパティ設定のスキーマ
 */
export const zFilesPropertyConfig = z.object({
  type: z.literal("files"),
})

/**
 * 作成日時プロパティ設定のスキーマ
 */
export const zCreatedTimePropertyConfig = z.object({
  type: z.literal("created_time"),
})

/**
 * 作成者プロパティ設定のスキーマ
 */
export const zCreatedByPropertyConfig = z.object({
  type: z.literal("created_by"),
})

/**
 * 最終編集日時プロパティ設定のスキーマ
 */
export const zLastEditedTimePropertyConfig = z.object({
  type: z.literal("last_edited_time"),
})

/**
 * 最終編集者プロパティ設定のスキーマ
 */
export const zLastEditedByPropertyConfig = z.object({
  type: z.literal("last_edited_by"),
})

/**
 * 式プロパティ設定のスキーマ
 */
export const zFormulaPropertyConfig = z.object({
  type: z.literal("formula"),
  formulaType: z.enum(["string", "number", "boolean", "date"]),
})

/**
 * プロパティ設定のユニオンスキーマ
 */
export const zPropertyConfig = z.discriminatedUnion("type", [
  zTitlePropertyConfig,
  zRichTextPropertyConfig,
  zNumberPropertyConfig,
  zCheckboxPropertyConfig,
  zSelectPropertyConfig,
  zMultiSelectPropertyConfig,
  zStatusPropertyConfig,
  zDatePropertyConfig,
  zUrlPropertyConfig,
  zEmailPropertyConfig,
  zPhoneNumberPropertyConfig,
  zRelationPropertyConfig,
  zPeoplePropertyConfig,
  zFilesPropertyConfig,
  zCreatedTimePropertyConfig,
  zCreatedByPropertyConfig,
  zLastEditedTimePropertyConfig,
  zLastEditedByPropertyConfig,
  zFormulaPropertyConfig,
])

/**
 * スキーマのスキーマ
 */
export const zNotionPropertyConfig = z.record(z.string(), zPropertyConfig)
