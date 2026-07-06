type Props = {
  maxRetries: number
  baseDelayMs: number
  isRetryable?: (error: unknown) => boolean
}

const MAX_RETRY_AFTER_MS = 60_000

const DEFAULT_IS_RETRYABLE = (error: unknown): boolean => {
  if (!error || typeof error !== "object") {
    return false
  }

  if ("status" in error && typeof error.status === "number") {
    return error.status === 429 || error.status >= 500
  }

  if ("code" in error && error.code === "rate_limited") {
    return true
  }

  return false
}

function readHeaderValue(headers: unknown, lowerCaseName: string): string | null {
  if (!headers || typeof headers !== "object") {
    return null
  }

  if ("get" in headers && typeof headers.get === "function") {
    const headerValue: unknown = headers.get(lowerCaseName)
    return typeof headerValue === "string" ? headerValue : null
  }

  for (const entry of Object.entries(headers)) {
    if (entry[0].toLowerCase() !== lowerCaseName) {
      continue
    }
    const headerValue: unknown = entry[1]
    if (typeof headerValue === "string") {
      return headerValue
    }
  }

  return null
}

function getRetryAfterMs(error: unknown): number | null {
  if (!error || typeof error !== "object" || !("headers" in error)) {
    return null
  }

  const headerValue = readHeaderValue(error.headers, "retry-after")

  if (headerValue === null) {
    return null
  }

  const seconds = Number(headerValue)

  if (!Number.isFinite(seconds) || seconds < 0) {
    return null
  }

  // サーバーが異常に大きい値を返しても無制限に待たない
  return Math.min(seconds * 1000, MAX_RETRY_AFTER_MS)
}

export async function withRetry<T>(fn: () => Promise<T>, props: Props): Promise<T> {
  const isRetryable = props.isRetryable ?? DEFAULT_IS_RETRYABLE

  const maxRetries = Number.isFinite(props.maxRetries)
    ? Math.max(0, Math.floor(props.maxRetries))
    : props.maxRetries === Number.POSITIVE_INFINITY
      ? Number.POSITIVE_INFINITY
      : 0

  let lastError: unknown = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (e) {
      lastError = e

      if (attempt >= maxRetries || !isRetryable(e)) {
        throw e
      }

      // Retry-Afterヘッダがあれば従い、なければフルジッター付き指数バックオフ
      const retryAfterMs = getRetryAfterMs(e)

      const delay = retryAfterMs ?? Math.random() * props.baseDelayMs * 2 ** attempt

      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError
}
