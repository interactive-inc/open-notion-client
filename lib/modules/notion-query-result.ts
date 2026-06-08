import type { NotionPropertySchema } from "@/types"
import type { NotionPageReference } from "./notion-page-reference"

type Props<S extends NotionPropertySchema> = {
  readonly pageReferences: NotionPageReference<S>[]
  readonly cursor: string | null
  readonly hasMore: boolean
}

/**
 * データベースクエリの結果を表すクラス
 */
export class NotionQueryResult<S extends NotionPropertySchema> {
  constructor(private readonly props: Props<S>) {
    Object.freeze(this)
  }

  /**
   * 取得したページ参照の配列
   */
  references(): NotionPageReference<S>[] {
    return this.props.pageReferences
  }

  /**
   * 次のページを取得するためのカーソル
   */
  cursor(): string | null {
    return this.props.cursor
  }

  /**
   * さらにページがあるかどうか
   */
  hasMore(): boolean {
    return this.props.hasMore
  }

  /**
   * 取得したページ数
   */
  get length(): number {
    return this.props.pageReferences.length
  }
}
