import { afterEach, beforeEach, expect, test, vi } from "vite-plus/test"
import { withRetry } from "@/retry"

beforeEach(() => {
  vi.useFakeTimers()
  vi.spyOn(Math, "random").mockReturnValue(0.5)
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

test("成功時は待機せず値を返す", async () => {
  const attempt = vi.fn(async () => 42)
  expect(await withRetry(attempt, { maxRetries: 3, baseDelayMs: 100 })).toBe(42)
  expect(attempt).toHaveBeenCalledTimes(1)
  expect(vi.getTimerCount()).toBe(0)
})

test.each([429, 500, 502, 503, 504, 529])(
  "HTTP %s は指数バックオフとジッターで再試行する",
  async (status) => {
    const attempt = vi
      .fn()
      .mockRejectedValueOnce({ status })
      .mockRejectedValueOnce({ status })
      .mockResolvedValue("ok")
    const pending = withRetry(attempt, { maxRetries: 2, baseDelayMs: 100 })
    await vi.advanceTimersByTimeAsync(49)
    expect(attempt).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(1)
    expect(attempt).toHaveBeenCalledTimes(2)
    await vi.advanceTimersByTimeAsync(99)
    expect(attempt).toHaveBeenCalledTimes(2)
    await vi.advanceTimersByTimeAsync(1)
    expect(await pending).toBe("ok")
    expect(attempt).toHaveBeenCalledTimes(3)
  },
)

test.each([400, 401, 403, 404, 600])("HTTP %s を再試行せず元の値をthrowする", async (status) => {
  const error = { status }
  const attempt = vi.fn().mockRejectedValue(error)
  await expect(withRetry(attempt, { maxRetries: 3, baseDelayMs: 100 })).rejects.toBe(error)
  expect(attempt).toHaveBeenCalledTimes(1)
  expect(vi.getTimerCount()).toBe(0)
})

test("再試行上限に到達したら最後のエラーをそのまま返す", async () => {
  const lastError = { status: 503, message: "final" }
  const attempt = vi.fn().mockRejectedValueOnce({ status: 500 }).mockRejectedValue(lastError)
  const assertion = expect(withRetry(attempt, { maxRetries: 2, baseDelayMs: 100 })).rejects.toBe(
    lastError,
  )
  await vi.runAllTimersAsync()
  await assertion
  expect(attempt).toHaveBeenCalledTimes(3)
})

test.each([null, undefined, "error", new Error("auth failed")])(
  "非HTTPエラー %s の同一性を保つ",
  async (error) => {
    await expect(
      withRetry(
        async () => {
          throw error
        },
        { maxRetries: 3, baseDelayMs: 100 },
      ),
    ).rejects.toBe(error)
  },
)

test("rate_limitedコードだけでも再試行する", async () => {
  const attempt = vi.fn().mockRejectedValueOnce({ code: "rate_limited" }).mockResolvedValue("ok")
  const pending = withRetry(attempt, { maxRetries: 1, baseDelayMs: 100 })
  await vi.runAllTimersAsync()
  expect(await pending).toBe("ok")
})

test("カスタムisRetryableを使える", async () => {
  const error = new Error("custom")
  const attempt = vi.fn().mockRejectedValueOnce(error).mockResolvedValue("ok")
  const pending = withRetry(attempt, {
    maxRetries: 1,
    baseDelayMs: 100,
    isRetryable: (value) => value === error,
  })
  await vi.runAllTimersAsync()
  expect(await pending).toBe("ok")
})

test.each([{ "Retry-After": "2" }, new Headers({ "retry-after": "2" })])(
  "Retry-Afterはバックオフより優先する: %s",
  async (headers) => {
    const attempt = vi.fn().mockRejectedValueOnce({ status: 429, headers }).mockResolvedValue("ok")
    const pending = withRetry(attempt, { maxRetries: 1, baseDelayMs: 10 })
    await vi.advanceTimersByTimeAsync(1999)
    expect(attempt).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(1)
    expect(await pending).toBe("ok")
  },
)

test.each(["", " ", "bad", "-1", "Infinity"])(
  "不正なRetry-After %j はバックオフに戻す",
  async (value) => {
    const attempt = vi
      .fn()
      .mockRejectedValueOnce({ status: 429, headers: { "retry-after": value } })
      .mockResolvedValue("ok")
    const pending = withRetry(attempt, { maxRetries: 1, baseDelayMs: 100 })
    await vi.advanceTimersByTimeAsync(49)
    expect(attempt).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(1)
    expect(await pending).toBe("ok")
  },
)

test("Retry-Afterの異常に大きな値は60秒を上限にする", async () => {
  const attempt = vi
    .fn()
    .mockRejectedValueOnce({ status: 429, headers: { "Retry-After": "999999999" } })
    .mockResolvedValue("ok")
  const pending = withRetry(attempt, { maxRetries: 1, baseDelayMs: 100 })
  await vi.advanceTimersByTimeAsync(59999)
  expect(attempt).toHaveBeenCalledTimes(1)
  await vi.advanceTimersByTimeAsync(1)
  expect(await pending).toBe("ok")
})

test("巨大なバックオフ値がタイマーのオーバーフローで即時再試行にならない", async () => {
  const attempt = vi.fn().mockRejectedValueOnce({ status: 503 }).mockResolvedValue("ok")
  const pending = withRetry(attempt, { maxRetries: 1, baseDelayMs: Number.MAX_VALUE })
  await vi.advanceTimersByTimeAsync(29999)
  expect(attempt).toHaveBeenCalledTimes(1)
  await vi.advanceTimersByTimeAsync(1)
  expect(await pending).toBe("ok")
})

test.each([-5, -1, NaN, -Infinity, 0.5])(
  "maxRetries %s でもfnは一度実行される",
  async (maxRetries) => {
    const error = { status: 503 }
    const attempt = vi.fn().mockRejectedValue(error)
    await expect(withRetry(attempt, { maxRetries, baseDelayMs: 10 })).rejects.toBe(error)
    expect(attempt).toHaveBeenCalledTimes(1)
  },
)

test("maxRetries Infinityは成功まで再試行する", async () => {
  const attempt = vi
    .fn()
    .mockRejectedValueOnce({ status: 503 })
    .mockRejectedValueOnce({ status: 503 })
    .mockResolvedValue("ok")
  const pending = withRetry(attempt, { maxRetries: Infinity, baseDelayMs: 100 })
  await vi.runAllTimersAsync()
  expect(await pending).toBe("ok")
})
