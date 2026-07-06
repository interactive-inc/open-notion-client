import { expect, test } from "bun:test"
import type { CodeBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { fromNotionCodeBlock } from "./from-notion-code-block"

test("fromNotionCodeBlock", () => {
  const block = {
    object: "block",
    id: "1db842f9-6181-80f4-a1e3-da31b10a9b9e",
    parent: {
      type: "page_id",
      page_id: "1d8842f9-6181-8042-8c77-d5c2f6cb333b",
    },
    created_time: "2025-04-20T15:47:00.000Z",
    last_edited_time: "2025-04-20T15:50:00.000Z",
    created_by: {
      object: "user",
      id: "63fd3a0c-d05f-48d4-8009-0a0e997edfca",
    },
    last_edited_by: {
      object: "user",
      id: "63fd3a0c-d05f-48d4-8009-0a0e997edfca",
    },
    has_children: false,
    archived: false,
    in_trash: false,
    type: "code",
    code: {
      caption: [],
      rich_text: [
        {
          type: "text",
          text: {
            content: "const a = 2",
            link: null,
          },
          annotations: {
            bold: false,
            italic: false,
            strikethrough: false,
            underline: false,
            code: false,
            color: "default",
          },
          plain_text: "const a = 2",
          href: null,
        },
      ],
      language: "json",
    },
  } as const satisfies CodeBlockObjectResponse

  const result = fromNotionCodeBlock(block)

  expect(result).toBe("```json\nconst a = 2\n```")
})

test("内容にバッククォート3連を含む場合はより長いフェンスを使う", () => {
  const content = "```js\nconst a = 1\n```"
  const block = {
    object: "block",
    id: "1db842f9-6181-80f4-a1e3-da31b10a9b9e",
    parent: {
      type: "page_id",
      page_id: "1d8842f9-6181-8042-8c77-d5c2f6cb333b",
    },
    created_time: "2025-04-20T15:47:00.000Z",
    last_edited_time: "2025-04-20T15:50:00.000Z",
    created_by: {
      object: "user",
      id: "63fd3a0c-d05f-48d4-8009-0a0e997edfca",
    },
    last_edited_by: {
      object: "user",
      id: "63fd3a0c-d05f-48d4-8009-0a0e997edfca",
    },
    has_children: false,
    archived: false,
    in_trash: false,
    type: "code",
    code: {
      caption: [],
      rich_text: [
        {
          type: "text",
          text: {
            content: content,
            link: null,
          },
          annotations: {
            bold: false,
            italic: false,
            strikethrough: false,
            underline: false,
            code: false,
            color: "default",
          },
          plain_text: content,
          href: null,
        },
      ],
      language: "markdown",
    },
  } as const satisfies CodeBlockObjectResponse

  const result = fromNotionCodeBlock(block)

  expect(result).toBe(`\`\`\`\`markdown\n${content}\n\`\`\`\``)
})
