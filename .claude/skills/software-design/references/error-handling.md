# エラーハンドリング

## バックエンド: Result 型パターン

throw しない。戻り値を `T | Error` にして、呼び出し側が `instanceof` で判別する。

```ts
export class PaymentFailedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "PaymentFailedError"
  }
}

export class PaymentService {
  constructor(private readonly props: Props) {
    Object.freeze(this)
  }

  async execute(data: PaymentData): Promise<Payment | PaymentFailedError> {
    const result = await this.props.gateway.charge(data)
    if (result instanceof Error) {
      return new PaymentFailedError(result.message)
    }
    return result
  }
}
```

呼び出し側:

```ts
const result = await service.execute(data)
if (result instanceof PaymentFailedError) {
  // エラー処理
}
// 正常処理
```

## フロントエンド: ErrorBoundary

React では ErrorBoundary で throw されたエラーをキャッチし、UI で表示する。

## ルール

- バックエンドでは throw しない。`T | Error` で返す
- カスタムエラークラスを定義して `instanceof` で判別する
- try-catch のネストを避ける。外部ライブラリの呼び出しだけ try-catch で包む
- Effect ライブラリは使わない。標準の Error を使う
- フロントエンドでは ErrorBoundary を使う
