import { expect, test } from "bun:test"
import type {
  BlockObjectResponse,
  ListBlockChildrenParameters,
  ListBlockChildrenResponse,
} from "@notionhq/client/build/src/api-endpoints"
import { enhance } from "./enhance"

test("子ブロックを持たないブロックを正しく処理", async () => {
  const mockClient = async (
    _args: ListBlockChildrenParameters,
  ): Promise<ListBlockChildrenResponse> => {
    return {
      object: "list",
      results: [
        {
          object: "block",
          id: "block-1",
          parent: { type: "page_id", page_id: "page-1" },
          created_time: "2023-01-01T00:00:00.000Z",
          last_edited_time: "2023-01-01T00:00:00.000Z",
          created_by: { object: "user", id: "user-1" },
          last_edited_by: { object: "user", id: "user-1" },
          has_children: false,
          archived: false,
          in_trash: false,
          type: "paragraph",
          paragraph: {
            icon: null,
            rich_text: [
              {
                type: "text",
                text: { content: "テストパラグラフ", link: null },
                annotations: {
                  bold: false,
                  italic: false,
                  strikethrough: false,
                  underline: false,
                  code: false,
                  color: "default",
                },
                plain_text: "テストパラグラフ",
                href: null,
              },
            ],
            color: "default",
          },
        },
      ],
      next_cursor: null,
      has_more: false,
      type: "block",
      block: {},
    }
  }

  const enhancedClient = enhance(mockClient)
  const result = await enhancedClient({ block_id: "test-block" })

  expect(result).toHaveLength(1)
  expect(result[0]?.id).toBe("block-1")
  expect(result[0]?.has_children).toBe(false)
  expect(result[0]?.children).toEqual([])
})

test("子ブロックを持つブロックを再帰的に処理", async () => {
  const mockClient = async (
    args: ListBlockChildrenParameters,
  ): Promise<ListBlockChildrenResponse> => {
    if (args.block_id === "parent-block") {
      return {
        object: "list",
        results: [
          {
            object: "block",
            id: "child-block",
            parent: { type: "block_id", block_id: "parent-block" },
            created_time: "2023-01-01T00:00:00.000Z",
            last_edited_time: "2023-01-01T00:00:00.000Z",
            created_by: { object: "user", id: "user-1" },
            last_edited_by: { object: "user", id: "user-1" },
            has_children: true,
            archived: false,
            in_trash: false,
            type: "bulleted_list_item",
            bulleted_list_item: {
              rich_text: [
                {
                  type: "text",
                  text: { content: "親リストアイテム", link: null },
                  annotations: {
                    bold: false,
                    italic: false,
                    strikethrough: false,
                    underline: false,
                    code: false,
                    color: "default",
                  },
                  plain_text: "親リストアイテム",
                  href: null,
                },
              ],
              color: "default",
            },
          },
        ],
        next_cursor: null,
        has_more: false,
        type: "block",
        block: {},
      }
    }

    if (args.block_id === "child-block") {
      return {
        object: "list",
        results: [
          {
            object: "block",
            id: "grandchild-block",
            parent: { type: "block_id", block_id: "child-block" },
            created_time: "2023-01-01T00:00:00.000Z",
            last_edited_time: "2023-01-01T00:00:00.000Z",
            created_by: { object: "user", id: "user-1" },
            last_edited_by: { object: "user", id: "user-1" },
            has_children: false,
            archived: false,
            in_trash: false,
            type: "paragraph",
            paragraph: {
              icon: null,
              rich_text: [
                {
                  type: "text",
                  text: { content: "子要素", link: null },
                  annotations: {
                    bold: false,
                    italic: false,
                    strikethrough: false,
                    underline: false,
                    code: false,
                    color: "default",
                  },
                  plain_text: "子要素",
                  href: null,
                },
              ],
              color: "default",
            },
          },
        ],
        next_cursor: null,
        has_more: false,
        type: "block",
        block: {},
      }
    }

    return {
      object: "list",
      results: [],
      next_cursor: null,
      has_more: false,
      type: "block",
      block: {},
    }
  }

  const enhancedClient = enhance(mockClient)
  const result = await enhancedClient({ block_id: "parent-block" })

  expect(result).toHaveLength(1)
  expect(result[0]?.id).toBe("child-block")
  expect(result[0]?.has_children).toBe(true)
  expect(result[0]?.children).toHaveLength(1)
  expect(result[0]?.children[0]?.id).toBe("grandchild-block")
  expect(result[0]?.children[0]?.has_children).toBe(false)
  expect(result[0]?.children[0]?.children).toEqual([])
})

test("複数のブロックを正しく処理", async () => {
  const mockClient = async (
    _args: ListBlockChildrenParameters,
  ): Promise<ListBlockChildrenResponse> => {
    return {
      object: "list",
      results: [
        {
          object: "block",
          id: "block-1",
          parent: { type: "page_id", page_id: "page-1" },
          created_time: "2023-01-01T00:00:00.000Z",
          last_edited_time: "2023-01-01T00:00:00.000Z",
          created_by: { object: "user", id: "user-1" },
          last_edited_by: { object: "user", id: "user-1" },
          has_children: false,
          archived: false,
          in_trash: false,
          type: "heading_1",
          heading_1: {
            rich_text: [
              {
                type: "text",
                text: { content: "見出し1", link: null },
                annotations: {
                  bold: false,
                  italic: false,
                  strikethrough: false,
                  underline: false,
                  code: false,
                  color: "default",
                },
                plain_text: "見出し1",
                href: null,
              },
            ],
            color: "default",
            is_toggleable: false,
          },
        },
        {
          object: "block",
          id: "block-2",
          parent: { type: "page_id", page_id: "page-1" },
          created_time: "2023-01-01T00:00:00.000Z",
          last_edited_time: "2023-01-01T00:00:00.000Z",
          created_by: { object: "user", id: "user-1" },
          last_edited_by: { object: "user", id: "user-1" },
          has_children: false,
          archived: false,
          in_trash: false,
          type: "paragraph",
          paragraph: {
            icon: null,
            rich_text: [
              {
                type: "text",
                text: { content: "パラグラフ", link: null },
                annotations: {
                  bold: false,
                  italic: false,
                  strikethrough: false,
                  underline: false,
                  code: false,
                  color: "default",
                },
                plain_text: "パラグラフ",
                href: null,
              },
            ],
            color: "default",
          },
        },
      ],
      next_cursor: null,
      has_more: false,
      type: "block",
      block: {},
    }
  }

  const enhancedClient = enhance(mockClient)
  const result = await enhancedClient({ block_id: "test-block" })

  expect(result).toHaveLength(2)
  expect(result[0]?.id).toBe("block-1")
  expect(result[1]?.id).toBe("block-2")
  expect(result[0]?.children).toEqual([])
  expect(result[1]?.children).toEqual([])
})

test("typeが定義されていないブロックでエラーをthrow", async () => {
  const mockClient = async (
    _args: ListBlockChildrenParameters,
  ): Promise<ListBlockChildrenResponse> => {
    return {
      object: "list",
      results: [
        {
          object: "block",
          id: "invalid-block",
        } as unknown as BlockObjectResponse,
      ],
      next_cursor: null,
      has_more: false,
      type: "block",
      block: {},
    }
  }

  const enhancedClient = enhance(mockClient)

  await expect(enhancedClient({ block_id: "test-block" })).rejects.toThrow(
    "Block invalid-block has no type field",
  )
})

test("同時リクエスト数が木全体でconcurrencyを超えない", async () => {
  const makeBlock = (id: string, hasChildren: boolean): BlockObjectResponse => {
    return {
      object: "block",
      id: id,
      parent: { type: "page_id", page_id: "page-1" },
      created_time: "2024-01-01T00:00:00.000Z",
      last_edited_time: "2024-01-01T00:00:00.000Z",
      created_by: { object: "user", id: "user-1" },
      last_edited_by: { object: "user", id: "user-1" },
      has_children: hasChildren,
      archived: false,
      in_trash: false,
      type: "paragraph",
      paragraph: { rich_text: [], color: "default" },
    } as unknown as BlockObjectResponse
  }

  const emptyResponse = {
    object: "list",
    results: [],
    next_cursor: null,
    has_more: false,
    type: "block",
    block: {},
  } as unknown as ListBlockChildrenResponse

  const childIds = ["c1", "c2", "c3", "c4", "c5", "c6"]

  let inflight = 0
  let maxInflight = 0

  const mockClient = async (
    args: ListBlockChildrenParameters,
  ): Promise<ListBlockChildrenResponse> => {
    inflight++
    maxInflight = Math.max(maxInflight, inflight)
    await new Promise((resolve) => setTimeout(resolve, 5))
    inflight--

    if (args.block_id === "root") {
      return {
        object: "list",
        results: childIds.map((id) => makeBlock(id, true)),
        next_cursor: null,
        has_more: false,
        type: "block",
        block: {},
      } as unknown as ListBlockChildrenResponse
    }

    if (childIds.includes(String(args.block_id))) {
      return {
        object: "list",
        results: [makeBlock(`${args.block_id}-grandchild`, true)],
        next_cursor: null,
        has_more: false,
        type: "block",
        block: {},
      } as unknown as ListBlockChildrenResponse
    }

    return emptyResponse
  }

  const result = await enhance(mockClient, { concurrency: 2 })({ block_id: "root" })

  // 深さ3の木でも同時リクエスト数はconcurrency=2を超えない
  // (旧実装は階層ごとに独立して並列化するため2を超えていた)
  expect(maxInflight).toBeLessThanOrEqual(2)
  expect(result).toHaveLength(6)
  expect(result[0]?.children).toHaveLength(1)
  expect(result[0]?.children[0]?.id).toBe("c1-grandchild")
  expect(result[0]?.children[0]?.children).toEqual([])
})

test("空のレスポンスを正しく処理", async () => {
  const mockClient = async (
    _args: ListBlockChildrenParameters,
  ): Promise<ListBlockChildrenResponse> => {
    return {
      object: "list",
      results: [],
      next_cursor: null,
      has_more: false,
      type: "block",
      block: {},
    }
  }

  const enhancedClient = enhance(mockClient)
  const result = await enhancedClient({ block_id: "empty-block" })

  expect(result).toEqual([])
})
