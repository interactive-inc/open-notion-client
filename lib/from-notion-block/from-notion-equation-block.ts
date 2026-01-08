import type { EquationBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"

/**
 * Convert Notion equation block to markdown
 */
export function fromNotionEquationBlock(
  block: EquationBlockObjectResponse,
): string {
  return `$${block.equation.expression}$`
}
