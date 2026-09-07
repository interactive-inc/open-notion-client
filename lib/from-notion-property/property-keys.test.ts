import { expect, test } from "vite-plus/test"
import { NotionPropertyConverter } from "@/table/notion-property-converter"
import { notionRichText } from "@/testing/notion-rich-text"
import type { NotionPropertySchema } from "@/types"

const titleConfig = { type: "title" } satisfies NotionPropertySchema[string]

test.each(["__proto__", "constructor", "toString"])(
  "プロパティ名 %s の読み書きで値と所有キーを保つ",
  (key) => {
    const schema: NotionPropertySchema = { [key]: { type: "title" } }
    const converter = new NotionPropertyConverter()
    const written = converter.toNotion(schema, { [key]: "value" })
    expect(Object.hasOwn(written, key)).toBe(true)
    expect(written[key]).toEqual({ title: [{ type: "text", text: { content: "value" } }] })
    const read = converter.fromNotion(schema, {
      [key]: { id: "title", type: "title", title: [notionRichText("value")] },
    })
    expect(Object.hasOwn(read, key)).toBe(true)
    expect(read[key]).toBe("value")
    expect(Object.getPrototypeOf(read)).toBe(Object.prototype)
  },
)

test("受信プロパティに同名の所有キーがなければnullになる", () => {
  const schema: NotionPropertySchema = { constructor: titleConfig }
  expect(new NotionPropertyConverter().fromNotion(schema, {})).toEqual({ constructor: null })
})

test("更新値のプロトタイプからプロパティ値を送信しない", () => {
  const schema: NotionPropertySchema = { constructor: titleConfig }
  expect(new NotionPropertyConverter().toNotion(schema, {})).toEqual({})
})
