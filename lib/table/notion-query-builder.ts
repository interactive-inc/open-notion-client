import type { QueryDataSourceParameters } from "@notionhq/client/build/src/api-endpoints"
import type { NotionQueryWhere } from "@/notion-types"
import type { NotionPropertySchema, PropertyConfig, SortOption, WhereCondition } from "@/types"

type NotionSort = NonNullable<QueryDataSourceParameters["sorts"]>[number]

export class NotionQueryBuilder {
  buildFilter<T extends NotionPropertySchema>(
    schema: T,
    where: WhereCondition<T>,
  ): NotionQueryWhere | undefined {
    return this.buildInternal(schema, where)
  }

  /**
   * 内部用: 構築済みの NotionQueryWhere を返す
   */
  private buildInternal<T extends NotionPropertySchema>(
    schema: T,
    where: WhereCondition<T>,
  ): NotionQueryWhere | undefined {
    // スキーマ側に or / and という名前のフィールドが定義できるため
    // 配列であることも確認してから論理結合子として扱う
    // in 演算子だけでは WhereCondition<T>[] に絞り込めずキャストが必要になる
    if ("or" in where && Array.isArray(where.or)) {
      return this.buildOrCondition(schema, where.or as WhereCondition<T>[])
    }

    if ("and" in where && Array.isArray(where.and)) {
      return this.buildAndCondition(schema, where.and as WhereCondition<T>[])
    }

    // Handle field conditions
    return this.buildFieldConditions(schema, where)
  }

  buildSort<T extends NotionPropertySchema>(sorts: SortOption<T>[]): NotionSort[] {
    return sorts.map((sort) => ({
      property: String(sort.field),
      direction: sort.direction === "asc" ? "ascending" : "descending",
    }))
  }

  private buildOrCondition<T extends NotionPropertySchema>(
    schema: T,
    conditions: WhereCondition<T>[],
  ): NotionQueryWhere | undefined {
    const orConditions = conditions
      .map((condition) => this.buildInternal(schema, condition))
      .filter((filter): filter is NotionQueryWhere => filter !== undefined)

    if (orConditions.length === 0) {
      return undefined
    }

    if (orConditions.length === 1) {
      return orConditions[0]
    }

    return { or: orConditions }
  }

  private buildAndCondition<T extends NotionPropertySchema>(
    schema: T,
    conditions: WhereCondition<T>[],
  ): NotionQueryWhere | undefined {
    const andConditions = conditions
      .map((condition) => this.buildInternal(schema, condition))
      .filter((filter): filter is NotionQueryWhere => filter !== undefined)

    if (andConditions.length === 0) {
      return undefined
    }

    if (andConditions.length === 1) {
      return andConditions[0]
    }

    return { and: andConditions }
  }

  private buildFieldConditions<T extends NotionPropertySchema>(
    schema: T,
    where: Record<string, unknown>,
  ): NotionQueryWhere | undefined {
    const conditions: NotionQueryWhere[] = []

    for (const entry of Object.entries(where)) {
      const key = entry[0]
      const value = entry[1]
      const config = schema[key]
      if (!config) {
        continue
      }

      // Notion API filter format
      if (this.isNotionFilter(value)) {
        conditions.push({
          property: key,
          [config.type]: value,
        } as NotionQueryWhere)
        continue
      }

      // Simple value format
      if (value !== undefined && value !== null) {
        const simpleCondition = this.buildSimpleCondition(key, value, config)
        if (simpleCondition) {
          conditions.push(simpleCondition)
        }
      }
    }

    if (conditions.length === 0) {
      return undefined
    }

    if (conditions.length === 1) {
      return conditions[0]
    }

    return { and: conditions }
  }

  private isNotionFilter(value: unknown): boolean {
    if (!value || typeof value !== "object") {
      return false
    }
    const notionFilterKeys = [
      "equals",
      "does_not_equal",
      "contains",
      "does_not_contain",
      "starts_with",
      "ends_with",
      "is_empty",
      "is_not_empty",
      "greater_than",
      "less_than",
      "greater_than_or_equal_to",
      "less_than_or_equal_to",
      "before",
      "after",
      "on_or_before",
      "on_or_after",
    ]
    return Object.keys(value).some((key) => notionFilterKeys.includes(key))
  }

  private buildSimpleCondition(
    key: string,
    value: unknown,
    config: PropertyConfig,
  ): NotionQueryWhere | null {
    // Title type
    if (config.type === "title") {
      return {
        property: key,
        title: { equals: String(value) },
      } satisfies NotionQueryWhere
    }

    // Rich text type
    if (config.type === "rich_text") {
      return {
        property: key,
        rich_text: { equals: String(value) },
      } satisfies NotionQueryWhere
    }

    // Number type
    if (config.type === "number" && typeof value === "number") {
      return {
        property: key,
        number: { equals: value },
      } satisfies NotionQueryWhere
    }

    // Select type
    if (config.type === "select" && typeof value === "string") {
      return {
        property: key,
        select: { equals: value },
      } satisfies NotionQueryWhere
    }

    // Status type
    if (config.type === "status" && typeof value === "string") {
      return {
        property: key,
        status: { equals: value },
      } satisfies NotionQueryWhere
    }

    // Multi-select type
    if (config.type === "multi_select") {
      if (typeof value === "string") {
        return {
          property: key,
          multi_select: { contains: value },
        } satisfies NotionQueryWhere
      }
      if (Array.isArray(value)) {
        if (value.length === 0) {
          return null
        }
        if (value.length === 1) {
          return {
            property: key,
            multi_select: { contains: String(value[0]) },
          } satisfies NotionQueryWhere
        }
        return {
          and: value.map((v) => ({
            property: key,
            multi_select: { contains: String(v) },
          })),
        } satisfies NotionQueryWhere
      }
    }

    // Date type
    if (config.type === "date") {
      return {
        property: key,
        date: { equals: this.getDateString(value) },
      } satisfies NotionQueryWhere
    }

    // Checkbox type
    if (config.type === "checkbox") {
      return {
        property: key,
        checkbox: { equals: Boolean(value) },
      } satisfies NotionQueryWhere
    }

    // URL / Email / Phone number type
    if (config.type === "url" && typeof value === "string") {
      return {
        property: key,
        url: { equals: value },
      } satisfies NotionQueryWhere
    }

    if (config.type === "email" && typeof value === "string") {
      return {
        property: key,
        email: { equals: value },
      } satisfies NotionQueryWhere
    }

    if (config.type === "phone_number" && typeof value === "string") {
      return {
        property: key,
        phone_number: { equals: value },
      } satisfies NotionQueryWhere
    }

    // Relation type
    if (config.type === "relation") {
      const relationCondition = this.buildRelationCondition(key, value)
      if (relationCondition !== undefined) {
        return relationCondition
      }
    }

    // People type
    if (config.type === "people") {
      const peopleCondition = this.buildPeopleCondition(key, value)
      if (peopleCondition !== undefined) {
        return peopleCondition
      }
    }

    // Created time / Last edited time type
    if (config.type === "created_time" || config.type === "last_edited_time") {
      const timestampString =
        value instanceof Date ? value.toISOString() : typeof value === "string" ? value : null
      if (timestampString !== null) {
        if (config.type === "created_time") {
          return {
            property: key,
            created_time: { equals: timestampString },
          } satisfies NotionQueryWhere
        }
        return {
          property: key,
          last_edited_time: { equals: timestampString },
        } satisfies NotionQueryWhere
      }
    }

    // Created by / Last edited by type
    if (config.type === "created_by" || config.type === "last_edited_by") {
      const userId = this.extractUserId(value)
      if (userId !== null) {
        if (config.type === "created_by") {
          return {
            property: key,
            created_by: { contains: userId },
          } satisfies NotionQueryWhere
        }
        return {
          property: key,
          last_edited_by: { contains: userId },
        } satisfies NotionQueryWhere
      }
    }

    // Formula type
    if (config.type === "formula") {
      if (config.formulaType === "string" && typeof value === "string") {
        return {
          property: key,
          formula: { string: { equals: value } },
        } satisfies NotionQueryWhere
      }
      if (config.formulaType === "number" && typeof value === "number") {
        return {
          property: key,
          formula: { number: { equals: value } },
        } satisfies NotionQueryWhere
      }
      if (config.formulaType === "boolean" && typeof value === "boolean") {
        return {
          property: key,
          formula: { checkbox: { equals: value } },
        } satisfies NotionQueryWhere
      }
      if (config.formulaType === "date") {
        return {
          property: key,
          formula: { date: { equals: this.getDateString(value) } },
        } satisfies NotionQueryWhere
      }
    }

    // 変換できない値を黙って捨てるとフィルターなし（全件マッチ）のクエリになり
    // deleteMany などで意図しない全件操作を引き起こすため、明示的にエラーにする
    throw new Error(
      `Cannot convert value for property "${key}" (type: ${config.type}) to a Notion filter: ${JSON.stringify(value)}`,
    )
  }

  /**
   * undefined は「変換不能」を意味し、呼び出し側でエラーになる
   * null は「条件なし（空配列）」としてスキップされる
   */
  private buildRelationCondition(key: string, value: unknown): NotionQueryWhere | null | undefined {
    if (typeof value === "string") {
      return {
        property: key,
        relation: { contains: value },
      } satisfies NotionQueryWhere
    }

    if (!Array.isArray(value)) {
      return undefined
    }

    if (value.length === 0) {
      return null
    }

    const relationConditions = value.map((pageId) => ({
      property: key,
      relation: { contains: String(pageId) },
    }))

    if (relationConditions.length === 1 && relationConditions[0]) {
      return relationConditions[0]
    }

    return { and: relationConditions } satisfies NotionQueryWhere
  }

  private buildPeopleCondition(key: string, value: unknown): NotionQueryWhere | null | undefined {
    if (typeof value === "string") {
      return {
        property: key,
        people: { contains: value },
      } satisfies NotionQueryWhere
    }

    if (!Array.isArray(value)) {
      return undefined
    }

    if (value.length === 0) {
      return null
    }

    const peopleConditions = value.map((user) => ({
      property: key,
      people: { contains: this.getUserId(user) },
    }))

    if (peopleConditions.length === 1 && peopleConditions[0]) {
      return peopleConditions[0]
    }

    return { and: peopleConditions } satisfies NotionQueryWhere
  }

  private extractUserId(value: unknown): string | null {
    if (typeof value === "string") {
      return value
    }

    if (value && typeof value === "object" && "id" in value && typeof value.id === "string") {
      return value.id
    }

    return null
  }

  private getUserId(value: unknown): string {
    if (typeof value === "string") {
      return value
    }

    if (value && typeof value === "object" && "id" in value && typeof value.id === "string") {
      return value.id
    }

    throw new Error(`Invalid people value: ${JSON.stringify(value)}`)
  }

  private getDateString(value: unknown): string {
    if (value && typeof value === "object" && "start" in value) {
      const start = (value as { start: string }).start
      if (start) {
        return start.split("T")[0] || start
      }
    }

    // toISOString はUTC基準のため UTC+9 などの環境では日付が1日ずれる
    // ローカルタイムゾーンの年月日で組み立てる
    if (value instanceof Date) {
      const year = value.getFullYear()
      const month = String(value.getMonth() + 1).padStart(2, "0")
      const day = String(value.getDate()).padStart(2, "0")
      return `${year}-${month}-${day}`
    }

    if (typeof value === "string") {
      return value.split("T")[0] || value
    }

    throw new Error(`Invalid date value: ${JSON.stringify(value)}`)
  }
}
