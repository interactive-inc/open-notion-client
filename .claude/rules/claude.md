---
paths: "CLAUDE.md"
---

# CLAUDE.md Structure

以下の順序でセクションを配置（不要なら省略可）：

- **Overview** - 1〜2文で簡潔に
- **Directory Structure** - `- \`path/\` - 説明` 形式
- **Tech Stack** - 技術名の箇条書き
- **Architecture** - 設計方針の箇条書き
- **Features** - 主要機能の箇条書き
- **Sitemap** - URLパス（`:リソース名` で動的セグメント）
- **Issues** - `- [カテゴリ] 内容（YYYY-MM-DD）` 形式
- **Notes** - 補足情報

## Example

```markdown
## Overview

社内向け在庫管理システム。商品の入出庫、在庫数の確認、発注アラートを提供する。

## Directory Structure

- `src/components/` - UIコンポーネント
- `src/pages/` - ページコンポーネント
- `src/api/` - APIクライアント
- `src/hooks/` - カスタムフック
- `src/utils/` - ユーティリティ関数

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Prisma + PostgreSQL

## Architecture

- フロントエンドとバックエンドは同一リポジトリ（モノリス）
- API は `/api` ルートで提供
- SSR + CSR のハイブリッド

## Features

- 認証（NextAuth.js）
- 多言語化（next-i18next）
- 決済（Stripe）

## Sitemap

- /
- /products
- /products/:product
- /orders
- /orders/:order
- /settings

## Issues

- [Prisma] DateTime型でタイムゾーンがUTCに強制される（2024-01-15）
- [Next.js] App Router で動的インポート時にSSRエラー発生、'use client' 必須（2024-01-20）

## Notes

- 本番環境は AWS にデプロイ
- CI/CD は GitHub Actions
```
