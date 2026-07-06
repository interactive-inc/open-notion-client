import { z } from "zod"
import type { NotionFilesPropertyRequest } from "@/types"

const fileSchema = z.object({
  name: z.string().min(1),
  url: z.string().min(1),
  type: z.enum(["file", "external"]).optional(),
})

const filesPropertySchema = z.array(fileSchema).nullable()

/**
 * unknownをNotionのfilesプロパティに変換
 * type: "file"（Notionホスト済みファイル）はそのままfileとして書き戻す
 * type未指定または"external"は外部URLとして送信する
 */
export function toNotionFilesProperty(value: unknown): NotionFilesPropertyRequest {
  const data = filesPropertySchema.parse(value)

  if (data === null) {
    return { files: [] }
  }

  return {
    files: data.map((file) => {
      if (file.type === "file") {
        return {
          name: file.name,
          type: "file",
          file: { url: file.url },
        }
      }
      return {
        name: file.name,
        type: "external",
        external: { url: file.url },
      }
    }),
  }
}
