# Reducer

ユーザ入力に対して非同期で状態を更新する UI（ブラウザ、CLI）で使う。バックエンドでは使わない。

## 書き方

Action は Union Type で定義。Reducer は純粋関数。非同期処理は Reducer の外で行い、結果を Action として dispatch する。

```ts
type State = {
  items: ReadonlyArray<Item>
  total: number
}

type Action = { type: "add"; item: Item } | { type: "remove"; index: number } | { type: "clear" }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "add":
      const items = [...state.items, action.item]
      return { items, total: calcTotal(items) }
    case "remove":
      const remaining = state.items.filter((_, i) => i !== action.index)
      return { items: remaining, total: calcTotal(remaining) }
    case "clear":
      return { items: [], total: 0 }
  }
}
```

## ルール

- Reducer は純粋関数。副作用を入れない
- 状態は常に新しいオブジェクトを返す（イミュータブル）
- Action の type は Union Type で厳密に定義する
- 非同期処理は Reducer の外で実行し、結果を dispatch する
- Props Drilling が深くなったら Context と組み合わせる
