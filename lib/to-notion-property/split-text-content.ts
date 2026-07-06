const notionTextContentLimit = 2000

/**
 * Notion APIのrich text 1要素あたり2000文字制限に合わせて文字列を分割する
 * サロゲートペアの途中で分割しないよう境界を1文字手前にずらす
 */
export function splitTextContent(text: string): string[] {
  if (text.length <= notionTextContentLimit) {
    return [text]
  }

  const lastCharCode = text.charCodeAt(notionTextContentLimit - 1)

  const isHighSurrogate = lastCharCode >= 0xd800 && lastCharCode <= 0xdbff

  const boundary = isHighSurrogate ? notionTextContentLimit - 1 : notionTextContentLimit

  return [text.slice(0, boundary), ...splitTextContent(text.slice(boundary))]
}
