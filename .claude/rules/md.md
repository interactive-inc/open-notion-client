---
description: Markdown formatting rules for all .md files in this repo
paths:
  - "**/*.md"
---

# Markdown Formatting Rules

- Write in Japanese
- Do not use asterisks
- Do not use numbers in headings
- Do not use tables in committed .md files and generated documents.
- Insert blank lines before and after headings
- Always insert a blank line between headings and content text

## Table exception

Tables are allowed when the table itself is the deliverable — a row-by-row correspondence that bullets would break.

- `dgm-a-product-content-map` の成果物（`workspace/dgm-a-product/*/content-*.md` と案件フォルダの `README.md`）。node-id / スロット名 / フォントサイズ / status が1行で対応しており、箇条書きにすると流し込み側がどの値をどこへ入れるか特定できなくなる
- `dgm-a-product-sitemap` の統合テーブル。列構成（# / ページ / ディレクトリ / 種別・CMS / title / description / robots / 備考）が成果物の仕様として決まっている

この例外は「対応表が成果物の中核であるもの」に限る。レポート・報告・説明文は箇条書きで書く（`~/.claude/CLAUDE.md` の出力フォーマット）。
