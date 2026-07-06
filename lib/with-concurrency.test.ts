import { expect, test } from "bun:test"
import { withConcurrency } from "./with-concurrency"

test("結果の順序は入力順を保つ", async () => {
  const result = await withConcurrency([3, 1, 2], 2, async (n) => n * 10)
  expect(result).toEqual([30, 10, 20])
})

test("同時実行数を超えない", async () => {
  let inflight = 0
  let max = 0

  await withConcurrency([1, 2, 3, 4, 5, 6], 2, async () => {
    inflight++
    if (inflight > max) max = inflight
    await new Promise((r) => setTimeout(r, 5))
    inflight--
  })

  expect(max).toBe(2)
})

test("空配列は空を返す", async () => {
  const result = await withConcurrency<number, number>([], 4, async (n) => n)
  expect(result).toEqual([])
})

test("最初の失敗で全体が失敗する", async () => {
  const fn = withConcurrency([1, 2, 3], 2, async (n) => {
    if (n === 2) throw new Error("boom")
    return n
  })

  await expect(fn).rejects.toThrow("boom")
})

test("limit 0以下は1として扱う", async () => {
  const result = await withConcurrency([1, 2], 0, async (n) => n + 1)
  expect(result).toEqual([2, 3])
})

test("undefined要素でもfnを呼び結果に穴を残さない", async () => {
  const inputs: Array<number | undefined> = [1, undefined, 3]

  const result = await withConcurrency(inputs, 2, async (input, index) => `${index}:${input}`)

  expect(result).toEqual(["0:1", "1:undefined", "2:3"])
})

test("undefined要素を含んでも全要素分fnが呼ばれる", async () => {
  const inputs: Array<string | undefined> = [undefined, undefined, "a"]
  let callCount = 0

  const result = await withConcurrency(inputs, 1, async (input) => {
    callCount++
    return input ?? "fallback"
  })

  expect(callCount).toBe(3)
  expect(result).toEqual(["fallback", "fallback", "a"])
})
