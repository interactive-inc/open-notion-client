import type {
  PageObjectResponse,
  RichTextItemResponse,
  UpdatePageResponse,
} from "@notionhq/client/build/src/api-endpoints"

/**
 * UpdatePageResponse (PageObjectResponse | PartialPageObjectResponse) を
 * PageObjectResponseとして取り出す。partialの場合は内部矛盾なのでthrow
 */
export function toNotionPage(resp: UpdatePageResponse): PageObjectResponse {
  if (!("properties" in resp)) {
    throw new Error(`Notion returned a partial page (id=${resp.id})`)
  }
  return resp
}

function extractHref(item: RichTextItemResponse): string | null {
  if (item.href) {
    return item.href
  }
  if (item.type === "text" && item.text.link && item.text.link.url) {
    return item.text.link.url
  }
  return null
}

/**
 * Convert Notion rich text to markdown text
 * 注釈 (bold/italic/strikethrough/code) とリンクをマークダウン記法に変換する
 * リンクは text.text.link.url を優先し、なければ href を見る
 */
export function fromNotionRichTextItem(richTexts: RichTextItemResponse[]): string {
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

    const href = extractHref(text)
    if (href) {
      textResult = `[${textResult}](${href})`
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
