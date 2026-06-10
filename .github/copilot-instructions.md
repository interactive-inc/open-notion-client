# Overview

NotionをTypeScript対応のデータベースとして扱うためのOSSライブラリ。Notion APIの複雑なJSON構造をシンプルな値に変換し、型安全なCRUD操作とMarkdown相互変換を提供する。

## Directory Structure

```text
lib/
├── index.ts                  # 公開API エントリポイント
├── types.ts                  # 型定義
├── models.ts                 # Zodスキーマ（別ビルドエントリ）
├── table/                    # メインAPI（NotionTable, SafeNotionTable等）
├── from-notion-block/        # Notion → Markdown変換
├── to-notion-block/          # Markdown → Notion変換
├── from-notion-property/     # Notionプロパティ → シンプルな値
├── to-notion-property/       # シンプルな値 → Notionプロパティ
└── modules/                  # NotionPageReference, NotionQueryResult
```

## Technical Features

- Bun（ランタイム・パッケージマネージャー）
- TypeScript 5.9 + tsgo（型チェック）
- tsdown（ビルド）
- vite-plus（リント・フォーマット）
- @notionhq/client, marked, zod

## Core Location

`lib/table/notion-table.ts` がCRUD操作の中心。各変換モジュールは1ブロックタイプ = 1ファイルの単一責務で構成。
