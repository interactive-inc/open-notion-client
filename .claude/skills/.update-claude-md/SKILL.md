---
name: update-claude-md
description: ユーザと対話してCLAUDE.mdを初期化・更新する
---

# CLAUDE.md の初期化・更新

`CLAUDE.md` のプロジェクト情報を確認し、不足があれば対話で収集して更新する。

## 前提

- 既存の CLAUDE.md の内容（参照ファイル、指示など）は保持する
- 新しいセクションは既存コンテンツの後に追加する

## ワークフロー

- コード分析: コードベースから自動抽出できる情報を収集
- 差分特定: CLAUDE.md と比較し、不足・古い情報を洗い出す
- 質問: 自動抽出できなかった情報のみ `AskUserQuestion` で質問
- 更新: 収集した情報で CLAUDE.md を更新

## 自動抽出する情報

- Directory Structure - ファイル構造から
- Tech Stack - package.json, requirements.txt などから
- Sitemap - ルーティング設定から
- Architecture - 設定ファイル・コードから推測：
  - インフラ構成（vercel.json, Dockerfile など）
  - レンダリング戦略（SSR/CSR/SSG）
  - データ管理（ORM, 状態管理）
  - API通信の有無
- Features - 主要機能を抽出：
  - 認証（NextAuth, Firebase Auth など）
  - 多言語化（i18n 設定）
  - 決済（Stripe SDK など）
  - 外部サービス連携（API、SaaS など）
  - その他検出した機能

## 質問する情報

自動抽出できない場合のみ質問：

- 目的 - このアプリは何をするか
- 制約・注意点 - 守るべきルール、避けるべきこと

## CLAUDE.md の構造

以下の順序でセクションを配置（不要なら省略可）：

- Overview - 1〜2文で簡潔に
- Directory Structure - `- \`path/\` - 説明` 形式
- Tech Stack - 技術名の箇条書き
- Architecture - 設計方針の箇条書き
- Features - 主要機能の箇条書き
- Sitemap - URLパス（`:リソース名` で動的セグメント）
- Issues - `- [カテゴリ] 内容（YYYY-MM-DD）` 形式
- Notes - 補足情報

## 出力例

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
