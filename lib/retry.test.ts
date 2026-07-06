import { expect, spyOn, test } from "bun:test"
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

test("429のRetry-Afterヘッダ(Record形式)を優先して待つ", async () => {
  let attempts = 0
  const startedAt = Date.now()

  const result = await withRetry(
    () => {
      attempts++
      if (attempts === 1) {
        const error = new Error("rate limited") as Error & {
          status: number
          headers: Record<string, string>
        }
        error.status = 429
        error.headers = { "Retry-After": "0" }
        throw error
      }
      return Promise.resolve("ok")
    },
    // baseDelayMsが使われていたら5秒待つはずなので、即リトライ=ヘッダ優先の証明になる
    { maxRetries: 2, baseDelayMs: 5000 },
  )

  expect(result).toBe("ok")
  expect(attempts).toBe(2)
  expect(Date.now() - startedAt).toBeLessThan(1000)
})

test("429のRetry-Afterヘッダ(Headersインスタンス)を優先して待つ", async () => {
  let attempts = 0
  const startedAt = Date.now()

  const result = await withRetry(
    () => {
      attempts++
      if (attempts === 1) {
        const error = new Error("rate limited") as Error & {
          status: number
          headers: Headers
        }
        error.status = 429
        error.headers = new Headers({ "retry-after": "0" })
        throw error
      }
      return Promise.resolve("ok")
    },
    { maxRetries: 2, baseDelayMs: 5000 },
  )

  expect(result).toBe("ok")
  expect(attempts).toBe(2)
  expect(Date.now() - startedAt).toBeLessThan(1000)
})

test("Retry-Afterが不正な値ならバックオフにフォールバックする", async () => {
  let attempts = 0

  const result = await withRetry(
    () => {
      attempts++
      if (attempts === 1) {
        const error = new Error("rate limited") as Error & {
          status: number
          headers: Record<string, string>
        }
        error.status = 429
        error.headers = { "Retry-After": "not-a-number" }
        throw error
      }
      return Promise.resolve("ok")
    },
    { maxRetries: 2, baseDelayMs: 1 },
  )

  expect(result).toBe("ok")
  expect(attempts).toBe(2)
})

test("バックオフにフルジッターが適用される", async () => {
  const randomSpy = spyOn(Math, "random").mockReturnValue(0)

  try {
    let attempts = 0
    const startedAt = Date.now()

    const result = await withRetry(
      () => {
        attempts++
        if (attempts < 3) {
          const error = new Error("server error") as Error & { status: number }
          error.status = 500
          throw error
        }
        return Promise.resolve("ok")
      },
      // Math.random()=0でdelay=0になる=乱数が掛けられている証明。固定値なら計10.5秒待つ
      { maxRetries: 3, baseDelayMs: 3500 },
    )

    expect(result).toBe("ok")
    expect(attempts).toBe(3)
    expect(randomSpy).toHaveBeenCalled()
    expect(Date.now() - startedAt).toBeLessThan(1000)
  } finally {
    randomSpy.mockRestore()
  }
})

test("maxRetriesが負でもfnは1回実行される", async () => {
  let attempts = 0

  const result = await withRetry(
    () => {
      attempts++
      return Promise.resolve("ok")
    },
    { maxRetries: -1, baseDelayMs: 10 },
  )

  expect(result).toBe("ok")
  expect(attempts).toBe(1)
})

test("maxRetriesが負で失敗した場合は元のエラーをthrow", async () => {
  let attempts = 0

  const promise = withRetry(
    () => {
      attempts++
      const error = new Error("server error") as Error & { status: number }
      error.status = 500
      throw error
    },
    { maxRetries: -5, baseDelayMs: 10 },
  )

  await expect(promise).rejects.toThrow("server error")
  expect(attempts).toBe(1)
})

test("maxRetries: Infinityは無限リトライとして扱われる", async () => {
  let attempts = 0

  const result = await withRetry(
    () => {
      attempts++
      if (attempts < 5) {
        const error = new Error("server error") as Error & { status: number }
        error.status = 503
        throw error
      }
      return Promise.resolve("ok")
    },
    { maxRetries: Number.POSITIVE_INFINITY, baseDelayMs: 1 },
  )

  expect(result).toBe("ok")
  expect(attempts).toBe(5)
})
