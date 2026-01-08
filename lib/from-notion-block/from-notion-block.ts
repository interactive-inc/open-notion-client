import { fromNotionAudioBlock } from "@/from-notion-block/from-notion-audio-block"
import { fromNotionBookmarkBlock } from "@/from-notion-block/from-notion-bookmark-block"
import { fromNotionBulletedListItemBlock } from "@/from-notion-block/from-notion-bulleted-list-item-block"
import { fromNotionCalloutBlock } from "@/from-notion-block/from-notion-callout-block"
import { fromNotionChildDatabaseBlock } from "@/from-notion-block/from-notion-child-database-block"
import { fromNotionChildPageBlock } from "@/from-notion-block/from-notion-child-page-block"
import { fromNotionCodeBlock } from "@/from-notion-block/from-notion-code-block"
import { fromNotionColumnBlock } from "@/from-notion-block/from-notion-column-block"
import { fromNotionColumnListBlock } from "@/from-notion-block/from-notion-column-list-block"
import { fromNotionDividerBlock } from "@/from-notion-block/from-notion-divider-block"
import { fromNotionEmbedBlock } from "@/from-notion-block/from-notion-embed-block"
import { fromNotionEquationBlock } from "@/from-notion-block/from-notion-equation-block"
import { fromNotionFileBlock } from "@/from-notion-block/from-notion-file-block"
import { fromNotionHeadingOneBlock } from "@/from-notion-block/from-notion-heading-one-block"
import { fromNotionHeadingThreeBlock } from "@/from-notion-block/from-notion-heading-three-block"
import { fromNotionHeadingTwoBlock } from "@/from-notion-block/from-notion-heading-two-block"
import { fromNotionImageBlock } from "@/from-notion-block/from-notion-image-block"
import { fromNotionLinkPreviewBlock } from "@/from-notion-block/from-notion-link-preview-block"
import { fromNotionLinkToPageBlock } from "@/from-notion-block/from-notion-link-to-page-block"
import { fromNotionNumberedListItemBlock } from "@/from-notion-block/from-notion-numbered-list-item-block"
import { fromNotionParagraphBlock } from "@/from-notion-block/from-notion-paragraph-block"
import { fromNotionPdfBlock } from "@/from-notion-block/from-notion-pdf-block"
import { fromNotionQuoteBlock } from "@/from-notion-block/from-notion-quote-block"
import { fromNotionTableBlock } from "@/from-notion-block/from-notion-table-block"
import { fromNotionToDoBlock } from "@/from-notion-block/from-notion-to-do-block"
import { fromNotionToggleBlock } from "@/from-notion-block/from-notion-toggle-block"
import { fromNotionVideoBlock } from "@/from-notion-block/from-notion-video-block"
import type { NotionBlock } from "@/types"

/**
 * 単一のNotionブロックをマークダウンテキストに変換する
 */
export function fromNotionBlock(block: NotionBlock): string {
  if (block.type === "paragraph") {
    return fromNotionParagraphBlock(block)
  }

  if (block.type === "heading_1") {
    return fromNotionHeadingOneBlock(block)
  }

  if (block.type === "heading_2") {
    return fromNotionHeadingTwoBlock(block)
  }

  if (block.type === "heading_3") {
    return fromNotionHeadingThreeBlock(block)
  }

  if (block.type === "bulleted_list_item") {
    return fromNotionBulletedListItemBlock(block)
  }

  if (block.type === "numbered_list_item") {
    return fromNotionNumberedListItemBlock(block)
  }

  if (block.type === "code") {
    return fromNotionCodeBlock(block)
  }

  if (block.type === "quote") {
    return fromNotionQuoteBlock(block)
  }

  if (block.type === "callout") {
    return fromNotionCalloutBlock(block)
  }

  if (block.type === "divider") {
    return fromNotionDividerBlock(block)
  }

  if (block.type === "to_do") {
    return fromNotionToDoBlock(block)
  }

  if (block.type === "toggle") {
    return fromNotionToggleBlock(block)
  }

  if (block.type === "image") {
    return fromNotionImageBlock(block)
  }

  if (block.type === "video") {
    return fromNotionVideoBlock(block)
  }

  if (block.type === "file") {
    return fromNotionFileBlock(block)
  }

  if (block.type === "pdf") {
    return fromNotionPdfBlock(block)
  }

  if (block.type === "audio") {
    return fromNotionAudioBlock(block)
  }

  if (block.type === "embed") {
    return fromNotionEmbedBlock(block)
  }

  if (block.type === "bookmark") {
    return fromNotionBookmarkBlock(block)
  }

  if (block.type === "link_preview") {
    return fromNotionLinkPreviewBlock(block)
  }

  if (block.type === "table") {
    return fromNotionTableBlock(block)
  }

  if (block.type === "equation") {
    return fromNotionEquationBlock(block)
  }

  if (block.type === "column_list") {
    return fromNotionColumnListBlock(block)
  }

  if (block.type === "column") {
    return fromNotionColumnBlock(block)
  }

  if (block.type === "child_page") {
    return fromNotionChildPageBlock(block)
  }

  if (block.type === "child_database") {
    return fromNotionChildDatabaseBlock(block)
  }

  if (block.type === "link_to_page") {
    return fromNotionLinkToPageBlock(block)
  }

  return `<!-- 未対応のブロックタイプ: ${block.type} -->`
}
