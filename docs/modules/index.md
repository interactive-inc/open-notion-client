# API

## NotionTable

The main class for database operations.

```typescript
import { NotionTable } from "@interactive-inc/notion-client"

const table = new NotionTable({
  client,                    // Notion API client
  dataSourceId: "db-id",     // Database ID
  properties: { ... },       // Schema definition
  cache: new NotionMemoryCache(),  // Optional
  markdown: new NotionMarkdown(),  // Optional
  retry: { maxRetries: 3, baseDelayMs: 400 },  // Optional
})
```

### Methods

- `create(input)` -- Create a record
- `createMany(records, options?)` -- Bulk create, returns `BatchResult`
- `findMany(options?)` -- Query records, returns `{ records, hasMore, nextCursor }`
- `findOne(options?)` -- Find first matching record
- `findById(id)` -- Get record by page ID
- `update(id, input)` -- Update a record. Pass `body: null` to clear content
- `updateMany(options)` -- Bulk update, returns `BatchResult`
- `upsert(options)` -- Create or update
- `delete(id)` -- Archive a record
- `deleteMany(where?)` -- Bulk archive, returns `BatchResult`
- `restore(id)` -- Restore archived record
- `clearCache()` -- Clear the memory cache

### Safe mode

`table.safe.*` wraps every method to return `T | Error` instead of throwing.

```typescript
const result = await table.safe.findById("page-id")
if (result instanceof Error) { /* handle */ }
```

## NotionPageReference

Returned by query and mutation methods.

- `id` -- Page ID
- `url` -- Page URL
- `createdAt` -- ISO date string
- `updatedAt` -- ISO date string
- `isArchived` -- boolean
- `properties()` -- Typed property values
- `raw()` -- Raw Notion API response
- `body()` -- Page body as markdown (async)

## BatchResult

Returned by `createMany`, `updateMany`, `deleteMany`.

```typescript
type BatchResult<T> = {
  succeeded: T[]
  failed: Array<{ data: unknown, error: Error }>
}
```

## NotionMemoryCache

In-memory cache for pages and blocks.

```typescript
import { NotionMemoryCache } from "@interactive-inc/notion-client"

const cache = new NotionMemoryCache()
```

## NotionMarkdown

Heading level transformation for markdown-to-Notion conversion.

```typescript
import { NotionMarkdown } from "@interactive-inc/notion-client"

const md = new NotionMarkdown({
  heading_1: "heading_2",
  heading_2: "heading_3",
})

// Immutable: withMapping returns a new instance
const updated = md.withMapping({ heading_1: "heading_3" })
```

## Conversion Functions

### toNotionBlocks

```typescript
import { toNotionBlocks } from "@interactive-inc/notion-client"

const blocks = toNotionBlocks("# Hello\n\nParagraph text")
```

### fromNotionBlocks

```typescript
import { fromNotionBlocks } from "@interactive-inc/notion-client"

const markdown = fromNotionBlocks(notionBlocks, {
  onUnsupportedBlock: (type, id) => console.warn(type),
})
```

### enhance

Recursively fetch child blocks from the Notion API.

```typescript
import { enhance } from "@interactive-inc/notion-client"

const fetchAll = enhance((args) => notion.blocks.children.list(args))
const blocks = await fetchAll({ block_id: "page-id" })
```
