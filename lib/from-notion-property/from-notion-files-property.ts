import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import type { NotionFile } from "@/types"

type FilesProperty = Extract<PageObjectResponse["properties"][string], { type: "files" }>

/**
 * Notionのfilesプロパティを{@link NotionFile}配列に変換
 */
export function fromNotionFilesProperty(property: FilesProperty): NotionFile[] {
  if (!property.files || !Array.isArray(property.files)) {
    return []
  }

  return property.files.map((file) => {
    if (file.type === "external") {
      return {
        name: file.name,
        url: file.external.url,
        type: "external",
      }
    }
    return {
      name: file.name,
      url: file.file.url,
      type: "file",
    }
  })
}
