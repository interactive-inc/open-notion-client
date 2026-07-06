/**
 * itemsを並列実行するが同時走行数をlimit以下に保つ
 * 結果の順序はinputの順序と一致する
 * undefined要素でもfnを呼ぶ（{@link Promise.all}と同じ契約）
 * fnが投げた場合は{@link Promise.all}と同様に最初の失敗で全体が失敗する
 */
export async function withConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const effectiveLimit = Math.max(1, Math.floor(limit))

  if (items.length === 0) {
    return []
  }

  const results: R[] = Array.from({ length: items.length })

  const entries = items.entries()

  const runWorker = async (): Promise<void> => {
    while (true) {
      const next = entries.next()
      if (next.done) {
        return
      }
      const index = next.value[0]
      results[index] = await fn(next.value[1], index)
    }
  }

  const workers: Promise<void>[] = []

  for (let i = 0; i < Math.min(effectiveLimit, items.length); i++) {
    workers.push(runWorker())
  }

  await Promise.all(workers)

  return results
}
