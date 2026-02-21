import { expect, test } from "bun:test"
import type { Client } from "@notionhq/client"
import type { NotionPropertySchema } from "@/types"
import { NotionMarkdown } from "./notion-markdown"
import { NotionTable } from "./notion-table"

// 簡易的な統合テスト（実際のNotionクライアントの動作に近いモック）
test("基本的な統合テスト", async () => {
  // 実際のNotionクライアントのようなレスポンスを返すモック
  const mockNotion = {
    dataSources: {
      query: async () => ({
        results: [
          {
            id: "page-1",
            created_time: "2024-01-01T00:00:00Z",
            last_edited_time: "2024-01-01T00:00:00Z",
            archived: false,
            properties: {
              title: { type: "title", title: [{ plain_text: "タスク1" }] },
              status: { type: "select", select: { name: "todo" } },
              priority: { type: "number", number: 3 },
            },
          },
        ],
        next_cursor: null,
        has_more: false,
      }),
    },
    pages: {
      create: async (params: {
        parent: { database_id: string }
        properties: Record<string, unknown>
        children?: unknown[]
      }) => ({
        id: "page-new",
        created_time: "2024-01-01T00:00:00Z",
        last_edited_time: "2024-01-01T00:00:00Z",
        archived: false,
        properties: params.properties,
      }),
      retrieve: async () => ({
        id: "page-new",
        created_time: "2024-01-01T00:00:00Z",
        last_edited_time: "2024-01-01T00:00:00Z",
        archived: false,
        properties: {
          title: { type: "title", title: [{ plain_text: "新規タスク" }] },
          status: { type: "select", select: { name: "todo" } },
        },
      }),
      update: async () => ({}),
    },
    blocks: {
      children: {
        list: async () => ({ results: [] }),
        append: async () => ({}),
      },
      delete: async () => ({}),
    },
  } as unknown as Client

  const schema: NotionPropertySchema = {
    title: { type: "title" },
    status: { type: "select", options: ["todo", "in_progress", "done"] },
    priority: { type: "number" },
  }

  const table = new NotionTable({
    client: mockNotion,
    dataSourceId: "test-db",
    properties: schema,
  })

  // findManyのテスト
  const result = await table.findMany()
  expect(result.records).toHaveLength(1)
  expect(result.hasMore).toBe(false)
  expect(result.nextCursor).toBeNull()
  expect(result.records[0]?.properties().title).toBe("タスク1")
  expect(result.records[0]?.properties().status).toBe("todo")
  expect(result.records[0]?.properties().priority).toBe(3)

  // createのテスト
  const created = await table.create({
    properties: {
      title: "新規タスク",
      status: "todo",
    },
  })
  const createdProps = created.properties()
  expect(createdProps.title).toBe("新規タスク")
  expect(createdProps.status).toBe("todo")
})

test("高度なクエリのテスト", async () => {
  const mockNotion = {
    dataSources: {
      query: async (params: {
        database_id: string
        filter?: Record<string, unknown>
        sorts?: Array<Record<string, unknown>>
        start_cursor?: string
        page_size?: number
      }) => {
        // フィルターパラメータが正しく渡されているかチェック
        expect(params.filter).toBeDefined()
        expect(params.filter?.or).toBeDefined()

        return {
          results: [],
          next_cursor: null,
          has_more: false,
        }
      },
    },
    pages: {
      create: async () => ({}),
      retrieve: async () => ({}),
      update: async () => ({}),
    },
    blocks: {
      children: {
        list: async () => ({ results: [] }),
        append: async () => ({}),
      },
      delete: async () => ({}),
    },
  } as unknown as Client

  const schema = {
    status: { type: "select", options: ["todo", "done"] },
    priority: { type: "number" },
  } as const

  const table = new NotionTable({
    client: mockNotion,
    dataSourceId: "test-db",
    properties: schema,
  })

  // 高度なクエリ
  const result = await table.findMany({
    where: {
      or: [{ status: "todo" }, { priority: { greater_than_or_equal_to: 5 } }],
    },
  })
  expect(result.records).toHaveLength(0)
  expect(result.hasMore).toBe(false)
  expect(result.nextCursor).toBeNull()
})

test("findMany が limit オプションを正しく処理する", async () => {
  let capturedPageSize: number | undefined

  const mockNotion = {
    dataSources: {
      query: async (params: { data_source_id: string; page_size?: number }) => {
        capturedPageSize = params.page_size
        return {
          results: [
            {
              id: "page-1",
              created_time: "2024-01-01T00:00:00Z",
              last_edited_time: "2024-01-01T00:00:00Z",
              archived: false,
              properties: {
                title: { type: "title", title: [{ plain_text: "タスク1" }] },
              },
            },
          ],
          next_cursor: null,
          has_more: false,
        }
      },
    },
    pages: {
      create: async () => ({}),
      retrieve: async () => ({}),
      update: async () => ({}),
    },
    blocks: {
      children: {
        list: async () => ({ results: [] }),
        append: async () => ({}),
      },
      delete: async () => ({}),
    },
  } as unknown as Client

  const schema: NotionPropertySchema = {
    title: { type: "title" },
  }

  const table = new NotionTable({
    client: mockNotion,
    dataSourceId: "test-db",
    properties: schema,
  })

  await table.findMany({ limit: 5 })
  expect(capturedPageSize).toBe(5)
})

test("findMany が cursor オプションを正しく処理する", async () => {
  let capturedStartCursor: string | undefined

  const mockNotion = {
    dataSources: {
      query: async (params: {
        data_source_id: string
        start_cursor?: string
      }) => {
        capturedStartCursor = params.start_cursor
        return {
          results: [
            {
              id: "page-2",
              created_time: "2024-01-01T00:00:00Z",
              last_edited_time: "2024-01-01T00:00:00Z",
              archived: false,
              properties: {
                title: { type: "title", title: [{ plain_text: "タスク2" }] },
              },
            },
          ],
          next_cursor: null,
          has_more: false,
        }
      },
    },
    pages: {
      create: async () => ({}),
      retrieve: async () => ({}),
      update: async () => ({}),
    },
    blocks: {
      children: {
        list: async () => ({ results: [] }),
        append: async () => ({}),
      },
      delete: async () => ({}),
    },
  } as unknown as Client

  const schema: NotionPropertySchema = {
    title: { type: "title" },
  }

  const table = new NotionTable({
    client: mockNotion,
    dataSourceId: "test-db",
    properties: schema,
  })

  await table.findMany({ cursor: "cursor-abc-123" })
  expect(capturedStartCursor).toBe("cursor-abc-123")
})

test("findMany がページネーション情報を返す", async () => {
  const mockNotion = {
    dataSources: {
      query: async () => ({
        results: [
          {
            id: "page-1",
            created_time: "2024-01-01T00:00:00Z",
            last_edited_time: "2024-01-01T00:00:00Z",
            archived: false,
            properties: {
              title: { type: "title", title: [{ plain_text: "タスク1" }] },
            },
          },
        ],
        next_cursor: "cursor-next-page",
        has_more: true,
      }),
    },
    pages: {
      create: async () => ({}),
      retrieve: async () => ({}),
      update: async () => ({}),
    },
    blocks: {
      children: {
        list: async () => ({ results: [] }),
        append: async () => ({}),
      },
      delete: async () => ({}),
    },
  } as unknown as Client

  const schema: NotionPropertySchema = {
    title: { type: "title" },
  }

  const table = new NotionTable({
    client: mockNotion,
    dataSourceId: "test-db",
    properties: schema,
  })

  const result = await table.findMany({ limit: 1 })
  expect(result.records).toHaveLength(1)
  expect(result.hasMore).toBe(false)
  expect(result.nextCursor).toBe("cursor-next-page")
})

test("findMany でページネーションを跨いでレコードを取得する", async () => {
  let callCount = 0

  const mockNotion = {
    dataSources: {
      query: async (params: {
        data_source_id: string
        start_cursor?: string
        page_size?: number
      }) => {
        callCount++

        if (callCount === 1) {
          expect(params.start_cursor).toBeUndefined()
          return {
            results: [
              {
                id: "page-1",
                created_time: "2024-01-01T00:00:00Z",
                last_edited_time: "2024-01-01T00:00:00Z",
                archived: false,
                properties: {
                  title: { type: "title", title: [{ plain_text: "タスク1" }] },
                },
              },
            ],
            next_cursor: "cursor-page-2",
            has_more: true,
          }
        }

        expect(params.start_cursor).toBe("cursor-page-2")
        return {
          results: [
            {
              id: "page-2",
              created_time: "2024-01-01T00:00:00Z",
              last_edited_time: "2024-01-01T00:00:00Z",
              archived: false,
              properties: {
                title: { type: "title", title: [{ plain_text: "タスク2" }] },
              },
            },
          ],
          next_cursor: null,
          has_more: false,
        }
      },
    },
    pages: {
      create: async () => ({}),
      retrieve: async () => ({}),
      update: async () => ({}),
    },
    blocks: {
      children: {
        list: async () => ({ results: [] }),
        append: async () => ({}),
      },
      delete: async () => ({}),
    },
  } as unknown as Client

  const schema: NotionPropertySchema = {
    title: { type: "title" },
  }

  const table = new NotionTable({
    client: mockNotion,
    dataSourceId: "test-db",
    properties: schema,
  })

  const result = await table.findMany({ limit: 200 })
  expect(result.records).toHaveLength(2)
  expect(callCount).toBe(2)
})

test("findMany の cursor を使ったページ送り", async () => {
  let _callCount = 0

  const mockNotion = {
    dataSources: {
      query: async (params: {
        data_source_id: string
        start_cursor?: string
      }) => {
        _callCount++

        if (params.start_cursor === "cursor-page-2") {
          return {
            results: [
              {
                id: "page-2",
                created_time: "2024-01-01T00:00:00Z",
                last_edited_time: "2024-01-01T00:00:00Z",
                archived: false,
                properties: {
                  title: { type: "title", title: [{ plain_text: "タスク2" }] },
                },
              },
            ],
            next_cursor: null,
            has_more: false,
          }
        }

        return {
          results: [
            {
              id: "page-1",
              created_time: "2024-01-01T00:00:00Z",
              last_edited_time: "2024-01-01T00:00:00Z",
              archived: false,
              properties: {
                title: { type: "title", title: [{ plain_text: "タスク1" }] },
              },
            },
          ],
          next_cursor: "cursor-page-2",
          has_more: true,
        }
      },
    },
    pages: {
      create: async () => ({}),
      retrieve: async () => ({}),
      update: async () => ({}),
    },
    blocks: {
      children: {
        list: async () => ({ results: [] }),
        append: async () => ({}),
      },
      delete: async () => ({}),
    },
  } as unknown as Client

  const schema: NotionPropertySchema = {
    title: { type: "title" },
  }

  const table = new NotionTable({
    client: mockNotion,
    dataSourceId: "test-db",
    properties: schema,
  })

  // 1ページ目
  const page1 = await table.findMany({ limit: 1 })
  expect(page1.records).toHaveLength(1)
  expect(page1.records[0]?.properties().title).toBe("タスク1")
  expect(page1.nextCursor).toBe("cursor-page-2")

  // 2ページ目（cursorを使用）
  const cursor = page1.nextCursor ?? undefined
  const page2 = await table.findMany({ limit: 1, cursor })
  expect(page2.records).toHaveLength(1)
  expect(page2.records[0]?.properties().title).toBe("タスク2")
  expect(page2.hasMore).toBe(false)
  expect(page2.nextCursor).toBeNull()
})

test("NotionMarkdownとの統合", async () => {
  let appendedBlocks: unknown[] = []

  const mockNotion = {
    dataSources: {
      query: async () => ({ results: [], next_cursor: null, has_more: false }),
    },
    pages: {
      create: async (params: {
        parent: { database_id: string }
        properties: Record<string, unknown>
        children?: unknown[]
      }) => {
        if (params.children) {
          appendedBlocks = params.children
        }
        return {
          id: "page-enhanced",
          created_time: "2024-01-01T00:00:00Z",
          last_edited_time: "2024-01-01T00:00:00Z",
          archived: false,
          properties: params.properties,
        }
      },
      retrieve: async () => ({
        id: "page-enhanced",
        created_time: "2024-01-01T00:00:00Z",
        last_edited_time: "2024-01-01T00:00:00Z",
        archived: false,
        properties: {
          title: { type: "title", title: [{ plain_text: "テストページ" }] },
        },
      }),
      update: async () => ({}),
    },
    blocks: {
      children: {
        list: async () => ({ results: [] }),
        append: async (params: { block_id: string; children: unknown[] }) => {
          appendedBlocks = params.children
          return {}
        },
      },
      delete: async () => ({}),
    },
  } as unknown as Client

  const schema: NotionPropertySchema = {
    title: { type: "title" },
  }

  // H1をH2に変換するエンハンサーを設定
  const enhancer = new NotionMarkdown({
    heading_1: "heading_2",
    heading_2: "heading_3",
  })

  const table = new NotionTable({
    client: mockNotion,
    dataSourceId: "test-db",
    properties: schema,
    markdown: enhancer,
  })

  // # Title -> heading_1 -> heading_2 に変換される
  await table.create({
    properties: {
      title: "テストページ",
    },
    body: "# Title\n\nParagraph\n\n## Subtitle",
  })

  // 作成されたブロックを確認
  expect(appendedBlocks).toHaveLength(3)
  expect((appendedBlocks[0] as { type: string }).type).toBe("heading_2") // h1 -> h2
  expect((appendedBlocks[1] as { type: string }).type).toBe("paragraph")
  expect((appendedBlocks[2] as { type: string }).type).toBe("heading_3") // h2 -> h3
})

test("エンハンサーなしのデフォルト動作", async () => {
  let appendedBlocks: unknown[] = []

  const mockNotion = {
    dataSources: {
      query: async () => ({ results: [], next_cursor: null, has_more: false }),
    },
    pages: {
      create: async (params: {
        parent: { database_id: string }
        properties: Record<string, unknown>
        children?: unknown[]
      }) => {
        if (params.children) {
          appendedBlocks = params.children
        }
        return {
          id: "page-default",
          created_time: "2024-01-01T00:00:00Z",
          last_edited_time: "2024-01-01T00:00:00Z",
          archived: false,
          properties: params.properties,
        }
      },
      retrieve: async () => ({
        id: "page-default",
        created_time: "2024-01-01T00:00:00Z",
        last_edited_time: "2024-01-01T00:00:00Z",
        archived: false,
        properties: {
          title: { type: "title", title: [{ plain_text: "テストページ" }] },
        },
      }),
      update: async () => ({}),
    },
    blocks: {
      children: {
        list: async () => ({ results: [] }),
        append: async (params: { block_id: string; children: unknown[] }) => {
          appendedBlocks = params.children
          return {}
        },
      },
      delete: async () => ({}),
    },
  } as unknown as Client

  const schema: NotionPropertySchema = {
    title: { type: "title" },
  }

  const table = new NotionTable({
    client: mockNotion,
    dataSourceId: "test-db",
    properties: schema,
    // enhancerを指定しない
  })

  await table.create({
    properties: {
      title: "テストページ",
    },
    body: "# Title",
  })

  // デフォルトではheading_1のまま
  expect(appendedBlocks).toHaveLength(1)
  expect((appendedBlocks[0] as { type: string }).type).toBe("heading_1")
})
