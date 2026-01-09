---
description: 'ユーザと対話してCLAUDE.mdを初期化・更新する'
---

# CLAUDE.md の初期化・更新

`CLAUDE.md` のプロジェクト情報を確認し、不足があれば対話で収集して更新する。

## 前提

- 既存の CLAUDE.md の内容（参照ファイル、指示など）は保持する
- 新しいセクションは既存コンテンツの後に追加する

## ワークフロー

1. **コード分析**: コードベースから自動抽出できる情報を収集
2. **差分特定**: CLAUDE.md と比較し、不足・古い情報を洗い出す
3. **質問**: 自動抽出できなかった情報のみ `AskUserQuestion` で質問
4. **更新**: 収集した情報で CLAUDE.md を更新

## 自動抽出する情報

- **Directory Structure** - ファイル構造から
- **Tech Stack** - package.json, requirements.txt などから
- **Sitemap** - ルーティング設定から
- **Architecture** - 設定ファイル・コードから推測：
  - インフラ構成（vercel.json, Dockerfile など）
  - レンダリング戦略（SSR/CSR/SSG）
  - データ管理（ORM, 状態管理）
  - API通信の有無
- **Features** - 主要機能を抽出：
  - 認証（NextAuth, Firebase Auth など）
  - 多言語化（i18n 設定）
  - 決済（Stripe SDK など）
  - 外部サービス連携（API、SaaS など）
  - その他検出した機能

## 質問する情報

自動抽出できない場合のみ質問：

- **目的** - このアプリは何をするか
- **制約・注意点** - 守るべきルール、避けるべきこと
