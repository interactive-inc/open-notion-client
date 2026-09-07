import { Client } from "@notionhq/client"
import type { SupportedFetch } from "@notionhq/client/build/src/fetch-types"
import { expect, onTestFinished, vi } from "vite-plus/test"

type Exchange = {
  method: string
  path: string
  body?: unknown
  response: unknown
  status?: number
  headers?: Record<string, string>
  waitFor?: Promise<unknown>
}

/** 実SDKのHTTP境界だけを置き換え、未定義の通信と未消化の応答をテスト失敗にする。 */
export class NotionHttpMock {
  private readonly pending: Exchange[] = []
  private readonly unexpected: string[] = []

  readonly fetch = vi.fn<SupportedFetch>(async (url, init) => {
    const target = new URL(url)
    const request = `${init?.method?.toUpperCase()} ${target.pathname}${target.search}`
    const exchange = this.pending.shift()

    try {
      expect(target.origin).toBe("https://api.notion.com")
      expect(exchange, `Unexpected request: ${request}`).toBeDefined()
      if (!exchange) throw new Error(`Unexpected request: ${request}`)
      expect(request).toBe(`${exchange.method} /v1${exchange.path}`)
      expect(new Headers(init?.headers).get("authorization")).toBe("Bearer test-token")
      if (Object.hasOwn(exchange, "body")) {
        const body: unknown = typeof init?.body === "string" ? JSON.parse(init.body) : undefined
        expect(body).toEqual(exchange.body)
      }
      if (exchange.waitFor) await exchange.waitFor
      return new Response(JSON.stringify(exchange.response), {
        status: exchange.status ?? 200,
        headers: { "content-type": "application/json", ...exchange.headers },
      })
    } catch (error) {
      this.unexpected.push(request)
      throw error
    }
  })

  readonly client = new Client({
    auth: "test-token",
    fetch: this.fetch,
    retry: false,
    logger: () => {},
  })

  constructor() {
    onTestFinished(() => {
      expect(this.unexpected, "Unexpected HTTP requests").toEqual([])
      expect(this.pending, "Unused HTTP responses").toEqual([])
    })
  }

  enqueue(...exchanges: Exchange[]): void {
    this.pending.push(...exchanges)
  }
}
