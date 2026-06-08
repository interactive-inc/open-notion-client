import type {
  ListBlockChildrenParameters,
  ListBlockChildrenResponse,
} from "@notionhq/client/build/src/api-endpoints"
import type { NotionBlock } from "@/types"
import { withConcurrency } from "@/with-concurrency"

type Client = (args: ListBlockChildrenParameters) => Promise<ListBlockChildrenResponse>

type Options = {
  /**
   * 子ブロック取得時の同時実行数。デフォルト3 (Notion APIのレート制限平均値に合わせる)
   */
  concurrency?: number
}

/**
 * 指定ブロックの子孫を再帰的に取得する高階関数
 * Notion APIのページネーションを内部で消化し、全件を返す
 * 兄弟ブロックの子取得は同時実行数制限付きで並列化される
 */
export function enhance(client: Client, options: Options = {}) {
  const concurrency = options.concurrency && options.concurrency > 0 ? options.concurrency : 3

  const listAll = async (
    args: ListBlockChildrenParameters,
  ): Promise<ListBlockChildrenResponse["results"]> => {
    const collected: ListBlockChildrenResponse["results"] = []

    let cursor: string | null = null

    while (true) {
      const response = await client(cursor ? { ...args, start_cursor: cursor } : args)
      collected.push(...response.results)
      if (!response.has_more || response.next_cursor === null) {
        return collected
      }
      cursor = response.next_cursor
    }
  }

  const fn = async (args: ListBlockChildrenParameters): Promise<NotionBlock[]> => {
    const responses = await listAll(args)

    const blocks = responses.map((block) => {
      const hasType = "type" in block

      if (hasType === false) {
        const id = "id" in block ? block.id : "(unknown id)"
        throw new Error(`Block ${id} has no type field`)
      }

      return {
        ...block,
        children: [] as NotionBlock[],
      }
    })

    return await withConcurrency(blocks, concurrency, async (block) => {
      if (block.has_children === false) {
        return block
      }
      const childBlocks = await fn({ block_id: block.id })
      return { ...block, children: childBlocks }
    })
  }

  return fn
}
