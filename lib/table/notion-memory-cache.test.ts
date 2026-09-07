import { notionPage } from "@/testing/notion-page"
import { notionParagraph } from "@/testing/notion-paragraph"
import { expect, test } from "vite-plus/test"
import { NotionMemoryCache } from "./notion-memory-cache"

test("ページキャッシュの基本操作", () => {
  const cache = new NotionMemoryCache()
  const page1 = notionPage("page-1")
  const page2 = notionPage("page-2")

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
  const blocks1 = [notionParagraph()]
  const blocks2 = [notionParagraph()]

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
  const page = notionPage("page-1")
  const blocks = [notionParagraph()]

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
  const page = notionPage("page-1")
  const blocks = [notionParagraph()]

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

  const page = notionPage("page-1")
  cache.setPage("page-1", page)

  expect(cache.getPage("page-1")).toEqual(page)

  clock.now = 1099
  expect(cache.getPage("page-1")).toEqual(page)

  clock.now = 1101
  expect(cache.getPage("page-1")).toBeNull()
})

test("TTL期限ちょうどでページと本文を失効させる", () => {
  const clock = { now: 1000 }
  const cache = new NotionMemoryCache({ ttlMs: 100, now: () => clock.now })
  cache.setPage("page-1", notionPage("page-1"))
  cache.setBlocks("page-1", [notionParagraph()])
  clock.now = 1100
  expect(cache.getPage("page-1")).toBeNull()
  expect(cache.getBlocks("page-1")).toBeNull()
})

test("maxEntriesを超えると古いものから消える（pages）", () => {
  const cache = new NotionMemoryCache({ maxEntries: 2 })

  cache.setPage("a", notionPage("a"))
  cache.setPage("b", notionPage("b"))
  cache.setPage("c", notionPage("c"))

  expect(cache.getPage("a")).toBeNull()
  expect(cache.getPage("b")?.id).toBe("b")
  expect(cache.getPage("c")?.id).toBe("c")
})

test("同じキーで再登録すると最新扱いになりFIFOから外れる", () => {
  const cache = new NotionMemoryCache({ maxEntries: 2 })

  cache.setPage("a", notionPage("a"))
  cache.setPage("b", notionPage("b"))
  cache.setPage("a", notionPage("a-new"))
  cache.setPage("c", notionPage("c"))

  expect(cache.getPage("a")?.id).toBe("a-new")
  expect(cache.getPage("b")).toBeNull()
  expect(cache.getPage("c")?.id).toBe("c")
})

test("同じキーで上書き", () => {
  const cache = new NotionMemoryCache()
  const page1 = notionPage("page-1")
  const page2 = notionPage("page-2")

  cache.setPage("key", page1)
  expect(cache.getPage("key")).toEqual(page1)

  cache.setPage("key", page2)
  expect(cache.getPage("key")).toEqual(page2)

  const blocks1 = [notionParagraph()]
  const blocks2 = [notionParagraph()]

  cache.setBlocks("key", blocks1)
  expect(cache.getBlocks("key")).toEqual(blocks1)

  cache.setBlocks("key", blocks2)
  expect(cache.getBlocks("key")).toEqual(blocks2)
})
