---
paths: "**/*.entity.ts"
---

# Entity Instructions

あなたは以下のルールに従ってEntityを定義します。

- クラス名はEntityで終わる
- イミュータブル
- 必要に応じて値オブジェクトを定義する
- 必要に応じてプロパティに説明を追加する
- nullの場合はnullable()を使用する
- Optionalは使用しない

## for Zod

```ts
import { z } from "zod"
import { NameValue } from "@/domain/values/name.value"

const PropsSchema = z.object({
  id: z.string(),
  name: z.instanceof(NameValue),
  description: z.string().nullable(),
  createdAt: z.date(),
  isDeleted: z.boolean(),
})

type Props = z.infer<typeof PropsSchema>

export class UserEntity implements Props {
  readonly id!: Props["id"]

  /**
   * 名前
   */
  readonly name!: Props["name"]

  readonly description!: Props["description"]

  readonly createdAt!: Props["createdAt"]

  readonly isDeleted!: Props["isDeleted"]

  constructor(private readonly props: Props) {
    Object.assign(this, PropsSchema.parse(props))
  }

  updateName(name: NameValue) {
    return new UserEntity({ ...this.props, name })
  }

  delete() {
    return new UserEntity({ ...this.props, isDeleted: true })
  }
}
```

## for Valibot

```ts
import { NameValue } from "@/domain/values/name.value"
import { object, string, instance, nullable, boolean } from "valibot"

const vProps = object({
  id: string(),
  name: instance(NameValue),
  description: nullable(string())
  createdAt: instance(Date)
  isDeleted: boolean(),
})

type Props = InferInput<typeof vProps>

export class UserEntity implements Props {
  readonly id!: Props["id"]

  /**
   * 名前
   */
  readonly name!: Props["name"]

  readonly description!: Props["description"]

  readonly createdAt!: Props["createdAt"]

  readonly isDeleted!: Props["isDeleted"]

  constructor(private readonly props: Props) {
    Object.assign(this, parse(vProps, props))
  }

  updateName(name: NameValue) {
    return new UserEntity({ ...this.props, name })
  }

  delete() {
    return new UserEntity({ ...this.props, isDeleted: true })
  }
}
```
