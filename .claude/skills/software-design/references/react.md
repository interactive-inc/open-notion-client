# React

設計（構造・選択）に関する指針。

## 命名と構成

- コンポーネント名は技術用語（Container, Wrapper）でなくビジネス名（ProductCard, PaymentForm）
- children で composition する
- shadcn/ui をベースにする。一から作らない

## レンダリング戦略

- 社内ツール・管理画面 ⇒ SPA
- 公開ページ ⇒ SSR
- 完全静的サイト ⇒ SSG
- ISR は使わない

## 状態管理

- 単方向データフロー: Props は下へ、イベントは上へ
- 状態はレンダー中に導出する。useEffect で同期しない
- データ取得は React Query のみ
- Context はグローバル変数と同等。基本使わない
- Context を許可する用途: 多言語、認証状態、ユーザー情報のみ
- 複雑なコンポーネント内の Props Drilling 回避には使ってよい
- フォーム状態や UI の開閉は Context に入れない
- Context を使うなら Reducer と組み合わせる

## 状態の選択

- 単純な値 ⇒ useState
- 更新パターンが複数 ⇒ useReducer / [Reducer](reducer.md)
- 関連する値をまとめロジックを持たせたい ⇒ Value Object クラス
- 状態遷移のルールが決まっている ⇒ FSM クラス
