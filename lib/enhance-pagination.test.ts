import { expect, test } from "bun:test"
import type {
  BlockObjectResponse,
  ListBlockChildrenParameters,
  ListBlockChildrenResponse,
} from "@notionhq/client/build/src/api-endpoints"
import { enhance } from "./enhance"

function makeParagraph(id: string): BlockObjectResponse {
  return {
    object: "block",
    id: id,
    parent: { type: "page_id", page_id: "page-1" },
    created_time: "2024-01-01T00:00:00.000Z",
    last_edited_time: "2024-01-01T00:00:00.000Z",
    created_by: { object: "user", id: "user-1" },
    last_edited_by: { object: "user", id: "user-1" },
    has_children: false,
    archived: false,
    in_trash: false,
    type: "paragraph",
    paragraph: { rich_text: [], color: "default" },
  } as unknown as BlockObjectResponse
}

test("has_moreが連続するときに全件取得する", async () => {
  const calls: ListBlockChildrenParameters[] = []

  const client = async (args: ListBlockChildrenParameters): Promise<ListBlockChildrenResponse> => {
    calls.push(args)
    if (args.start_cursor === undefined) {
      return {
        object: "list",
        results: [makeParagraph("b1"), makeParagraph("b2")],
        next_cursor: "cursor-2",
        has_more: true,
        type: "block",
        block: {},
      } as unknown as ListBlockChildrenResponse
    }
    if (args.start_cursor === "cursor-2") {
      return {
        object: "list",
        results: [makeParagraph("b3")],
        next_cursor: "cursor-3",
        has_more: true,
        type: "block",
        block: {},
      } as unknown as ListBlockChildrenResponse
    }
    return {
      object: "list",
      results: [makeParagraph("b4")],
      next_cursor: null,
      has_more: false,
      type: "block",
      block: {},
    } as unknown as ListBlockChildrenResponse
  }

  const result = await enhance(client)({ block_id: "page-1" })

  expect(result.map((b) => b.id)).toEqual(["b1", "b2", "b3", "b4"])
  expect(calls).toHaveLength(3)
  expect(calls[1]?.start_cursor).toBe("cursor-2")
  expect(calls[2]?.start_cursor).toBe("cursor-3")
})
