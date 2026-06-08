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
    // Handle or conditions
    if ("or" in where) {
      return this.buildOrCondition(schema, where.or as WhereCondition<T>[])
    }

    // Handle and conditions
    if ("and" in where) {
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
      if (Array.isArray(value) && value.length > 0) {
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
        } as NotionQueryWhere
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

    // Relation type
    if (config.type === "relation" && typeof value === "string") {
      return {
        property: key,
        relation: { contains: value },
      } satisfies NotionQueryWhere
    }

    // Formula type
    if (config.type === "formula") {
      if (config.formulaType === "string" && typeof value === "string") {
        return {
          property: key,
          formula: { string: { equals: value } },
        } as NotionQueryWhere
      }
      if (config.formulaType === "number" && typeof value === "number") {
        return {
          property: key,
          formula: { number: { equals: value } },
        } as NotionQueryWhere
      }
      if (config.formulaType === "boolean" && typeof value === "boolean") {
        return {
          property: key,
          formula: { checkbox: { equals: value } },
        } as NotionQueryWhere
      }
      if (config.formulaType === "date") {
        return {
          property: key,
          formula: { date: { equals: this.getDateString(value) } },
        } as NotionQueryWhere
      }
    }

    return null
  }

  private getDateString(value: unknown): string {
    if (value && typeof value === "object" && "start" in value) {
      const start = (value as { start: string }).start
      if (start) {
        return start.split("T")[0] || start
      }
    }

    if (value instanceof Date) {
      return value.toISOString().split("T")[0] || value.toISOString()
    }

    if (typeof value === "string") {
      return value.split("T")[0] || value
    }

    throw new Error(`Invalid date value: ${JSON.stringify(value)}`)
  }
}
