import type { CodeBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { fromNotionRichTextItem } from "@/utils"

export function fromNotionCodeBlock(block: CodeBlockObjectResponse): string {
  const language = block.code.language || ""

  const code = fromNotionRichTextItem(block.code.rich_text)

  const backtickRuns = code.match(/`+/g) ?? []

  const longestRunLength = backtickRuns.reduce((max, run) => Math.max(max, run.length), 0)

  // 内容中の最長バッククォート連続長+1(最低3)のフェンスにしないと早期終了する
  const fence = "`".repeat(Math.max(3, longestRunLength + 1))

  return `${fence}${language}\n${code}\n${fence}`.trim()
}
