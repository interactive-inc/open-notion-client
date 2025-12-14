---
paths: "**/*.value.ts"
---

# Value Object Instructions

あなたは以下のルールに従ってValueObjectを定義します。

- クラス名はValueで終わる
- イミュータブル
- 必要に応じてプロパティに説明を追加する
- nullの場合はnullable関数を使用する
- Optionalは使用しない

## for Zod

```ts
import { z } from "zod"

const vValue = z.string().max(128)

type Value = z.infer<typeof vValue>

export class NameValue {
  constructor(public readonly value: Value) {
    Object.assign(this, vValue.parse(value))
  }
}
```

## for Valibot

```ts
import { type InferInput, maxLength, parse, pipe, string } from "valibot"

const vValue = pipe(string(), maxLength(128))

type Value = InferInput<typeof vValue>

export class NameValue {
  constructor(public readonly value: Value) {
    Object.assign(this, parse(vValue, value))
  }
}
```
