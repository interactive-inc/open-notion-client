import type {
  PageObjectResponse,
  RichTextItemResponse,
  UpdatePageResponse,
} from "@notionhq/client/build/src/api-endpoints"

export function toNotionPage(resp: UpdatePageResponse): PageObjectResponse {
  return resp as unknown as PageObjectResponse
}

/**
 * Convert Notion rich text to markdown text
 */
export function fromNotionRichTextItem(
  richTexts: RichTextItemResponse[],
): string {
  if (!richTexts || richTexts.length === 0) return ""

  let result = ""

  for (const text of richTexts) {
    let textResult = text.plain_text

    if (text.annotations) {
      if (text.annotations.bold) textResult = `**${textResult}**`
      if (text.annotations.italic) textResult = `*${textResult}*`
      if (text.annotations.strikethrough) textResult = `~~${textResult}~~`
      if (text.annotations.code) textResult = `\`${textResult}\``
    }

    if (text.href) {
      textResult = `[${textResult}](${text.href})`
    }

    result += textResult
  }

  return result
}

type FileObject =
  | {
      type: "external"
      external: { url: string }
    }
  | {
      type: "file"
      file: { url: string }
    }

type IconObject =
  | {
      type: "emoji"
      emoji: string
    }
  | {
      type: "external"
      external: { url: string }
    }
  | {
      type: "file"
      file: { url: string }
    }
  | {
      type: "custom_emoji"
      custom_emoji: { id: string }
    }
  | null

/**
 * Extract URL from Notion file object
 */
export function extractFileUrl(file: FileObject): string {
  if (file.type === "external") {
    return file.external.url
  }
  if (file.type === "file") {
    return file.file.url
  }
  return ""
}

/**
 * Extract text from Notion icon object
 */
export function extractIconText(icon: IconObject): string {
  if (icon === null) {
    return ""
  }
  if (icon.type === "emoji") {
    return icon.emoji
  }
  return ""
}
