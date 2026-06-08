import { z } from "zod"
import type { NotionFilesPropertyRequest } from "@/types"

const fileSchema = z.object({
  name: z.string().min(1),
  url: z.string().min(1),
})

const filesPropertySchema = z.array(fileSchema).nullable()

/**
 * unknownをNotionのfilesプロパティに変換
 * 外部URLのみサポート。Notion API経由ではアップロード済みファイルの新規登録はできないため
 * 全エントリを type: "external" として送信する
 */
export function toNotionFilesProperty(value: unknown): NotionFilesPropertyRequest {
  const data = filesPropertySchema.parse(value)

  if (data === null) {
    return { files: [] }
  }

  return {
    files: data.map((file) => ({
      name: file.name,
      type: "external",
      external: { url: file.url },
    })),
  }
}
