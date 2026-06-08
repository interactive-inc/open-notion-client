import type { NotionBlock, NotionPage } from "@/types"

type Options = {
  /**
   * エントリの生存時間（ミリ秒）。未指定または0以下なら無期限
   */
  ttlMs?: number
  /**
   * 保持する最大エントリ数（pages / blocks 各別）。
   * 超過した場合は最も古いものから捨てる（FIFO）
   */
  maxEntries?: number
  /**
   * 現在時刻を返すクロック関数（テスト用）
   */
  now?: () => number
}

type Entry<T> = {
  value: T
  expiresAt: number | null
}

export class NotionMemoryCache {
  private readonly pages = new Map<string, Entry<NotionPage>>()
  private readonly blocks = new Map<string, Entry<NotionBlock[]>>()
  private readonly ttlMs: number | null
  private readonly maxEntries: number | null
  private readonly now: () => number

  constructor(options: Options = {}) {
    this.ttlMs = options.ttlMs !== undefined && options.ttlMs > 0 ? options.ttlMs : null
    this.maxEntries =
      options.maxEntries !== undefined && options.maxEntries > 0 ? options.maxEntries : null
    this.now = options.now ?? (() => Date.now())
  }

  getPage(id: string): NotionPage | null {
    return this.get(this.pages, id)
  }

  setPage(id: string, page: NotionPage): void {
    this.set(this.pages, id, page)
  }

  deletePage(id: string): void {
    this.pages.delete(id)
  }

  getBlocks(id: string): NotionBlock[] | null {
    return this.get(this.blocks, id)
  }

  setBlocks(id: string, blocks: NotionBlock[]): void {
    this.set(this.blocks, id, blocks)
  }

  deleteBlocks(id: string): void {
    this.blocks.delete(id)
  }

  clear(): void {
    this.pages.clear()
    this.blocks.clear()
  }

  private get<T>(store: Map<string, Entry<T>>, id: string): T | null {
    const entry = store.get(id)
    if (entry === undefined) {
      return null
    }
    if (entry.expiresAt !== null && entry.expiresAt < this.now()) {
      store.delete(id)
      return null
    }
    return entry.value
  }

  private set<T>(store: Map<string, Entry<T>>, id: string, value: T): void {
    const expiresAt = this.ttlMs !== null ? this.now() + this.ttlMs : null
    // 既存キーの場合は順序を保つために一度削除してから追加する
    store.delete(id)
    store.set(id, { value: value, expiresAt: expiresAt })

    if (this.maxEntries !== null) {
      while (store.size > this.maxEntries) {
        const oldest = store.keys().next().value
        if (oldest === undefined) break
        store.delete(oldest)
      }
    }
  }
}
