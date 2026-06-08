import { expect, test } from "bun:test"
import { withRetry } from "./retry"

test("成功時はそのまま値を返す", async () => {
  const result = await withRetry(() => Promise.resolve(42), {
    maxRetries: 3,
    baseDelayMs: 10,
  })

  expect(result).toBe(42)
})

test("リトライ可能なエラーはリトライする", async () => {
  let attempts = 0

  const result = await withRetry(
    () => {
      attempts++
      if (attempts < 3) {
        const error = new Error("rate limited") as Error & { status: number }
        error.status = 429
        throw error
      }
      return Promise.resolve("ok")
    },
    { maxRetries: 3, baseDelayMs: 10 },
  )

  expect(result).toBe("ok")
  expect(attempts).toBe(3)
})

test("リトライ不可能なエラーは即座にthrow", async () => {
  const promise = withRetry(
    () => {
      throw new Error("auth failed")
    },
    { maxRetries: 3, baseDelayMs: 10 },
  )

  expect(promise).rejects.toThrow("auth failed")
})

test("maxRetries回リトライしても失敗したらthrow", async () => {
  const promise = withRetry(
    () => {
      const error = new Error("server error") as Error & { status: number }
      error.status = 500
      throw error
    },
    { maxRetries: 2, baseDelayMs: 10 },
  )

  expect(promise).rejects.toThrow("server error")
})

test("rate_limitedコードもリトライ対象", async () => {
  let attempts = 0

  const result = await withRetry(
    () => {
      attempts++
      if (attempts === 1) {
        const error = new Error("rate limited") as Error & { code: string }
        error.code = "rate_limited"
        throw error
      }
      return Promise.resolve("ok")
    },
    { maxRetries: 2, baseDelayMs: 10 },
  )

  expect(result).toBe("ok")
  expect(attempts).toBe(2)
})

test("カスタムisRetryableを使える", async () => {
  let attempts = 0

  const result = await withRetry(
    () => {
      attempts++
      if (attempts === 1) {
        throw new Error("custom retriable")
      }
      return Promise.resolve("ok")
    },
    {
      maxRetries: 2,
      baseDelayMs: 10,
      isRetryable: (e) => e instanceof Error && e.message === "custom retriable",
    },
  )

  expect(result).toBe("ok")
  expect(attempts).toBe(2)
})
