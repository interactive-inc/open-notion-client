# レイヤードアーキテクチャ

Interface → Application → Domain → Infrastructure。依存は一方向で逆転させない。小規模では層を分けない。段階的に導入する。

## 層の構成

- Interface: HTTP リクエスト／レスポンス、認証、バリデーション
- Application: 複数ドメインオブジェクトの調整。1 Service = 1 ユースケース
- Domain: Entity、Value Object、ビジネスルール、不変条件
- Infrastructure: DB アクセス、外部 API 通信

## 依存ルール

- 依存は上位層から下位層への一方向。逆転しない（DIP は採用しない）
- 抽象化（interface、抽象クラス）を作らない。具体クラスを直接使う
- TypeScript の `interface` 構文は使わない。`type` で表す
- DI コンテナを使わない。コンストラクタ注入のみ
- DB 接続・API キーは環境変数で受け、トップレベルで具体クラスを生成して下位層に渡す（バケツリレー）

## Interface 層

バリデーションと認証を行い、ビジネスロジックは Application 層に委譲する。エラーは `instanceof` で分岐してユーザー向けレスポンスに変換する。

## Application 層

Service クラスで実装。メソッド名は `execute` で統一。戻り値は `T | Error` で throw しない。

単純な CRUD は Service を経由しない。複数の処理を組み合わせる場合のみ Service を作る。

## Domain 層

Entity はイミュータブル（Object.freeze）。状態変更は `with*()` で新しいインスタンスを返す。

Entity はフラットに保つ。他の Entity を入れ子にしない。関連データは JOIN してフラットに展開する。

集約ルートは守るべき不変条件ごとに分ける。

## Infrastructure 層

Repository は集約ルートごとに作成（具体クラス、interface なし）。メソッドは `findOne`, `findMany`, `write`, `delete` の四種に限定。複雑な検索メソッドは作らない。検索条件は `where` 引数で表現する。

外部 API は Adapter で包む（具体クラス、interface なし）。

## エラーの流れ

Infrastructure（技術エラー） → Application（アプリエラーに変換） → Interface（ユーザー向けレスポンスに変換）

すべて `T | Error` で返す。throw しない。
