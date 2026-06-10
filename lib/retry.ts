type Props = {
  maxRetries: number
  baseDelayMs: number
  isRetryable?: (error: unknown) => boolean
}

const DEFAULT_IS_RETRYABLE = (error: unknown): boolean => {
  if (!error || typeof error !== "object") {
    return false
  }

  const record = error as Record<string, unknown>

  if ("status" in error && typeof record.status === "number") {
    return record.status === 429 || record.status >= 500
  }

  if ("code" in error && record.code === "rate_limited") {
    return true
  }

  return false
}

export async function withRetry<T>(fn: () => Promise<T>, props: Props): Promise<T> {
  const isRetryable = props.isRetryable ?? DEFAULT_IS_RETRYABLE

  let lastError: unknown = null

  for (let attempt = 0; attempt <= props.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (e) {
      lastError = e

      if (attempt >= props.maxRetries || !isRetryable(e)) {
        throw e
      }

      const delay = props.baseDelayMs * 2 ** attempt

      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError
}
