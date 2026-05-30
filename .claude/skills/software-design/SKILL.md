---
name: software-design
description: "?"
user-invocable: false
disable-model-invocation: false
metadata:
  author: shigurenimo
  description: 製品設計・UI 設計・ドメイン設計・コード設計をカバーする設計指針スキル。
  dev: true
  tags: [docs]
---

> このスキルを更新するときは [README.md](README.md) の方針に従う。

# Product Design

Jesse James Garrett's UX 5 planes (Strategy, Scope). Ref: [ux-five-planes.md](references/ux-five-planes.md)

- JTBD: 機能の前に「顧客が雇うジョブ」を特定する
- Scenario: 「クリックする」でなく「迷う／安心する」を書く

# UI Design

OOUI + UX 5 planes (Structure, Skeleton, Surface). Ref: [ux-five-planes.md](references/ux-five-planes.md)

## OOUI

- 名詞→動詞: 対象を選んでから操作を選ぶ
- メニュー項目は名詞（「登録する」でなく「利用者」）
- オブジェクトごとに一覧と詳細
- Modeless: 線形フロー強制禁止、複数経路で到達できる
- 構造はオブジェクトで作る（タスクは変わる、オブジェクトは残る）

## Screen Order

操作順でなく、不安を解消する順に並べる。

# Domain Design

Eric Evans's DDD (Strategic): aggregate, invariant, boundary. 概念モデルのみ、実装は Code Design。

## Aggregate & Invariant

- 集約: 整合性を保つオブジェクトの一塊
- 不変条件: 集約境界で常に守るルール
- 集約ルートは不変条件ごとに分ける
- 不変条件を持つロジックは Domain 層として独立させる

## Entity & Value Object

- Entity: 同一性 (ID) を持つ
- Value Object: 値そのもの、同一性なし

# Code Design

Kent Beck's Simple Design: passes tests, reveals intent, no duplication, fewest elements.

## Type Honesty

- `as unknown as T` や `any` を使いたくなったら設計の歪み
- 抽象化（interface、抽象クラス）を作らない。具体クラスを直接使う
- TypeScript の `interface` 構文は使わない、`type` で表す

## Structure

- 入力→出力 ⇒ 関数
- 設定保持＋複数操作（API client、DB 接続）⇒ クラス
- 不変データ＋ロジック不要 ⇒ type
- 引数 4 超 ⇒ Builder or オブジェクト引数

## Entity Implementation

- イミュータブル（Object.freeze）
- 状態変更は `with*()` で新インスタンス
- フラットに保つ、他の Entity を入れ子にしない

## Value Object Implementation

- バリデーション付き値（Zod + Object.freeze）
- 判定ロジックは getter
- 複数値の更新は `with*()`

詳細 ⇒ [value-object.md](references/value-object.md)

## Layered Architecture

依存方向は Interface → Application → Domain → Infrastructure の一方向、逆転させない。

- 単純 CRUD ⇒ 直接実装、層を分けない
- 複数処理関連 or 重複ロジック ⇒ Service 層
- DI コンテナ禁止、コンストラクタ注入のみ
- DB 接続・API キーは env で受け、トップで具体クラス生成して下位に渡す（バケツリレー）
- 判断軸: モックなしでテストできるか

詳細 ⇒ [architecture.md](references/architecture.md)

## Patterns

- 変換チェーン ⇒ [Fluent API](references/fluent-api.md)
- 複数リソース調整 (3+) ⇒ [Service Layer](references/service-layer.md)
- API 簡略化 ⇒ Facade
- 状態遷移 ⇒ [FSM](references/fsm.md)
- 型レベル状態区別・単位混同防止・バリデーション前後 ⇒ [Phantom Type](references/phantom-type.md)
- 生成パターンが複数 ⇒ Factory Method
- 外部 interface 変換 ⇒ Adapter（具体クラス）
- UI 非同期状態（ブラウザ／CLI）⇒ [Reducer](references/reducer.md)（バックエンド禁止）

## Error Handling

- バックエンド: throw しない、`T | Error` を戻す、`instanceof` で判別
- フロントエンド: ErrorBoundary

詳細 ⇒ [error-handling.md](references/error-handling.md)

## TypeScript Mapping

Beck's Implementation Patterns ⇒ TS:

- クラス継承 ⇒ Union 型 + exhaustive switch
- Interface ⇒ type + 関数
- Method Object ⇒ クロージャ or オブジェクト引数
- Collection wrapper ⇒ ReadonlyArray + utils

## React

詳細 ⇒ [react.md](references/react.md)
