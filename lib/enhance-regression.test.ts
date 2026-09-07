import { expect, test, vi } from "vite-plus/test"
import type {
  ListBlockChildrenResponse,
  ListBlockChildrenParameters,
} from "@notionhq/client/build/src/api-endpoints"
import { enhance } from "@/enhance"
import { notionParagraph } from "@/testing/notion-paragraph"

function response(
  blocks: ListBlockChildrenResponse["results"],
  cursor: string | null = null,
): ListBlockChildrenResponse {
  return {
    object: "list",
    type: "block",
    block: {},
    results: blocks,
    next_cursor: cursor,
    has_more: cursor !== null,
  }
}

test.each([{ cursors: ["a", "a"] }, { cursors: ["a", "b", "a"] }])(
  "ブロック取得でもcursorの循環 $cursors を検出する",
  async ({ cursors }) => {
    const client =
      vi.fn<(args: ListBlockChildrenParameters) => Promise<ListBlockChildrenResponse>>()
    for (const cursor of cursors) client.mockResolvedValueOnce(response([], cursor))
    await expect(enhance(client)({ block_id: "root" })).rejects.toThrow(/cursor/)
    expect(client).toHaveBeenCalledTimes(cursors.length)
  },
)

test("開始cursorが応答に再登場した場合も停止する", async () => {
  const client = vi.fn(async () => response([], "initial"))
  await expect(enhance(client)({ block_id: "root", start_cursor: "initial" })).rejects.toThrow(
    /cursor/,
  )
  expect(client).toHaveBeenCalledTimes(1)
})

test("途中のAPI失敗で占有したスロットを解放し、同じenhancerを再利用できる", async () => {
  const error = new Error("unavailable")
  const client = vi
    .fn<(args: ListBlockChildrenParameters) => Promise<ListBlockChildrenResponse>>()
    .mockRejectedValueOnce(error)
    .mockResolvedValueOnce(response([notionParagraph()]))
  const read = enhance(client, { concurrency: 1 })
  await expect(read({ block_id: "root" })).rejects.toBe(error)
  expect((await read({ block_id: "root" })).map((block) => block.id)).toEqual(["block-1"])
})

test("小数の並行数は切り下げ、深さ全体で同時走行数を制限する", async () => {
  const gate = Promise.withResolvers<void>()
  const started = Promise.withResolvers<void>()
  const active = { count: 0, max: 0 }
  const client = vi.fn(async (args: ListBlockChildrenParameters) => {
    if (args.block_id === "root")
      return response([
        { ...notionParagraph("a"), has_children: true },
        { ...notionParagraph("b"), has_children: true },
      ])
    active.count++
    active.max = Math.max(active.count, active.max)
    started.resolve()
    await gate.promise
    active.count--
    return response([])
  })
  const pending = enhance(client, { concurrency: 1.5 })({ block_id: "root" })
  await started.promise
  gate.resolve()
  expect((await pending).map((block) => block.id)).toEqual(["a", "b"])
  expect(active.max).toBe(1)
})

test("親のstart_cursorを子のリストへ持ち込まない", async () => {
  const client = vi
    .fn<(args: ListBlockChildrenParameters) => Promise<ListBlockChildrenResponse>>()
    .mockResolvedValueOnce(response([{ ...notionParagraph("child"), has_children: true }]))
    .mockResolvedValueOnce(response([]))
  await enhance(client)({ block_id: "root", start_cursor: "parent-cursor" })
  expect(client.mock.calls).toEqual([
    [{ block_id: "root", start_cursor: "parent-cursor" }],
    [{ block_id: "child" }],
  ])
})
