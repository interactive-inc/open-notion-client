See @.github/copilot-instructions.md for project overview and @package.json for available bun commands for this project.

## Additional Instructions

- @.github/instructions/core.instructions.md
- @.github/instructions/ts.instructions.md

## Project Summary

NotionをTypeScript対応のデータベースとして扱うためのラッパーライブラリ

### Main Features

- **NotionTable**: 型安全なCRUD操作（findMany, findOne, findById, create, update, delete, upsert等）
- **Markdown変換**: Notion blocks → Markdown の変換（双方向対応中）
- **プロパティ変換**: Notionの複雑なJSONをシンプルな値に変換
- **キャッシュ**: メモリキャッシュによるAPI呼び出し最適化

### Architecture

```text
lib/
├── table/                # NotionTable, クエリビルダー, キャッシュ
│   ├── notion-table.ts           # メインCRUD操作クラス
│   ├── notion-query-builder.ts   # フィルター/ソート構築
│   ├── notion-property-converter.ts # プロパティ変換
│   ├── notion-memory-cache.ts    # ページ/ブロックキャッシュ
│   └── notion-markdown.ts        # ブロックタイプ変換設定
├── from-notion-block/    # Notion → Markdown (30+ block types supported)
├── to-notion-block/      # Markdown → Notion (heading, list, code, paragraph)
├── from-notion-property/ # Notionプロパティ → 値
├── to-notion-property/   # 値 → Notionプロパティ
└── modules/              # NotionPageReference, NotionQueryResult
```

### Key Exports

```typescript
export { fromNotionBlock } from "./from-notion-block/from-notion-block"
export { fromNotionBlocks } from "./from-notion-block/from-notion-blocks"
export { NotionMarkdown } from "./table/notion-markdown"
export { NotionMemoryCache } from "./table/notion-memory-cache"
export { NotionPropertyConverter } from "./table/notion-property-converter"
export { NotionQueryBuilder } from "./table/notion-query-builder"
export { NotionTable } from "./table/notion-table"
export { toNotionBlocks } from "./to-notion-block/to-notion-blocks"
```

### Commands

```bash
bun run check     # 型チェック
bun run format    # リント/フォーマット
bun run build     # ビルド
bun test          # テスト実行
```

### Dependencies

- `@notionhq/client`: Notion公式APIクライアント
- `marked`: Markdownパーサー
- `zod`: ランタイムスキーマバリデーション
