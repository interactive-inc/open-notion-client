# notion-client

Notionを型安全なデータベースとして扱うためのTypeScriptライブラリ。NotionブロックとMarkdownの相互変換、シンプルなデータベース操作を提供します。

https://interactive-inc.github.io/open-notion-client/

## Notionをデータベースとして使う

Notion APIを直接扱うのは大変です。APIレスポンスにはテキストの色、太字/斜体スタイル、アノテーション、深くネストされたメタデータ構造など、膨大なフォーマット情報が含まれています。シンプルなデータベースクエリが、複雑なパース処理になってしまいます。

例えば、単純なテキスト値を取得するだけでも、複数のネストされたオブジェクトを辿る必要があります：

```json
{
  "properties": {
    "Name": {
      "id": "title",
      "type": "title",
      "title": [{
        "type": "text",
        "text": { "content": "Hello World" },
        "annotations": { "bold": false, "italic": false, "color": "default" },
        "plain_text": "Hello World"
      }]
    }
  }
}
```

notion-clientはこれを `{ name: "Hello World" }` にシンプル化し、Notionを従来のデータベースのように簡単に使えるようにします。

## 特徴

- **双方向変換**: NotionブロックとMarkdownテキストの相互変換
- **型安全なデータベース操作**: Notionデータベースに対する型付きCRUD操作
- **ブロックタイプサポート**: 25種類以上のNotionブロックタイプに対応（段落、見出し、リスト、コード、テーブル、To-do、トグルなど）
- **リッチテキストフォーマット**: 太字、斜体、取り消し線、インラインコードに対応
- **再帰的ブロック取得**: ネストされた子ブロックを自動的に取得
- **高度なクエリ**: フィルター、ソート、ページネーションをサポート

## インストール

```bash
bun i @interactive-inc/notion-client
```

## 使い方

### 型安全なデータベース操作

```typescript
import { Client } from '@notionhq/client'
import { NotionTable } from '@interactive-inc/notion-client'

const client = new Client({ auth: process.env.NOTION_TOKEN })

const tasksTable = new NotionTable({
  client,
  dataSourceId: 'your-database-id',
  properties: {
    title: { type: 'title' },
    status: { type: 'select', options: ['todo', 'in_progress', 'done'] },
    priority: { type: 'number' },
    tags: { type: 'multi_select', options: ['bug', 'feature', 'enhancement'] }
  } as const
})

// レコードを作成
const task = await tasksTable.create({
  properties: {
    title: '新機能を実装する',
    status: 'todo',
    priority: 1,
    tags: ['feature']
  }
})

// フィルターとソートでレコードを検索
const tasks = await tasksTable.findMany({
  where: {
    status: 'in_progress',
    priority: { greater_than_or_equal_to: 3 }
  },
  sorts: [{ field: 'priority', direction: 'desc' }],
  count: 10
})

// レコードを更新
await tasksTable.update(task.id, {
  properties: {
    status: 'done'
  }
})
```

### Markdownコンテンツの操作

```typescript
import { NotionTable, NotionMarkdown } from '@interactive-inc/notion-client'

// 見出しレベルを変換するMarkdownエンハンサーを作成
const markdown = new NotionMarkdown({
  heading_1: 'heading_2',  // H1をH2に変換
  heading_2: 'heading_3'   // H2をH3に変換
})

// Markdownサポート付きでテーブルを作成
const blogTable = new NotionTable({
  client,
  dataSourceId: 'your-blog-database-id',
  properties: {
    title: { type: 'title' },
    content: { type: 'rich_text' }
  } as const,
  markdown  // オプション: 保存前にMarkdownを変換
})

// Markdownコンテンツで投稿を作成
const post = await blogTable.create({
  properties: {
    title: 'ブログ記事'
  },
  body: `# はじめに

**太字**と*斜体*を含む段落です。

## 機能
- 機能1
- 機能2

\`\`\`typescript
const hello = "world"
\`\`\`
`
})
```

### 高度なクエリ

```typescript
// 演算子を使った複雑なクエリ
const results = await tasksTable.findMany({
  where: {
    or: [
      { status: 'todo' },
      {
        and: [
          { priority: { greater_than_or_equal_to: 5 } },
          { tags: { contains: 'urgent' } }
        ]
      }
    ]
  },
  sorts: [
    { field: 'priority', direction: 'desc' },
    { field: 'created_time', direction: 'asc' }
  ],
  count: 20
})

// 1件のレコードを検索
const urgentTask = await tasksTable.findOne({
  where: {
    status: 'todo',
    priority: { greater_than_or_equal_to: 8 }
  }
})

// 複数レコードを更新
const count = await tasksTable.updateMany({
  where: { status: 'todo' },
  update: {
    properties: {
      status: 'in_progress'
    }
  }
})
```

## 対応ブロックタイプ

### ブロックタイプマッピング

| Markdown | Notionブロックタイプ | 例 |
| -------- | ------------------- | -- |
| プレーンテキスト | `paragraph` | Hello world |
| `# 見出し1` | `heading_1` | # タイトル |
| `## 見出し2` | `heading_2` | ## サブタイトル |
| `### 見出し3` | `heading_3` | ### セクション |
| `- アイテム` | `bulleted_list_item` | - リスト項目 |
| `1. アイテム` | `numbered_list_item` | 1. 最初の項目 |
| `` ```code``` `` | `code` | ```js<br>console.log()<br>``` |
| `> 引用` | `quote` | > 引用テキスト |
| `- [ ] タスク` | `to_do`（未完了） | - [ ] やること |
| `- [x] タスク` | `to_do`（完了） | - [x] 完了 |
| `---` | `divider` | 水平線 |
| `$equation$` | `equation` | $E = mc^2$ |
| `**太字**` | 太字リッチテキスト | **重要** |
| `*斜体*` | 斜体リッチテキスト | *強調* |
| `~~取り消し~~` | 取り消し線リッチテキスト | ~~削除~~ |
| `` `code` `` | コードリッチテキスト | `variable` |

### Notion → Markdown

#### テキストブロック

- 段落ブロック → プレーンテキスト
- 見出し1, 2, 3ブロック → `#`, `##`, `###`
- 箇条書きリスト → `-` リスト
- 番号付きリスト → `1.` リスト
- コードブロック → ` ``` ` フェンスドコードブロック
- 引用ブロック → `>` ブロック引用
- コールアウトブロック → `>` + 絵文字アイコン
- To-doブロック → `- [ ]` / `- [x]` チェックボックス
- トグルブロック → 太字テキスト + ネストされたコンテンツ

#### レイアウトブロック

- 区切りブロック → `---` 水平線
- 数式ブロック → `$equation$` LaTeX
- テーブルブロック → `|` 構文のMarkdownテーブル
- カラムリスト/カラムブロック → 連結されたコンテンツ

#### メディアブロック

- 画像ブロック → `![alt](url)` 画像
- 動画ブロック → URLリンク
- 音声ブロック → `[Audio](url)` リンク
- ファイルブロック → `[File](url)` リンク
- PDFブロック → `[PDF](url)` リンク

#### 埋め込みブロック

- 埋め込みブロック → URL
- ブックマークブロック → URL
- リンクプレビューブロック → URL
- 子ページブロック → `[title](notion-url)` リンク
- 子データベースブロック → `[title](notion-url)` リンク
- ページリンクブロック → Notion URL

#### リッチテキストフォーマット

- 太字、斜体、取り消し線、インラインコードを保持
- リンクはMarkdown構文に変換

### Markdown → Notion

- プレーンテキスト → 段落ブロック
- 見出し（`#`, `##`, `###`）→ 見出しブロック
- 箇条書きリスト（`-`, `*`, `+`）→ 箇条書きリスト項目
- 番号付きリスト（`1.`, `2.`）→ 番号付きリスト項目
- フェンスドコードブロック → 言語サポート付きコードブロック
- インラインフォーマット → アノテーション付きリッチテキスト

## APIリファレンス

### NotionTable

Notionデータベース操作用の型安全なクライアントを作成します。

```typescript
new NotionTable<T>({
  client: Client,              // Notion APIクライアント
  dataSourceId: string,        // データベースID
  properties: T,               // 型安全なスキーマ定義
  cache?: NotionMemoryCache,   // オプション: キャッシュインスタンス
  queryBuilder?: NotionQueryBuilder,  // オプション: カスタムクエリビルダー
  propertyConverter?: NotionPropertyConverter,  // オプション: カスタムコンバーター
  markdown?: NotionMarkdown    // オプション: Markdownトランスフォーマー
})
```

### NotionMarkdown

Notionに保存する際に見出しレベルを変換します。

```typescript
new NotionMarkdown({
  heading_1?: 'heading_1' | 'heading_2' | 'heading_3',
  heading_2?: 'heading_1' | 'heading_2' | 'heading_3',
  heading_3?: 'heading_1' | 'heading_2' | 'heading_3'
})
```

### テーブルメソッド

- `findMany(options?)` - 複数レコードを検索
  - `where` - フィルター条件と演算子（equals, does_not_equal, contains, greater_than, less_than, greater_than_or_equal_to, less_than_or_equal_to, before, after, is_empty, is_not_empty, or, and）
  - `sorts` - ソート指定の配列
  - `count` - 最大レコード数

- `findOne(options?)` - 最初にマッチするレコードを取得
- `findById(id: string, options?)` - IDでレコードを取得（オプションでキャッシュ使用）
- `create(input)` - 新規レコードを作成（オプションでMarkdownボディ付き）
- `createMany(inputs)` - 複数レコードを作成（succeeded/failedを返す）
- `update(id, input)` - レコードを更新
- `updateMany(options)` - 複数レコードを更新
- `upsert(options)` - 条件に基づいて作成または更新
- `delete(id)` - レコードをアーカイブ
- `deleteMany(where?)` - 複数レコードをアーカイブ
- `restore(id)` - アーカイブされたレコードを復元
- `clearCache()` - メモリキャッシュをクリア

### スキーマタイプ

- `title` - ページタイトル（全データベースで必須）
- `rich_text` - プレーンテキストコンテンツ
- `number` - 数値（オプションでフォーマット指定）
- `select` - 定義されたオプションから単一選択
- `multi_select` - 定義されたオプションから複数選択
- `status` - 定義されたオプションからステータス選択
- `checkbox` - ブール値
- `url` - URL文字列
- `email` - メールアドレス
- `phone_number` - 電話番号
- `date` - 開始/終了を持つ日付値
- `files` - ファイル添付
- `people` - ユーザー参照
- `relation` - 他のデータベースへのリレーション
- `formula` - 計算値（文字列、数値、ブール値、または日付）
- `created_time` - 自動生成の作成日時
- `created_by` - 自動生成の作成者
- `last_edited_time` - 自動生成の最終編集日時
- `last_edited_by` - 自動生成の最終編集者
