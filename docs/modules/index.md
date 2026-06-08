# API

Core modules that power notion-client's functionality.

## Overview

notion-client consists of several modules that work together to provide a seamless experience:

```
NotionTable (Main Interface)
    ├── Properties validation & Type inference
    ├── Property conversion (Notion ↔ Simple values)
    ├── Query building (Notion API filter format)
    └── Cache management (NotionMemoryCache)

Markdown Processing
    ├── toNotionBlocks (Markdown → Notion blocks)
    ├── fromNotionBlocks (Notion blocks → Markdown)
    └── NotionMarkdown (Block type transformation)

Block Enhancement
    └── enhance (Recursive child block fetching)
```

## Module Relationships

### Database Operations Flow

```typescript
// 1. Define properties → NotionTable validates and infers types
const table = new NotionTable({
  client,
  dataSourceId: "db-id",
  properties: {
    title: { type: "title" },
    status: { type: "select", options: ["active", "inactive"] },
  },
})

// 2. Create with markdown → toNotionBlocks converts content
await table.create({
  properties: { title: "Page" },
  body: "# Markdown content",
})

// 3. Query with filters → Query builder uses Notion API format
await table.findMany({
  where: { status: { equals: "active" } },
})

// 4. Read with blocks → fromNotionBlocks converts to markdown
const content = fromNotionBlocks(blocks)
```

### Content Processing Pipeline

```typescript
// Input: Markdown text
const markdown = "# Title\n**Bold** text"

// Process: Convert to Notion blocks
const blocks = toNotionBlocks(markdown)

// Store: Save to Notion database with optional transformation
const markdownTransformer = new NotionMarkdown({ heading_1: "heading_2" })
const table = new NotionTable({
  client,
  dataSourceId: "db-id",
  properties: { title: { type: "title" } },
  markdown: markdownTransformer,
})

await table.create({
  properties: { title: "Doc" },
  body: markdown,
})

// Retrieve: Fetch with nested blocks
const enhancedClient = enhance(client.blocks.children.list.bind(client.blocks.children))
const allBlocks = await enhancedClient({ block_id: "page-id" })

// Output: Convert back to markdown
const result = fromNotionBlocks(allBlocks)
```

## Core Modules

### NotionTable

The main entry point for database operations:

- Properties validation
- Type-safe CRUD operations
- Query building (Notion API filter format)
- Property conversion (Notion ↔ JavaScript types)
- Cache management

### NotionMarkdown

Transforms heading levels during markdown conversion:

- Adjust heading hierarchy
- Maintain document structure
- Integrate with content pipeline

### Conversion Functions

**toNotionBlocks** - Markdown → Notion

- Parse markdown syntax
- Create block objects
- Apply text annotations
- Support code blocks and lists

**fromNotionBlocks** - Notion → Markdown

- Extract text content
- Preserve formatting
- Handle nested structures
- Generate clean markdown

### enhance Function

Recursively fetches all child blocks:

- Overcome API limitations
- Fetch complete page content
- Maintain block relationships

## Usage Patterns

### Complete Setup

```typescript
import {
  NotionTable,
  NotionMarkdown,
  toNotionBlocks,
  fromNotionBlocks,
  enhance,
} from "@interactive-inc/notion-client"

// Database operations
const table = new NotionTable({ ...config })

// Content transformation
const enhancer = new NotionMarkdown({ ...options })

// Block processing
const fetchAllBlocks = enhance(notionClient)
```

### Common Workflows

1. **Database with Markdown**

   ```typescript
   NotionTable + toNotionBlocks + NotionMarkdown
   ```

2. **Page Export**

   ```typescript
   enhance + fromNotionBlocks
   ```

3. **Content Migration**
   ```typescript
   toNotionBlocks + NotionTable + fromNotionBlocks
   ```

Each module is designed to work independently or together, providing flexibility for different use cases.
