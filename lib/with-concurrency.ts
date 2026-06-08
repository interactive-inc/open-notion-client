/**
 * itemsを並列実行するが同時走行数をlimit以下に保つ
 * 結果の順序はinputの順序と一致する
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

  const results: R[] = new Array(items.length)
  let nextIndex = 0

  const workers: Promise<void>[] = []

  const runWorker = async (): Promise<void> => {
    while (true) {
      const current = nextIndex
      nextIndex++
      if (current >= items.length) {
        return
      }
      const item = items[current]
      if (item === undefined) {
        continue
      }
      results[current] = await fn(item, current)
    }
  }

  for (let i = 0; i < Math.min(effectiveLimit, items.length); i++) {
    workers.push(runWorker())
  }

  await Promise.all(workers)

  return results
}
