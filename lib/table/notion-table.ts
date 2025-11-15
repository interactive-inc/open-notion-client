import type { Client } from "@notionhq/client"
import type {
  BlockObjectRequest,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints"
import { NotionPageReference } from "@/modules/notion-page-reference"
import { NotionQueryResult } from "@/modules/notion-query-result"
import { NotionMarkdown } from "@/table/notion-markdown"
import { NotionMemoryCache } from "@/table/notion-memory-cache"
import { NotionPropertyConverter } from "@/table/notion-property-converter"
import { NotionQueryBuilder } from "@/table/notion-query-builder"
import { toNotionBlocks } from "@/to-notion-block/to-notion-blocks"
import type {
  BatchResult,
  CreateInput,
  FindOptions,
  NotionPropertySchema,
  SchemaType,
  SortOption,
  UpdateInput,
  UpdateManyOptions,
  UpsertOptions,
  WhereCondition,
} from "@/types"
import { toNotionPage } from "@/utils"

type Props<T extends NotionPropertySchema> = {
  client: Client
  dataSourceId: string
  properties: T
  cache?: NotionMemoryCache
  queryBuilder?: NotionQueryBuilder
  propertyConverter?: NotionPropertyConverter
  markdown?: NotionMarkdown
}

export class NotionTable<T extends NotionPropertySchema> {
  private readonly client: Client
  private readonly dataSourceId: string
  private readonly properties: T
  private readonly cache: NotionMemoryCache
  private readonly queryBuilder: NotionQueryBuilder
  private readonly propertyConverter: NotionPropertyConverter
  private readonly markdown: NotionMarkdown

  constructor(props: Props<T>) {
    this.client = props.client
    this.dataSourceId = props.dataSourceId
    this.properties = props.properties
    this.cache = props.cache || new NotionMemoryCache()
    this.queryBuilder = props.queryBuilder || new NotionQueryBuilder()
    this.propertyConverter =
      props.propertyConverter || new NotionPropertyConverter()
    this.markdown = props.markdown || new NotionMarkdown()
  }

  async findMany(
    options: FindOptions<T> = {},
  ): Promise<NotionPageReference<T>[]> {
    const where = options.where || {}
    const count = options.count || 100

    const maxCount = Math.min(Math.max(1, count), 1024)
    const pageSize = Math.min(maxCount, 100)

    const notionFilter =
      Object.keys(where).length > 0
        ? this.queryBuilder?.buildFilter(this.properties, where)
        : undefined

    const notionSort = this.buildNotionSort(options.sorts)

    const pages = await this.fetchPages(
      maxCount,
      pageSize,
      notionFilter,
      notionSort,
    )

    return pages.references()
  }

  async findOne(
    options: FindOptions<T> = {},
  ): Promise<NotionPageReference<T> | null> {
    const result = await this.findMany({
      ...options,
      count: 1,
    })
    return result[0] || null
  }

  async findById(
    id: string,
    options?: { cache?: boolean },
  ): Promise<NotionPageReference<T> | null> {
    if (options?.cache) {
      const cached = this.cache.getPage(id)
      if (cached) {
        return new NotionPageReference({
          notion: this.client,
          schema: this.properties,
          converter: this.propertyConverter,
          notionPage: cached,
          cache: this.cache,
        })
      }
    }

    try {
      const response = await this.client.pages.retrieve({ page_id: id })

      const notionPage = response as unknown as PageObjectResponse

      if (options?.cache) {
        this.cache.setPage(id, notionPage)
      }

      return new NotionPageReference({
        notion: this.client,
        schema: this.properties,
        converter: this.propertyConverter,
        notionPage: notionPage,
        cache: this.cache,
      })
    } catch (e) {
      if (e instanceof Error) {
        throw e
      }

      throw new Error("Unknown error occurred")
    }
  }

  async create(input: CreateInput<T>): Promise<NotionPageReference<T>> {
    if (!this.propertyConverter) {
      throw new Error("Converter is not initialized")
    }

    const properties = this.propertyConverter.toNotion(
      this.properties,
      input.properties as Partial<SchemaType<T>>,
    )

    let children: BlockObjectRequest[] = []

    if (input.body) {
      const blocks = toNotionBlocks(input.body)
      children = blocks.map((block) => {
        if (typeof block.type === "string") {
          const enhancedType = this.markdown.enhanceBlockType(block.type)
          return { ...block, type: enhancedType } as typeof block
        }
        return block
      })
    }

    const response = await this.client.pages.create({
      parent: { data_source_id: this.dataSourceId },
      properties: properties,
      children: children,
    })

    const record = await this.findById(response.id)

    if (!record) {
      throw new Error("Failed to retrieve created record")
    }

    return record
  }

  get insert() {
    return this.create
  }

  async createMany(
    records: Array<CreateInput<T>>,
  ): Promise<BatchResult<NotionPageReference<T>>> {
    const results = await Promise.allSettled(
      records.map((record) => {
        return this.create(record)
      }),
    )

    const succeeded: NotionPageReference<T>[] = []

    const failed: Array<{
      data: CreateInput<T>
      error: Error
    }> = []

    for (const [index, result] of results.entries()) {
      if (result.status === "fulfilled") {
        succeeded.push(result.value)
        continue
      }

      const record = records[index]

      if (record === undefined) continue

      const error =
        result.reason instanceof Error
          ? result.reason
          : new Error(String(result.reason))

      failed.push({
        data: record,
        error: error,
      })
    }

    return { succeeded, failed }
  }

  get insertMany() {
    return this.createMany
  }

  async update(
    id: string,
    input: UpdateInput<T>,
  ): Promise<NotionPageReference<T>> {
    if (!this.propertyConverter) {
      throw new Error("Converter is not initialized")
    }

    const properties = this.propertyConverter.toNotion(
      this.properties,
      input.properties,
    )

    const result = await this.client.pages.update({
      page_id: id,
      properties: properties,
    })

    if (input.body) {
      await this.updatePageContent(id, input.body)
      this.cache.deleteBlocks(id)
    }

    const notionPage = result as unknown as PageObjectResponse

    this.cache.setPage(id, notionPage)
    this.cache.deleteBlocks(id)

    return new NotionPageReference({
      notion: this.client,
      schema: this.properties,
      converter: this.propertyConverter,
      notionPage: notionPage,
      cache: this.cache,
    })
  }

  async updateMany(options: UpdateManyOptions<T>): Promise<number> {
    const result = await this.findMany({
      where: options.where || {},
      count: options.count || 1024,
    })

    let updated = 0

    for (const record of result) {
      await this.update(record.id, options.update)
      updated++
    }

    return updated
  }

  async upsert(options: UpsertOptions<T>): Promise<NotionPageReference<T>> {
    const current = await this.findOne({ where: options.where })

    if (current !== null) {
      await this.update(current.id, options.update)
      const updated = await this.findById(current.id)
      if (updated === null) {
        throw new Error("Failed to retrieve updated record")
      }
      return updated
    }

    return await this.create(options.insert)
  }

  async deleteMany(where: WhereCondition<T> = {}): Promise<number> {
    const result = await this.findMany({ where, count: 1024 })

    let deleted = 0
    for (const record of result) {
      await this.delete(record.id)
      deleted++
    }

    return deleted
  }

  async delete(id: string): Promise<void> {
    await this.client.pages.update({
      page_id: id,
      archived: true,
    })

    this.cache.deletePage(id)
    this.cache.deleteBlocks(id)
  }

  async restore(id: string): Promise<NotionPageReference<T>> {
    const result = await this.client.pages.update({
      page_id: id,
      archived: false,
    })

    const notionPage = toNotionPage(result)

    this.cache.setPage(id, notionPage)

    return new NotionPageReference({
      notion: this.client,
      schema: this.properties,
      converter: this.propertyConverter,
      notionPage: notionPage,
      cache: this.cache,
    })
  }

  clearCache(): void {
    this.cache.clear()
  }

  private buildNotionSort(
    sorts: SortOption<T> | SortOption<T>[] | undefined,
  ): Array<Record<string, unknown>> {
    if (!sorts) {
      return []
    }
    const sortArray = Array.isArray(sorts) ? sorts : [sorts]
    return this.queryBuilder?.buildSort(sortArray) || []
  }

  private async fetchPages(
    maxCount: number,
    pageSize: number,
    notionFilter: Record<string, unknown> | undefined,
    notionSort: Array<Record<string, unknown>>,
  ): Promise<NotionQueryResult<T>> {
    const references: NotionPageReference<T>[] = []

    let nextCursor: string | null = null
    let hasMore = true

    while (hasMore && references.length < maxCount) {
      const response = await this.client.dataSources.query({
        data_source_id: this.dataSourceId,
        filter: notionFilter as never,
        sorts: notionSort.length > 0 ? (notionSort as never) : undefined,
        start_cursor: nextCursor || undefined,
        page_size: pageSize,
      })
      const refs = response.results.map((page) => {
        return new NotionPageReference({
          notion: this.client,
          schema: this.properties,
          converter: this.propertyConverter,
          notionPage: page as PageObjectResponse,
          cache: this.cache,
        })
      })
      references.push(...refs)
      nextCursor = response.next_cursor
      hasMore = response.has_more && references.length < maxCount
    }

    if (references.length > maxCount) {
      return new NotionQueryResult({
        pageReferences: references.slice(0, maxCount),
        cursor: nextCursor,
        hasMore,
      })
    }

    return new NotionQueryResult({
      pageReferences: references,
      cursor: nextCursor,
      hasMore,
    })
  }

  private async updatePageContent(id: string, content: string): Promise<void> {
    const blocksResult = await this.client.blocks.children.list({
      block_id: id,
    })

    for (const block of blocksResult.results) {
      await this.client.blocks.delete({
        block_id: block.id,
      })
    }

    const blocks = toNotionBlocks(content)
    const enhancedBlocks = blocks.map((block) => {
      if ("type" in block && typeof block.type === "string") {
        const enhancedType = this.markdown.enhanceBlockType(block.type)
        return { ...block, type: enhancedType } as typeof block
      }
      return block
    })

    await this.client.blocks.children.append({
      block_id: id,
      children: enhancedBlocks as never,
    })
  }
}
