# notion-client

A TypeScript ORM for Notion databases. Query, create, update, and delete records with type safety -- no more wrestling with deeply nested API responses.

https://interactive-inc.github.io/open-notion-client/

## Why notion-client?

Working directly with the Notion API is painful. A simple text value comes buried in layers of nested objects:

```json
{
  "properties": {
    "Name": {
      "type": "title",
      "title": [
        {
          "text": { "content": "Hello World" },
          "annotations": { "bold": false, "italic": false }
        }
      ]
    }
  }
}
```

notion-client flattens this to `{ name: "Hello World" }` and gives you a clean, familiar ORM interface.

## Features

- Type-safe schema definitions with full TypeScript inference
- Intuitive CRUD operations that feel like Prisma or Drizzle
- Powerful query builder with filters, sorting, and pagination
- Automatic conversion between Notion's complex JSON and simple values
- Markdown support for page content with bidirectional conversion
- Built-in memory cache to reduce API calls
- Safe mode (`.safe`) that returns `T | Error` instead of throwing
- Automatic retry with exponential backoff for rate-limited requests
- Batch operations with partial failure handling

## Installation

```bash
bun add @interactive-inc/notion-client
```

## Quick Start

### Define Your Schema

```typescript
import { Client } from "@notionhq/client"
import { NotionTable } from "@interactive-inc/notion-client"

const client = new Client({ auth: process.env.NOTION_TOKEN })

const tasks = new NotionTable({
  client,
  dataSourceId: "your-database-id",
  properties: {
    title: { type: "title" },
    status: { type: "select", options: ["todo", "doing", "done"] },
    priority: { type: "number" },
    tags: { type: "multi_select", options: ["bug", "feature"] },
  } as const,
})
```

### Create

```typescript
const task = await tasks.create({
  properties: {
    title: "Implement new feature",
    status: "todo",
    priority: 1,
    tags: ["feature"],
  },
})
```

### Read

```typescript
// Find multiple records
const allTasks = await tasks.findMany({
  where: { status: "doing" },
  sorts: [{ field: "priority", direction: "desc" }],
  limit: 10,
})

// Find one record
const task = await tasks.findOne({
  where: { title: "Implement new feature" },
})

// Find by ID
const task = await tasks.findById("page-id")
```

### Update

```typescript
// Update one
await tasks.update(task.id, {
  properties: { status: "done" },
})

// Update with markdown body
await tasks.update(task.id, {
  properties: { status: "done" },
  body: "# Done\n\nCompleted this task.",
})

// Clear page body
await tasks.update(task.id, {
  properties: {},
  body: null,
})

// Update many (returns BatchResult)
const result = await tasks.updateMany({
  where: { status: "todo" },
  update: { properties: { status: "doing" } },
})
console.log(result.succeeded.length, result.failed.length)
```

### Delete

```typescript
// Archive one
await tasks.delete(task.id)

// Archive many (returns BatchResult)
const result = await tasks.deleteMany({ status: "done" })

// Restore archived
await tasks.restore(task.id)
```

### Upsert

```typescript
await tasks.upsert({
  where: { title: "Daily standup" },
  create: {
    properties: { title: "Daily standup", status: "todo" },
  },
  update: {
    properties: { status: "in_progress" },
  },
})
```

## Queries

### Filter Operators

```typescript
const results = await tasks.findMany({
  where: {
    priority: { greater_than_or_equal_to: 5 },
    status: { does_not_equal: "done" },
    tags: { contains: "bug" },
  },
})
```

Supported operators: `equals`, `does_not_equal`, `contains`, `does_not_contain`, `greater_than`, `less_than`, `greater_than_or_equal_to`, `less_than_or_equal_to`, `before`, `after`, `is_empty`, `is_not_empty`

### Logical Operators

```typescript
const results = await tasks.findMany({
  where: {
    or: [
      { status: "todo" },
      {
        and: [{ priority: { greater_than_or_equal_to: 5 } }, { tags: { contains: "urgent" } }],
      },
    ],
  },
})
```

## Property Types

Supported Notion property types and their TypeScript mappings:

- `title` -- `string` -- Page title (required)
- `rich_text` -- `string` -- Text content
- `number` -- `number | null` -- Numeric value
- `select` -- `string | null` -- Single select
- `multi_select` -- `string[]` -- Multiple select
- `status` -- `string | null` -- Status field
- `checkbox` -- `boolean` -- Boolean
- `url` -- `string | null` -- URL string
- `email` -- `string | null` -- Email address
- `phone_number` -- `string | null` -- Phone number
- `date` -- `{ start, end } | null` -- Date value
- `files` -- `Array<{ url }>` -- File attachments
- `people` -- `Array<{ id }>` -- User references
- `relation` -- `string[]` -- Relations
- `formula` -- Read-only computed value
- `created_time` / `last_edited_time` -- Read-only timestamps
- `created_by` / `last_edited_by` -- Read-only user references

## Markdown Support

Create pages with Markdown content that automatically converts to Notion blocks:

```typescript
const post = await posts.create({
  properties: { title: "Blog Post" },
  body: `
# Introduction

This paragraph has **bold** and *italic* text.

## Features

- Feature A
- Feature B

\`\`\`typescript
const hello = "world"
\`\`\`
`,
})
```

### Heading Level Transformation

```typescript
import { NotionMarkdown } from "@interactive-inc/notion-client"

const markdown = new NotionMarkdown({
  heading_1: "heading_2",
  heading_2: "heading_3",
})

// Create a new instance with different mapping
const updated = markdown.withMapping({
  heading_1: "heading_3",
})

const posts = new NotionTable({
  client,
  dataSourceId: "database-id",
  properties: { title: { type: "title" } } as const,
  markdown,
})
```

## Safe Mode

Use `.safe` to get `T | Error` instead of exceptions:

```typescript
const result = await tasks.safe.findById("page-id")

if (result instanceof Error) {
  console.error("Failed:", result.message)
} else {
  console.log(result.properties())
}
```

All methods are available on `.safe`: `findMany`, `findOne`, `findById`, `create`, `createMany`, `update`, `updateMany`, `upsert`, `delete`, `deleteMany`, `restore`.

## Retry

API calls automatically retry on rate limits (429) and server errors (5xx) with exponential backoff:

```typescript
const tasks = new NotionTable({
  client,
  dataSourceId: "database-id",
  properties: { title: { type: "title" } } as const,
  retry: {
    maxRetries: 5,
    baseDelayMs: 500,
  },
})
```

Default: 3 retries, 400ms base delay.

## Caching

Reduce API calls with the built-in memory cache:

```typescript
import { NotionMemoryCache } from "@interactive-inc/notion-client"

const cache = new NotionMemoryCache()

const tasks = new NotionTable({
  client,
  dataSourceId: "database-id",
  properties: { title: { type: "title" } } as const,
  cache,
})

tasks.clearCache()
```

## License

MIT
