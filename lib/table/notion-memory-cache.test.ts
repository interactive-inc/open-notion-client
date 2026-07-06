import { expect, test } from "bun:test"
import type { NotionBlock, NotionPage } from "@/types"
import { NotionMemoryCache } from "./notion-memory-cache"

const createMockPage = (id: string): NotionPage => {
  return {
    id: id,
    object: "page",
    created_time: "2024-01-01T00:00:00.000Z",
    last_edited_time: "2024-01-01T00:00:00.000Z",
    archived: false,
    properties: {},
    url: `https://notion.so/${id}`,
    parent: { type: "database_id", database_id: "test-db" },
  } as NotionPage
}

const createMockBlocks = (): NotionBlock[] => {
  return [
    {
      id: "block-1",
      type: "paragraph",
      object: "block",
      created_time: "2024-01-01T00:00:00.000Z",
      last_edited_time: "2024-01-01T00:00:00.000Z",
      has_children: false,
      archived: false,
      children: [],
      paragraph: { color: "blue", rich_text: [], icon: null },
      created_by: { object: "user", id: "user-1" },
      last_edited_by: { object: "user", id: "user-1" },
      in_trash: false,
      parent: { type: "page_id", page_id: "page-1" },
    },
  ] as NotionBlock[]
}

test("ページキャッシュの基本操作", () => {
  const cache = new NotionMemoryCache()
  const page1 = createMockPage("page-1")
  const page2 = createMockPage("page-2")

  cache.setPage("page-1", page1)
  const result = cache.getPage("page-1")
  expect(result).toEqual(page1)

  cache.setPage("page-2", page2)
  expect(cache.getPage("page-2")).toEqual(page2)

  const notFound = cache.getPage("page-3")
  expect(notFound).toBeNull()
})

test("ブロックキャッシュの基本操作", () => {
  const cache = new NotionMemoryCache()
  const blocks1 = createMockBlocks()
  const blocks2 = createMockBlocks()

  cache.setBlocks("page-1", blocks1)
  const result = cache.getBlocks("page-1")
  expect(result).toEqual(blocks1)

  cache.setBlocks("page-2", blocks2)
  expect(cache.getBlocks("page-2")).toEqual(blocks2)

  const notFound = cache.getBlocks("page-3")
  expect(notFound).toBeNull()
})

test("個別削除", () => {
  const cache = new NotionMemoryCache()
  const page = createMockPage("page-1")
  const blocks = createMockBlocks()

  cache.setPage("page-1", page)
  cache.setBlocks("page-1", blocks)

  cache.deletePage("page-1")
  expect(cache.getPage("page-1")).toBeNull()
  expect(cache.getBlocks("page-1")).toEqual(blocks)

  cache.deleteBlocks("page-1")
  expect(cache.getBlocks("page-1")).toBeNull()
})

test("全削除", () => {
  const cache = new NotionMemoryCache()
  const page = createMockPage("page-1")
  const blocks = createMockBlocks()

  cache.setPage("page-1", page)
  cache.setBlocks("page-1", blocks)

  cache.clear()
  expect(cache.getPage("page-1")).toBeNull()
  expect(cache.getBlocks("page-1")).toBeNull()
})

test("TTLが切れたエントリはnullを返す", () => {
  const clock = { now: 1000 }
  const cache = new NotionMemoryCache({
    ttlMs: 100,
    now: () => clock.now,
  })

  const page = createMockPage("page-1")
  cache.setPage("page-1", page)

  expect(cache.getPage("page-1")).toEqual(page)

  clock.now = 1099
  expect(cache.getPage("page-1")).toEqual(page)

  clock.now = 1101
  expect(cache.getPage("page-1")).toBeNull()
})

test("maxEntriesを超えると古いものから消える（pages）", () => {
  const cache = new NotionMemoryCache({ maxEntries: 2 })

  cache.setPage("a", createMockPage("a"))
  cache.setPage("b", createMockPage("b"))
  cache.setPage("c", createMockPage("c"))

  expect(cache.getPage("a")).toBeNull()
  expect(cache.getPage("b")?.id).toBe("b")
  expect(cache.getPage("c")?.id).toBe("c")
})

test("同じキーで再登録すると最新扱いになりFIFOから外れる", () => {
  const cache = new NotionMemoryCache({ maxEntries: 2 })

  cache.setPage("a", createMockPage("a"))
  cache.setPage("b", createMockPage("b"))
  cache.setPage("a", createMockPage("a-new"))
  cache.setPage("c", createMockPage("c"))

  expect(cache.getPage("a")?.id).toBe("a-new")
  expect(cache.getPage("b")).toBeNull()
  expect(cache.getPage("c")?.id).toBe("c")
})

test("同じキーで上書き", () => {
  const cache = new NotionMemoryCache()
  const page1 = createMockPage("page-1")
  const page2 = createMockPage("page-2")

  cache.setPage("key", page1)
  expect(cache.getPage("key")).toEqual(page1)

  cache.setPage("key", page2)
  expect(cache.getPage("key")).toEqual(page2)

  const blocks1 = createMockBlocks()
  const blocks2 = createMockBlocks()

  cache.setBlocks("key", blocks1)
  expect(cache.getBlocks("key")).toEqual(blocks1)

  cache.setBlocks("key", blocks2)
  expect(cache.getBlocks("key")).toEqual(blocks2)
})
