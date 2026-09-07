/** Notionの平文をMarkdownの装飾やブロック開始記号として解釈させない。 */
export function escapeMarkdownText(text: string): string {
  return text
    .replace(/[\\`*_[\]~<>]/g, "\\$&")
    .replace(/^( {0,3})(#{1,6})(?=\s|$)/gm, "$1\\$2")
    .replace(/^( {0,3})([-+])(?=\s|$)/gm, "$1\\$2")
    .replace(/^( {0,3}\d{1,9})([.)])(?=\s|$)/gm, "$1\\$2")
}
