const notionTextContentLimit = 2000

/**
 * Notion APIのrich text 1要素あたり2000文字制限に合わせて文字列を分割する
 * サロゲートペアの途中で分割しないよう境界を1文字手前にずらす
 */
export function splitTextContent(text: string): string[] {
  const chunks: string[] = []

  for (let offset = 0; offset < text.length;) {
    const end = Math.min(offset + notionTextContentLimit, text.length)
    const lastCharCode = text.charCodeAt(end - 1)
    const isHighSurrogate = lastCharCode >= 0xd800 && lastCharCode <= 0xdbff
    const boundary = end < text.length && isHighSurrogate ? end - 1 : end
    chunks.push(text.slice(offset, boundary))
    offset = boundary
  }

  return chunks.length > 0 ? chunks : [""]
}
