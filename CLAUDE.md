# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

- @./package.json

## Rules

- Always respond in Japanese.
- Use Bun instead of npm or yarn for package management and scripts.
- Don't downgrade any dependencies; keep the latest versions.

## Overview

NotionをTypeScript対応のデータベースとして扱うためのOSSライブラリ。Notion APIの複雑なJSON構造をシンプルな値に変換し、型安全なCRUD操作とMarkdown相互変換を提供する。

## Commands

```bash
bun run check              # 型チェック（tsgo使用）
bun run fmt                # フォーマット（vite-plus使用）
bun run lint               # リント（vite-plus使用）
bun run build              # tsdownでビルド
bun test                   # 全テスト実行
bun test <file>            # 単一テスト実行（例: bun test lib/table/notion-table.test.ts）
```

## Architecture

```text
lib/
├── index.ts                  # 公開API エントリポイント
├── types.ts                  # 型定義
├── models.ts                 # Zodスキーマ（別ビルドエントリ）
├── enhance.ts                # ブロック再帰取得ヘルパー
├── retry.ts                  # 指数バックオフ付きリトライ
├── with-concurrency.ts       # 並行実行制御
├── utils.ts                  # 内部ユーティリティ
├── notion-types.ts           # Notion APIフィルター型
├── table/                    # メインAPI
│   ├── notion-table.ts       # CRUD操作クラス（findMany, create, update, delete等）
│   ├── safe-notion-table.ts  # 例外の代わりにT | Errorを返すラッパー
│   ├── notion-query-builder.ts    # フィルター/ソート構築
│   ├── notion-property-converter.ts # プロパティ変換
│   ├── notion-memory-cache.ts # ページ/ブロックキャッシュ
│   └── notion-markdown.ts    # 見出しレベル変換設定
├── from-notion-block/        # Notion → Markdown変換（27ブロックタイプ対応）
├── to-notion-block/          # Markdown → Notion変換
├── from-notion-property/     # Notionプロパティ → シンプルな値
├── to-notion-property/       # シンプルな値 → Notionプロパティ
└── modules/                  # NotionPageReference, NotionQueryResult
```

## Tech Stack

- TypeScript 5.9
- Bun（ランタイム・パッケージマネージャー）
- @notionhq/client（Notion API公式クライアント）
- marked（Markdownパーサー）
- zod（スキーマバリデーション）
- tsdown（ビルドツール）
- vite-plus（リンター・フォーマッター）
- VitePress（ドキュメントサイト）

## Features

- ORM風CRUD操作（create, findMany, update, delete, upsert）
- バッチ操作（createMany, updateMany, deleteMany）並行実行対応
- クエリビルダー（フィルター・ソート・ページネーション）
- プロパティ双方向変換（Notion JSON ↔ シンプルな値）
- Markdown双方向変換（27ブロックタイプ対応）
- インメモリキャッシュ（ページ・ブロック）
- ソフトデリート（アーカイブ・リストア）
- Safeモード（.safeで例外の代わりにT | Errorを返す）
- 自動リトライ（429/5xxに対する指数バックオフ）

## Key Patterns

- テストファイルはソースと同ディレクトリに `*.test.ts` として配置
- 各変換関数は単一責務（1ブロックタイプ = 1ファイル）
- `marked`ライブラリでMarkdownをパース、`zod`でスキーマバリデーション
- 3層コンバーターパターン（スキーマ → ルーター → 個別ハンドラー）

## Notes

- Notion APIにはレート制限あり（平均3リクエスト/秒）。バッチ操作やキャッシュ活用を検討する
