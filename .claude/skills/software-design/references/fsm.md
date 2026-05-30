# 有限オートマトン (FSM)

状態遷移が明確な処理に使う。UI のステップウィザード、承認フロー、通信プロトコルなど。

## 実装の選び方

クラス分割: 状態ごとにデータ構造が異なる場合。状態固有のメソッドが多い(5個以上)場合。

```ts
type DraftProps = {
  items: ReadonlyArray<Item>
}

export class DraftOrder {
  constructor(private readonly props: DraftProps) {
    Object.freeze(this)
  }

  submit(): SubmittedOrder {
    return new SubmittedOrder({ items: this.props.items, submittedAt: new Date() })
  }
}

type SubmittedProps = {
  items: ReadonlyArray<Item>
  submittedAt: Date
}

export class SubmittedOrder {
  constructor(private readonly props: SubmittedProps) {
    Object.freeze(this)
  }

  approve(): ApprovedOrder {
    return new ApprovedOrder({ ...this.props, approvedAt: new Date() })
  }
}
```

Phantom Type: データ構造が共通で、利用可能な操作だけが状態によって異なる場合。メソッドの再利用が多い場合。

```ts
type Draft = "draft"
type Submitted = "submitted"
type Approved = "approved"

type Props = {
  content: string
}

export class Document<State extends string> {
  constructor(
    private readonly props: Props,
    private readonly state: State,
  ) {
    Object.freeze(this)
  }

  submit(this: Document<Draft>): Document<Submitted> {
    return new Document(this.props, "submitted")
  }

  approve(this: Document<Submitted>): Document<Approved> {
    return new Document(this.props, "approved")
  }

  get title(): string {
    return this.props.content.split("\n")[0]
  }
}
```

## 選択基準

- 状態ごとにデータが違う → クラス分割
- データは同じで操作が違う → Phantom Type
- 10状態以上 → クラス分割 + サブ状態に Phantom Type（ハイブリッド）
