import { APIErrorCode, type Client } from "@notionhq/client"
import type {
  BlockObjectRequest,
  PageObjectResponse,
  QueryDataSourceParameters,
} from "@notionhq/client/build/src/api-endpoints"
import type { NotionQueryWhere } from "@/notion-types"
import { NotionPageReference } from "@/modules/notion-page-reference"
import { NotionQueryResult } from "@/modules/notion-query-result"
import { NotionMarkdown } from "@/table/notion-markdown"
import type { NotionMemoryCache } from "@/table/notion-memory-cache"
import { NotionPropertyConverter } from "@/table/notion-property-converter"
import { NotionQueryBuilder } from "@/table/notion-query-builder"
import { toNotionBlocks } from "@/to-notion-block/to-notion-blocks"
import type {
  BatchResult,
  CreateInput,
  FindOptions,
  NotionPropertySchema,
  SortOption,
  UpdateInput,
  UpdateManyOptions,
  UpsertOptions,
  WhereCondition,
} from "@/types"
import { withRetry } from "@/retry"
import { type SafeNotionTable, createSafeNotionTable } from "@/table/safe-notion-table"
import { toNotionPage } from "@/utils"
import { withConcurrency } from "@/with-concurrency"

const MAX_FIND_LIMIT = 1024
const NOTION_PAGE_SIZE = 100

type RetryOptions = {
  maxRetries?: number
  baseDelayMs?: number
}

type Props<T extends NotionPropertySchema> = {
  client: Client
  dataSourceId: string
  properties: T
  cache?: NotionMemoryCache
  queryBuilder?: NotionQueryBuilder
  propertyConverter?: NotionPropertyConverter
  markdown?: NotionMarkdown
  retry?: RetryOptions
}

function isObjectNotFound(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false
  }
  if (!("code" in error)) {
    return false
  }
  return error.code === APIErrorCode.ObjectNotFound
}

export class NotionTable<T extends NotionPropertySchema> {
  private readonly client: Client
  private readonly dataSourceId: string
  private readonly properties: T
  private readonly cache: NotionMemoryCache | null
  private readonly queryBuilder: NotionQueryBuilder
  private readonly propertyConverter: NotionPropertyConverter
  private readonly markdown: NotionMarkdown
  private readonly retryOptions: { maxRetries: number; baseDelayMs: number }

  constructor(props: Props<T>) {
    this.client = props.client
    this.dataSourceId = props.dataSourceId
    this.properties = props.properties
    this.cache = props.cache ?? null
    this.queryBuilder = props.queryBuilder || new NotionQueryBuilder()
    this.propertyConverter = props.propertyConverter || new NotionPropertyConverter()
    this.markdown = props.markdown || new NotionMarkdown()
    this.retryOptions = {
      maxRetries: props.retry?.maxRetries ?? 3,
      baseDelayMs: props.retry?.baseDelayMs ?? 400,
    }
  }

  private withRetry<R>(fn: () => Promise<R>): Promise<R> {
    return withRetry(fn, this.retryOptions)
  }

  async findMany(options: FindOptions<T> = {}): Promise<{
    records: NotionPageReference<T>[]
    hasMore: boolean
    nextCursor: string | null
  }> {
    const where = options.where || {}
    const limit = options.limit || NOTION_PAGE_SIZE

    const maxCount = Math.min(Math.max(1, limit), MAX_FIND_LIMIT)
    const pageSize = Math.min(maxCount, NOTION_PAGE_SIZE)

    const notionFilter =
      Object.keys(where).length > 0
        ? this.queryBuilder.buildFilter(this.properties, where)
        : undefined

    const notionSort = this.buildNotionSort(options.sorts)

    const result = await this.fetchPages(
      maxCount,
      pageSize,
      notionFilter,
      notionSort,
      options.cursor,
    )

    return {
      records: result.references(),
      hasMore: result.hasMore(),
      nextCursor: result.cursor(),
    }
  }

  async findOne(
    options: Omit<FindOptions<T>, "limit" | "cursor"> = {},
  ): Promise<NotionPageReference<T> | null> {
    const result = await this.findMany({
      where: options.where,
      sorts: options.sorts,
      limit: 1,
    })
    return result.records[0] || null
  }

  async findById(id: string): Promise<NotionPageReference<T> | null> {
    const cached = this.cache?.getPage(id)
    if (cached) {
      return this.buildReference(cached)
    }

    try {
      const response = await this.withRetry(() => this.client.pages.retrieve({ page_id: id }))
      const notionPage = toNotionPage(response)

      this.cache?.setPage(id, notionPage)

      return this.buildReference(notionPage)
    } catch (e) {
      if (isObjectNotFound(e)) {
        return null
      }
      throw e
    }
  }

  async create(input: CreateInput<T>): Promise<NotionPageReference<T>> {
    const properties = this.propertyConverter.toNotion(this.properties, input.properties)

    let children: BlockObjectRequest[] = []

    if (input.body) {
      const blocks = toNotionBlocks(input.body)
      children = blocks.map((block) => this.markdown.enhanceBlock(block))
    }

    const response = await this.withRetry(() =>
      this.client.pages.create({
        parent: { data_source_id: this.dataSourceId },
        properties: properties,
        children: children,
      }),
    )

    const record = await this.findById(response.id)

    if (!record) {
      throw new Error("Failed to retrieve created record")
    }

    return record
  }

  async createMany(
    records: Array<CreateInput<T>>,
    options: { concurrency?: number } = {},
  ): Promise<BatchResult<NotionPageReference<T>>> {
    const succeeded: NotionPageReference<T>[] = []
    const failed: Array<{ data: CreateInput<T>; error: Error }> = []

    // Notion APIのレート制限は平均3 req/sのため、デフォルトを3に設定する
    // 同時実行数を1にすれば完全な逐次処理になる
    const concurrency = options.concurrency ?? 3

    await withConcurrency(records, concurrency, async (record) => {
      try {
        const result = await this.create(record)
        succeeded.push(result)
      } catch (e) {
        const error = e instanceof Error ? e : new Error(String(e))
        failed.push({ data: record, error: error })
      }
    })

    return { succeeded, failed }
  }

  async update(id: string, input: UpdateInput<T>): Promise<NotionPageReference<T>> {
    const properties = this.propertyConverter.toNotion(this.properties, input.properties)

    const result = await this.withRetry(() =>
      this.client.pages.update({
        page_id: id,
        properties: properties,
      }),
    )

    if (input.body !== undefined) {
      await this.updatePageContent(id, input.body)
      this.cache?.deleteBlocks(id)
    }

    const notionPage = toNotionPage(result)

    this.cache?.setPage(id, notionPage)

    return this.buildReference(notionPage)
  }

  async updateMany(options: UpdateManyOptions<T>): Promise<BatchResult<NotionPageReference<T>>> {
    const result = await this.findMany({
      where: options.where || {},
      limit: options.limit || MAX_FIND_LIMIT,
    })

    const succeeded: NotionPageReference<T>[] = []
    const failed: Array<{ data: NotionPageReference<T>; error: Error }> = []

    await withConcurrency(result.records, 3, async (record) => {
      try {
        const updated = await this.update(record.id, options.update)
        succeeded.push(updated)
      } catch (e) {
        const error = e instanceof Error ? e : new Error(String(e))
        failed.push({ data: record, error: error })
      }
    })

    return { succeeded, failed }
  }

  async upsert(options: UpsertOptions<T>): Promise<NotionPageReference<T>> {
    const current = await this.findOne({ where: options.where })

    if (current !== null) {
      return await this.update(current.id, options.update)
    }

    return await this.create(options.create)
  }

  async deleteMany(where: WhereCondition<T> = {}): Promise<BatchResult<string>> {
    const result = await this.findMany({ where, limit: MAX_FIND_LIMIT })

    const succeeded: string[] = []
    const failed: Array<{ data: string; error: Error }> = []

    await withConcurrency(result.records, 3, async (record) => {
      try {
        await this.delete(record.id)
        succeeded.push(record.id)
      } catch (e) {
        const error = e instanceof Error ? e : new Error(String(e))
        failed.push({ data: record.id, error: error })
      }
    })

    return { succeeded, failed }
  }

  async delete(id: string): Promise<void> {
    await this.withRetry(() =>
      this.client.pages.update({
        page_id: id,
        archived: true,
      }),
    )

    this.cache?.deletePage(id)
    this.cache?.deleteBlocks(id)
  }

  async restore(id: string): Promise<NotionPageReference<T>> {
    const result = await this.withRetry(() =>
      this.client.pages.update({
        page_id: id,
        archived: false,
      }),
    )

    const notionPage = toNotionPage(result)

    this.cache?.setPage(id, notionPage)
    this.cache?.deleteBlocks(id)

    return this.buildReference(notionPage)
  }

  get safe(): SafeNotionTable<T> {
    return createSafeNotionTable(this)
  }

  clearCache(): void {
    this.cache?.clear()
  }

  private buildReference(notionPage: PageObjectResponse): NotionPageReference<T> {
    return new NotionPageReference({
      notion: this.client,
      schema: this.properties,
      converter: this.propertyConverter,
      notionPage: notionPage,
      cache: this.cache ?? undefined,
    })
  }

  private buildNotionSort(
    sorts: SortOption<T> | SortOption<T>[] | undefined,
  ): NonNullable<QueryDataSourceParameters["sorts"]> {
    if (!sorts) {
      return []
    }
    const sortArray = Array.isArray(sorts) ? sorts : [sorts]
    return this.queryBuilder.buildSort(sortArray)
  }

  private async fetchPages(
    maxCount: number,
    pageSize: number,
    notionFilter: NotionQueryWhere | undefined,
    notionSort: NonNullable<QueryDataSourceParameters["sorts"]>,
    startCursor?: string,
  ): Promise<NotionQueryResult<T>> {
    const references: NotionPageReference<T>[] = []

    let nextCursor: string | null = startCursor || null
    let hasMore = true

    // NotionQueryWhere と QueryDataSourceParameters["filter"] は
    // 構造的に同一だが独立宣言のため互換性がない
    const apiFilter = notionFilter as QueryDataSourceParameters["filter"]

    while (hasMore && references.length < maxCount) {
      const response = await this.withRetry(() =>
        this.client.dataSources.query({
          data_source_id: this.dataSourceId,
          filter: apiFilter,
          sorts: notionSort.length > 0 ? notionSort : undefined,
          start_cursor: nextCursor || undefined,
          page_size: pageSize,
        }),
      )

      for (const result of response.results) {
        if (!("properties" in result)) {
          continue
        }
        references.push(this.buildReference(result as PageObjectResponse))
      }

      nextCursor = response.next_cursor
      hasMore = response.has_more
    }

    const pageReferences =
      references.length > maxCount ? references.slice(0, maxCount) : references

    // limit分取得してもNotion側にデータが残っている場合はhasMore=trueを保持する
    const resultHasMore = hasMore || references.length > maxCount

    return new NotionQueryResult({
      pageReferences,
      cursor: nextCursor,
      hasMore: resultHasMore,
    })
  }

  private async updatePageContent(id: string, content: string | null): Promise<void> {
    let cursor: string | undefined

    const existing: { id: string }[] = []

    while (true) {
      const response = await this.withRetry(() =>
        this.client.blocks.children.list({
          block_id: id,
          start_cursor: cursor,
        }),
      )
      for (const block of response.results) {
        existing.push({ id: block.id })
      }
      if (!response.has_more || response.next_cursor === null) break
      cursor = response.next_cursor
    }

    // 並列で削除するとNotionのレート制限に直撃するため逐次で実行する
    for (const block of existing) {
      await this.withRetry(() => this.client.blocks.delete({ block_id: block.id }))
    }

    if (content === null) return

    const blocks = toNotionBlocks(content)
    const enhancedBlocks = blocks.map((block) => this.markdown.enhanceBlock(block))

    await this.withRetry(() =>
      this.client.blocks.children.append({
        block_id: id,
        children: enhancedBlocks,
      }),
    )
  }
}
