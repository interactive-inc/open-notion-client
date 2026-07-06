import type {
  ListBlockChildrenParameters,
  ListBlockChildrenResponse,
} from "@notionhq/client/build/src/api-endpoints"
import type { NotionBlock } from "@/types"

type Client = (args: ListBlockChildrenParameters) => Promise<ListBlockChildrenResponse>

type Options = {
  /**
   * APIリクエストの同時実行数。デフォルト3 (Notion APIのレート制限平均値に合わせる)
   */
  concurrency?: number
}

/**
 * 指定ブロックの子孫を再帰的に取得する高階関数
 * Notion APIのページネーションを内部で消化し、全件を返す
 * 同時リクエスト数は再帰の深さによらず木全体でconcurrency以下に保たれる
 */
export function enhance(client: Client, options: Options = {}) {
  const concurrency = options.concurrency && options.concurrency > 0 ? options.concurrency : 3

  // 再帰全体で共有するセマフォ。スロットはAPI呼び出しの区間だけ保持し、
  // 親が子の完了を待つ間はスロットを解放するためデッドロックしない
  let activeRequestCount = 0

  const requestWaiters: Array<() => void> = []

  const acquireRequestSlot = (): Promise<void> => {
    if (activeRequestCount < concurrency) {
      activeRequestCount++
      return Promise.resolve()
    }
    return new Promise((resolve) => {
      requestWaiters.push(() => {
        activeRequestCount++
        resolve()
      })
    })
  }

  const releaseRequestSlot = (): void => {
    activeRequestCount--
    const nextWaiter = requestWaiters.shift()
    if (nextWaiter) {
      nextWaiter()
    }
  }

  const callClient = async (
    args: ListBlockChildrenParameters,
  ): Promise<ListBlockChildrenResponse> => {
    await acquireRequestSlot()
    try {
      return await client(args)
    } finally {
      releaseRequestSlot()
    }
  }

  const listAll = async (
    args: ListBlockChildrenParameters,
  ): Promise<ListBlockChildrenResponse["results"]> => {
    const collected: ListBlockChildrenResponse["results"] = []

    let cursor: string | null = null

    while (true) {
      const response = await callClient(cursor ? { ...args, start_cursor: cursor } : args)
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
        children: [] satisfies NotionBlock[],
      }
    })

    // 同時実行数はセマフォがAPI呼び出し単位で制御するためPromise.allで良い
    return await Promise.all(
      blocks.map(async (block) => {
        if (block.has_children === false) {
          return block
        }
        const childBlocks = await fn({ block_id: block.id })
        return { ...block, children: childBlocks }
      }),
    )
  }

  return fn
}
