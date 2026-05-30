# Value Object

プリミティブ値: Zod でバリデーション、getter で判定ロジック。

```ts
const emailSchema = z.string().email()

export class Email {
  constructor(private readonly value: string) {
    emailSchema.parse(value)
    Object.freeze(this)
  }

  get isCompanyEmail(): boolean {
    return this.value.endsWith("@example.co.jp")
  }

  get domain(): string {
    return this.value.split("@")[1]
  }

  equals(other: Email): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
```

オブジェクト値: `with*()` で不変更新、計算結果は getter。

```ts
const personNameSchema = z.object({
  first: z.string().min(1),
  last: z.string().min(1),
})

type Props = z.infer<typeof personNameSchema>

export class PersonName {
  constructor(private readonly props: Props) {
    personNameSchema.parse(props)
    Object.freeze(this)
  }

  get fullName(): string {
    return `${this.props.last} ${this.props.first}`
  }

  withFirst(first: string): PersonName {
    return new PersonName({ ...this.props, first })
  }

  equals(other: PersonName): boolean {
    return this.props.first === other.props.first && this.props.last === other.props.last
  }
}
```

ルール:

- コンストラクタで Object.freeze
- Zod でバリデーション + 型推論
- プリミティブ値は getter、複数値は `with*()` で更新
- 判定ロジックは getter (`isXxx`, `hasXxx`)
- 等価比較は `equals()` で値比較
