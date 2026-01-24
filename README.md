# notion-client

A TypeScript ORM for Notion databases. Query, create, update, and delete records with type safety—no more wrestling with deeply nested API responses.

https://interactive-inc.github.io/open-notion-client/

## Why notion-client?

Working directly with the Notion API is painful. A simple text value comes buried in layers of nested objects:

```json
{
  "properties": {
    "Name": {
      "type": "title",
      "title": [{
        "text": { "content": "Hello World" },
        "annotations": { "bold": false, "italic": false }
      }]
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
- Support for all Notion property types

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
  count: 10,
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

// Update many
await tasks.updateMany({
  where: { status: "todo" },
  update: { properties: { status: "doing" } },
})
```

### Delete

```typescript
// Archive one
await tasks.delete(task.id)

// Archive many
await tasks.deleteMany({ status: "done" })

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
    properties: { status: "todo" },
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
        and: [
          { priority: { greater_than_or_equal_to: 5 } },
          { tags: { contains: "urgent" } },
        ],
      },
    ],
  },
})
```

## Property Types

| Type | Description | Example Value |
| --- | --- | --- |
| `title` | Page title (required) | `"Task name"` |
| `rich_text` | Text content | `"Description"` |
| `number` | Numeric value | `42` |
| `select` | Single select | `"option1"` |
| `multi_select` | Multiple select | `["tag1", "tag2"]` |
| `status` | Status field | `"In Progress"` |
| `checkbox` | Boolean | `true` |
| `url` | URL string | `"https://..."` |
| `email` | Email address | `"user@example.com"` |
| `phone_number` | Phone number | `"555-123-4567"` |
| `date` | Date value | `{ start: "2024-01-01" }` |
| `files` | File attachments | `[{ url: "..." }]` |
| `people` | User references | `[{ id: "user-id" }]` |
| `relation` | Relations | `["page-id"]` |
| `formula` | Computed value | Read-only |
| `created_time` | Creation timestamp | Read-only |
| `last_edited_time` | Last edit timestamp | Read-only |

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
  heading_1: "heading_2", // Convert H1 to H2
  heading_2: "heading_3", // Convert H2 to H3
})

const posts = new NotionTable({
  client,
  dataSourceId: "database-id",
  properties: { title: { type: "title" } } as const,
  markdown,
})
```

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

// Fetch with caching enabled
const task = await tasks.findById("page-id", { cache: true })

// Clear cache when needed
tasks.clearCache()
```

## License

MIT
