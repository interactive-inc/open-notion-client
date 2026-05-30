# Service Layer

複数のドメインオブジェクトと外部リソースを調整する。3つ以上の関連操作を調整するときに使う。

```ts
type Props = {
  fileSystem: FileSystem
  parser: Parser
  validator: Validator
}

export class DocumentService {
  constructor(private readonly props: Props) {
    Object.freeze(this)
  }

  async process(path: string): Promise<Document> {
    const content = await this.props.fileSystem.read(path)
    const parsed = this.props.parser.parse(content)
    return new Document(this.props.validator.validate(parsed))
  }
}
```
