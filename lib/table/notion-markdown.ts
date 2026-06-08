import type { BlockObjectRequest } from "@notionhq/client/build/src/api-endpoints"

type HeadingType = "heading_1" | "heading_2" | "heading_3"

/**
 * Markdownから生成されたNotionブロックに対する見出しレベルの差し替え設定
 *
 * 例えば`{ heading_1: "heading_2" }`と指定するとh1で書かれたブロックをh2として扱う
 * Notion APIはblock.typeと中身のkeyが一致している必要があるため、両方を同時に書き換える
 */
export type BlockTypeMapping = {
  heading_1?: HeadingType
  heading_2?: HeadingType
  heading_3?: HeadingType
}

type HeadingBlock = Extract<BlockObjectRequest, { type?: HeadingType }>

function isHeadingBlock(block: BlockObjectRequest): block is HeadingBlock {
  if (!("type" in block) || typeof block.type !== "string") {
    return false
  }
  return block.type === "heading_1" || block.type === "heading_2" || block.type === "heading_3"
}

export class NotionMarkdown {
  private readonly blockTypeMapping: BlockTypeMapping

  constructor(blockTypeMapping: BlockTypeMapping = {}) {
    this.blockTypeMapping = blockTypeMapping
    Object.freeze(this)
  }

  /**
   * 単一のNotionブロックを設定に従って差し替える
   * 対応外の型・マッピング未設定の場合は元のブロックを返す
   */
  enhanceBlock(block: BlockObjectRequest): BlockObjectRequest {
    if (!isHeadingBlock(block)) {
      return block
    }

    const from = block.type as HeadingType
    const to = this.blockTypeMapping[from]

    if (!to || to === from) {
      return block
    }

    const content = (block as Record<string, unknown>)[from]

    return {
      type: to,
      [to]: content,
    } as BlockObjectRequest
  }

  withMapping(blockTypeMapping: BlockTypeMapping): NotionMarkdown {
    return new NotionMarkdown(blockTypeMapping)
  }

  getMapping(): BlockTypeMapping {
    return { ...this.blockTypeMapping }
  }
}
