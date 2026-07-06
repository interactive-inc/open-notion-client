import type { Client } from "@notionhq/client"
import type {
  ListBlockChildrenParameters,
  ListBlockChildrenResponse,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints"
import { enhance } from "@/enhance"
import { fromNotionBlocks } from "@/from-notion-block/from-notion-blocks"
import type { NotionMemoryCache } from "@/table/notion-memory-cache"
import type { NotionPropertyConverter } from "@/table/notion-property-converter"
import type { NotionPage, NotionPropertySchema, SchemaType } from "@/types"

type Props<T extends NotionPropertySchema> = {
  readonly schema: T
  readonly client: Client
  readonly notionPage: NotionPage
  readonly converter: NotionPropertyConverter
  readonly cache?: NotionMemoryCache
  /**
   * 子ブロック取得に使う関数。NotionTableはリトライ済みの関数を渡す
   * 未指定時はclientを直接使う（リトライなし）
   */
  readonly listBlockChildren?: (
    args: ListBlockChildrenParameters,
  ) => Promise<ListBlockChildrenResponse>
}

/**
 * Notion ページへの参照を表すクラス
 */
export class NotionPageReference<T extends NotionPropertySchema> {
  constructor(private readonly props: Props<T>) {
    Object.freeze(this)
  }

  get id() {
    return this.props.notionPage.id
  }

  get url() {
    return this.props.notionPage.url
  }

  get createdAt() {
    return this.props.notionPage.created_time
  }

  get updatedAt() {
    return this.props.notionPage.last_edited_time
  }

  get isArchived() {
    return this.props.notionPage.archived
  }

  /**
   * テーブルのプロパティを取得
   */
  properties(): SchemaType<T> {
    return this.props.converter.fromNotion(this.props.schema, this.props.notionPage.properties)
  }

  /**
   * 元のNotionページデータを取得
   */
  raw(): PageObjectResponse {
    return this.props.notionPage
  }

  /**
   * ページの本文をマークダウン形式で取得
   */
  async body(): Promise<string> {
    const cachedBlocks = this.props.cache?.getBlocks(this.id)

    if (cachedBlocks) {
      return fromNotionBlocks(cachedBlocks)
    }

    const listBlockChildren = this.props.listBlockChildren ?? this.props.client.blocks.children.list

    const blocks = await enhance(listBlockChildren)({
      block_id: this.props.notionPage.id,
    })

    this.props.cache?.setBlocks(this.id, blocks)

    return fromNotionBlocks(blocks)
  }
}
