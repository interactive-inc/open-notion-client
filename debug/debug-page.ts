import { Client } from "@notionhq/client"
import { NotionTable } from "@/table/notion-table"

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

const dataSourceId = process.env.NOTION_DATA_SOURCE_ID ?? ""
const pageId = process.env.NOTION_DEBUG_PAGE_ID ?? "d6ba86eb-e312-4999-be13-f3c01aeb500c"

if (dataSourceId === "") {
  console.error("環境変数 NOTION_DATA_SOURCE_ID を設定してください")
  process.exit(1)
}

const table = new NotionTable({
  client: notion,
  dataSourceId: dataSourceId,
  properties: {
    title: { type: "title" },
  } as const,
})

try {
  const pageRef = await table.findById(pageId)

  if (pageRef === null) {
    console.error(`ページ ${pageId} が見つかりません`)
    process.exit(1)
  }

  console.log("ページプロパティ:", pageRef.properties())

  const markdown = await pageRef.body()
  console.log("取得したマークダウン:")
  console.log(markdown)
  console.log("---")

  console.log("ページ本文を更新中...")
  await table.update(pageRef.id, {
    properties: {},
    body: markdown,
  })

  console.log("ページの更新が完了しました")
} catch (error) {
  console.error("エラーが発生しました:", error)
  process.exit(1)
}
