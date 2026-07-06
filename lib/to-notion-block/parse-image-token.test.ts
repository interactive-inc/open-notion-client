import { expect, test } from "bun:test"
import { parseImageToken } from "./parse-image-token"

type ImageBlock = {
  type: "image"
  image: {
    type: "external"
    external: { url: string }
    caption: Array<{ text: { content: string } }>
  }
}

test("imageトークンをimageブロックに変換", () => {
  const token = {
    type: "image" as const,
    raw: "![alt text](https://example.com/a.png)",
    href: "https://example.com/a.png",
    title: null,
    text: "alt text",
    tokens: [],
  }

  const block = parseImageToken(token) as unknown as ImageBlock

  expect(block.type).toBe("image")
  expect(block.image.external.url).toBe("https://example.com/a.png")
  expect(block.image.caption[0]?.text.content).toBe("alt text")
})

test("altが空の場合はcaptionなし", () => {
  const token = {
    type: "image" as const,
    raw: "![](https://example.com/a.png)",
    href: "https://example.com/a.png",
    title: null,
    text: "",
    tokens: [],
  }

  const block = parseImageToken(token) as unknown as ImageBlock

  expect(block.image.caption).toHaveLength(0)
})
