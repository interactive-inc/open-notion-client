import type { BlockObjectRequest } from "@notionhq/client/build/src/api-endpoints"

/** 分割できない入れ子配列やrich textは、ページを書き換える前に制限違反を知らせる。 */
export function validateBlockRequests(blocks: BlockObjectRequest[]): void {
  const pending: Array<{ value: unknown; path: string }> = blocks.map((value, index) => ({
    value,
    path: `blocks[${index}]`,
  }))

  for (const entry of pending) {
    if (Array.isArray(entry.value)) {
      if (entry.value.length > 100) {
        throw new RangeError(`${entry.path} exceeds the Notion limit of 100 elements`)
      }
      entry.value.forEach((value, index) =>
        pending.push({ value, path: `${entry.path}[${index}]` }),
      )
    } else if (entry.value && typeof entry.value === "object") {
      for (const child of Object.entries(entry.value)) {
        if (child[0] === "expression" && typeof child[1] === "string" && child[1].length > 1000) {
          throw new RangeError(
            `${entry.path}.expression exceeds the Notion limit of 1000 characters`,
          )
        }
        pending.push({ value: child[1], path: `${entry.path}.${child[0]}` })
      }
    }
  }
}
