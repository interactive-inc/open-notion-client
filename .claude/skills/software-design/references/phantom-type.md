# Phantom Type

実行時に存在しない型パラメータでコンパイル時の安全性を得るパターン。
FSM での状態遷移は [fsm.md](fsm.md) を参照。ここでは FSM 以外の用途を扱う。

## `_phantom!` で構造的型付けを回避する

TypeScript は構造的型付けなので、同じ形の型は互換と見なされる。`_phantom!` を入れることで型パラメータの違いを強制する。

```ts
type Props = {
  amount: number
}

export class Money<Currency> {
  private readonly _phantom!: Currency

  constructor(private readonly props: Props) {
    Object.freeze(this)
  }

  add(other: Money<Currency>): Money<Currency> {
    return new Money<Currency>({ amount: this.props.amount + other.props.amount })
  }
}

type USD = { currency: "USD" }
type JPY = { currency: "JPY" }

const dollars = new Money<USD>({ amount: 100 })
const yen = new Money<JPY>({ amount: 1000 })

dollars.add(yen) // コンパイルエラー: USD と JPY は混ぜられない
```

## バリデーション前後の区別

未検証データと検証済みデータを型で分けて、未検証のまま使うことをコンパイル時に防ぐ。

```ts
type Unvalidated = { validated: false }
type Validated = { validated: true }

type Props = {
  data: Record<string, string>
}

export class UserInput<State> {
  private readonly _phantom!: State

  constructor(private readonly props: Props) {
    Object.freeze(this)
  }

  static raw(data: Record<string, string>): UserInput<Unvalidated> {
    return new UserInput<Unvalidated>({ data })
  }

  validate(this: UserInput<Unvalidated>): UserInput<Validated> {
    return new UserInput<Validated>(this.props)
  }

  save(this: UserInput<Validated>): void {
    // Validated でのみ呼べる
  }
}

const input = UserInput.raw({ name: "Alice" })
input.save() // コンパイルエラー: 未検証
input.validate().save() // OK
```

## いつ使うか

- 同じ構造だが意味が違う値を混ぜたくない（通貨、単位）
- 処理の前後で状態が変わり、順序を強制したい（バリデーション、認証）
