import { expect, test } from "bun:test"
import type { AudioBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { fromNotionAudioBlock } from "./from-notion-audio-block"

const baseBlock = {
  object: "block",
  id: "1d8842f9-6181-80d8-af1c-dece63b450b0",
  parent: {
    type: "page_id",
    page_id: "1d8842f9-6181-8042-8c77-d5c2f6cb333b",
  },
  created_time: "2025-04-17T16:09:00.000Z",
  last_edited_time: "2025-04-20T16:01:00.000Z",
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
  type: "audio",
} as const

test("外部音声ブロックをマークダウンリンクに変換できる", () => {
  const block = {
    ...baseBlock,
    audio: {
      type: "external",
      external: {
        url: "https://example.com/audio.mp3",
      },
      caption: [],
    },
  } as AudioBlockObjectResponse

  const result = fromNotionAudioBlock(block)
  expect(result).toBe("[音声](https://example.com/audio.mp3)")
})

test("Notionファイル音声ブロックをマークダウンリンクに変換できる", () => {
  const block = {
    ...baseBlock,
    audio: {
      type: "file",
      file: {
        url: "https://s3.amazonaws.com/notion/audio.mp3",
        expiry_time: "2025-04-20T16:01:00.000Z",
      },
      caption: [],
    },
  } as AudioBlockObjectResponse

  const result = fromNotionAudioBlock(block)
  expect(result).toBe("[音声](https://s3.amazonaws.com/notion/audio.mp3)")
})
