# Getting Started

## Installation

```bash
bun add @interactive-inc/notion-client @notionhq/client
```

## Setup

### Create Notion Integration

- Go to [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
- Click "New integration" and copy the token
- Open your database, click "..." > "Add connections", add your integration
- Copy the database ID from the URL: `https://notion.so/workspace/{DATABASE_ID}?v=...`

### Initialize

```typescript
import { NotionTable } from "@interactive-inc/notion-client"
import { Client } from "@notionhq/client"

const client = new Client({ auth: process.env.NOTION_TOKEN })

const tasks = new NotionTable({
  client,
  dataSourceId: process.env.NOTION_DATABASE_ID,
  properties: {
    title: { type: "title" },
    status: { type: "select", options: ["todo", "done"] as const },
    priority: { type: "number" },
  } as const,
})
```

## CRUD Operations

### Create

```typescript
const task = await tasks.create({
  properties: {
    title: "Learn notion-client",
    status: "todo",
    priority: 1,
  },
})
```

### Read

```typescript
const { records } = await tasks.findMany({
  where: { status: "todo" },
})

const task = await tasks.findOne({
  where: { title: "Learn notion-client" },
})

const specific = await tasks.findById("page-id")

const props = task.properties()
```

### Update

```typescript
await tasks.update(task.id, {
  properties: { status: "done" },
})

// Clear page body content
await tasks.update(task.id, {
  properties: {},
  body: null,
})
```

### Delete and Restore

```typescript
await tasks.delete(task.id)
await tasks.restore(task.id)
```

## Options

### Caching

```typescript
import { NotionMemoryCache } from "@interactive-inc/notion-client"

const tasks = new NotionTable({
  client,
  dataSourceId: "database-id",
  properties: { title: { type: "title" } } as const,
  cache: new NotionMemoryCache(),
})
```

### Retry

API calls retry automatically on rate limits (429) and server errors (5xx). The `Retry-After` header is respected when present; otherwise delays use exponential backoff with full jitter.

```typescript
const tasks = new NotionTable({
  client,
  dataSourceId: "database-id",
  properties: { title: { type: "title" } } as const,
  retry: { maxRetries: 5, baseDelayMs: 500 },
})
```

Default: 3 retries, 400ms base delay.

### Safe Mode

Use `.safe` to get `T | Error` instead of exceptions:

```typescript
const result = await tasks.safe.findById("page-id")

if (result instanceof Error) {
  console.error(result.message)
} else {
  console.log(result.properties())
}
```

All methods are available on `.safe`.
