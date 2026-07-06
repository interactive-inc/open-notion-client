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

type AnnotatedSegment = {
  plainText: string
  isBold: boolean
  isItalic: boolean
  isStrikethrough: boolean
  isCode: boolean
  href: string | null
}

function toAnnotatedSegment(item: RichTextItemResponse): AnnotatedSegment {
  return {
    plainText: item.plain_text,
    isBold: item.annotations ? item.annotations.bold === true : false,
    isItalic: item.annotations ? item.annotations.italic === true : false,
    isStrikethrough: item.annotations ? item.annotations.strikethrough === true : false,
    isCode: item.annotations ? item.annotations.code === true : false,
    href: extractHref(item),
  }
}

function isSameStyleSegment(a: AnnotatedSegment, b: AnnotatedSegment): boolean {
  if (a.isBold !== b.isBold) return false

  if (a.isItalic !== b.isItalic) return false

  if (a.isStrikethrough !== b.isStrikethrough) return false

  if (a.isCode !== b.isCode) return false

  return a.href === b.href
}

/**
 * 注釈とリンクが同一の隣接セグメントを結合する
 * 結合しないと `**foo****bar**` のようにマーカーが癒着してパース不能になる
 */
function mergeAdjacentSegments(segments: AnnotatedSegment[]): AnnotatedSegment[] {
  const merged: AnnotatedSegment[] = []

  for (const segment of segments) {
    const previous = merged[merged.length - 1]

    if (previous && isSameStyleSegment(previous, segment)) {
      merged[merged.length - 1] = {
        ...previous,
        plainText: previous.plainText + segment.plainText,
      }
      continue
    }

    merged.push(segment)
  }

  return merged
}

/**
 * 先頭・末尾の空白はマーカーの外に出してから注釈を適用する
 * `**bold **` はCommonMarkで強調と認識されないため `**bold** ` にする
 * codeは最内殻、リンクは最外殻に巻く
 */
function wrapAnnotatedSegment(segment: AnnotatedSegment): string {
  const hasStyle = segment.isBold || segment.isItalic || segment.isStrikethrough || segment.isCode

  if (!hasStyle) {
    return segment.href ? `[${segment.plainText}](${segment.href})` : segment.plainText
  }

  const matched = segment.plainText.match(/^(\s*)([\s\S]*?)(\s*)$/)

  const leading = matched?.[1] ?? ""

  const core = matched?.[2] ?? ""

  const trailing = matched?.[3] ?? ""

  if (core === "") {
    return segment.href ? `[${segment.plainText}](${segment.href})` : segment.plainText
  }

  let wrapped = core

  if (segment.isCode) wrapped = `\`${wrapped}\``

  if (segment.isStrikethrough) wrapped = `~~${wrapped}~~`

  if (segment.isItalic) wrapped = `*${wrapped}*`

  if (segment.isBold) wrapped = `**${wrapped}**`

  if (segment.href) wrapped = `[${wrapped}](${segment.href})`

  return `${leading}${wrapped}${trailing}`
}

/**
 * Convert Notion rich text to markdown text
 * 注釈 (bold/italic/strikethrough/code) とリンクをマークダウン記法に変換する
 * リンクは text.text.link.url を優先し、なければ href を見る
 */
export function fromNotionRichTextItem(richTexts: RichTextItemResponse[]): string {
  if (!richTexts || richTexts.length === 0) return ""

  const segments = mergeAdjacentSegments(richTexts.map((item) => toAnnotatedSegment(item)))

  return segments.map((segment) => wrapAnnotatedSegment(segment)).join("")
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
  | {
      type: "icon"
      icon: { name: string; color: string }
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
