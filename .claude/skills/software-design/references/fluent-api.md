# Fluent API

新しいオブジェクトを返して不変性とメソッドチェーンを両立する。

```ts
type Props = {
  title: string
  author: string
}

export class Document {
  constructor(private readonly props: Props) {
    Object.freeze(this)
  }

  withTitle(title: string): Document {
    return new Document({ ...this.props, title })
  }

  toMarkdown(): string {
    return `# ${this.props.title}\nby ${this.props.author}`
  }
}
```
