# NotionTable

The main class for database operations with type-safe schema support.

## Import

```typescript
import { NotionTable } from '@interactive-inc/notion-client'
```

## Constructor

```typescript
new NotionTable<T extends Schema>({
  client: Client,
  dataSourceId: string,
  properties: T,
  cache?: NotionMemoryCache,
  queryBuilder?: NotionQueryBuilder,
  propertyConverter?: NotionPropertyConverter,
  markdown?: NotionMarkdown
})
```

### Parameters

- `client` - Notion API client instance
- `dataSourceId` - Database ID from Notion
- `properties` - Type-safe properties definition
- `cache` - Optional cache instance for performance optimization
- `queryBuilder` - Optional custom query builder
- `propertyConverter` - Optional custom property converter
- `markdown` - Optional markdown transformer for block type enhancement

## Basic Usage

```typescript
import { Client } from '@notionhq/client'
import { NotionTable } from '@interactive-inc/notion-client'

const client = new Client({ auth: process.env.NOTION_TOKEN })

const tasksTable = new NotionTable({
  client,
  dataSourceId: 'your-database-id',
  properties: {
    title: { type: 'title' },
    status: { type: 'select', options: ['todo', 'done'] as const },
    priority: { type: 'number' }
  } as const
})
```

## CRUD Operations

### Create

```typescript
const task = await tasksTable.create({
  properties: {
    title: 'New Task',
    status: 'todo',
    priority: 5
  }
})

// With markdown body
const page = await tasksTable.create({
  properties: {
    title: 'Documentation'
  },
  body: `# Overview\n\nThis is **markdown** content.`
})
```

### Read

```typescript
// Find many - returns { records, hasMore, nextCursor }
const { records: tasks, hasMore, nextCursor } = await tasksTable.findMany({
  where: { status: 'todo' },
  sorts: [{ field: 'priority', direction: 'desc' }],
  limit: 20
})

// Find one
const task = await tasksTable.findOne({
  where: { title: 'Important Task' }
})

// Find by ID with cache option
const specific = await tasksTable.findById('page-id', { cache: true })
```

### Update

```typescript
// Update single
const updated = await tasksTable.update('page-id', {
  properties: {
    status: 'done'
  }
})

// Update many
const count = await tasksTable.updateMany({
  where: { status: 'todo' },
  update: {
    properties: {
      status: 'in_progress'
    }
  }
})

// Upsert
const result = await tasksTable.upsert({
  where: { email: 'user@example.com' },
  insert: {
    properties: {
      name: 'New User',
      email: 'user@example.com'
    }
  },
  update: {
    properties: {
      lastSeen: { start: new Date().toISOString(), end: null }
    }
  }
})
```

### Delete

```typescript
// Soft delete (archive)
await tasksTable.delete('page-id')

// Delete many (pass where condition directly)
const deletedCount = await tasksTable.deleteMany({ status: 'cancelled' })

// Restore
await tasksTable.restore('page-id')
```

## Advanced Features

### With Markdown Enhancement

```typescript
import { NotionMarkdown } from '@interactive-inc/notion-client'

const enhancer = new NotionMarkdown({
  heading_1: 'heading_2',  // H1 → H2
  heading_2: 'heading_3'   // H2 → H3
})

const docsTable = new NotionTable({
  client,
  dataSourceId: 'docs-db',
  properties: { title: { type: 'title' } },
  markdown: enhancer
})
```

### Query Operators

```typescript
// Comparison (number)
{ price: { greater_than_or_equal_to: 100 } }
{ quantity: { less_than: 10 } }
{ count: { equals: 5 } }

// String matching (text/title/rich_text)
{ name: { contains: 'product' } }
{ email: { ends_with: '@company.com' } }
{ title: { starts_with: 'Project' } }

// Array operations (multi_select)
{ tags: { contains: 'urgent' } }

// Logical operators
{ or: [{ status: 'active' }, { priority: { greater_than_or_equal_to: 8 } }] }
{ and: [{ published: true }, { featured: true }] }

// Empty checks
{ description: { is_empty: true } }
{ tags: { is_not_empty: true } }

// Date operations
{ createdAt: { before: '2024-01-01' } }
{ dueDate: { after: '2024-12-31' } }
{ publishDate: { on_or_before: '2024-06-01' } }
```

## Type Safety

```typescript
// Properties define types
const properties = {
  name: { type: 'title' },
  age: { type: 'number' },
  tags: { type: 'multi_select', options: ['a', 'b', 'c'] as const }
} as const

// Type is inferred from properties
type User = SchemaType<typeof properties>
// {
//   name: string
//   age: number | null
//   tags: string[]
// }

// Full IDE support
const table = new NotionTable({ client, dataSourceId: 'db-id', properties })
const user = await table.create({
  properties: {
    name: 'John',     // ✅ String
    age: 30,          // ✅ Number
    tags: ['a', 'b']  // ✅ Array of valid options
  }
})
```

## Return Types

### NotionPageReference

All query methods return `NotionPageReference<T>` instances:

```typescript
const page = await table.findById('page-id')

// Properties
page.id           // string - Page ID
page.url          // string - Page URL
page.createdAt    // string - ISO date string
page.updatedAt    // string - ISO date string
page.isArchived   // boolean
page.isDeleted    // boolean (same as isArchived)

// Methods
page.properties() // SchemaType<T> - Typed properties
page.raw()        // PageObjectResponse - Raw Notion response
await page.body() // string - Page body as markdown
```

## Cache Management

```typescript
// Clear all cached pages and blocks
table.clearCache()

// Use cache when finding by ID
const cached = await table.findById('page-id', { cache: true })
```