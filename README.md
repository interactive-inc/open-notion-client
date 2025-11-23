A TypeScript library that transforms Notion into a powerful, type-safe database. Seamlessly convert between Notion blocks and markdown, while enjoying simple database operations without the complexity of Notion's API.

https://interactive-inc.github.io/open-notion-client/

## Use Notion as a Database

Working directly with Notion's API can be overwhelming. The API responses include extensive formatting information like text colors, bold/italic styles, annotations, and deeply nested metadata structures. What should be a simple database query becomes a complex parsing exercise.

For example, retrieving a simple text value requires navigating through multiple nested objects:
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

notion-client simplifies this to just `{ name: "Hello World" }`, making Notion as easy to use as any traditional database.

## Features

- **Bidirectional Conversion**: Convert between Notion blocks and markdown text
- **Type-safe Database Operations**: Strongly-typed CRUD operations for Notion databases
- **Block Type Support**: Supports paragraphs, headings (H1-H3), lists, and code blocks
- **Rich Text Formatting**: Handles bold, italic, strikethrough, and inline code
- **Recursive Block Fetching**: Automatically fetches nested child blocks
- **Advanced Querying**: Filter, sort, and paginate database queries

## Installation

```bash
bun i @interactive-inc/notion-client
```

## Usage

### Type-safe Database Operations

```typescript
import { Client } from '@notionhq/client'
import { NotionTable } from '@interactive-inc/notion-client'

const client = new Client({ auth: process.env.NOTION_TOKEN })

const tasksTable = new NotionTable({
  client,
  tableId: 'your-database-id',
  schema: {
    title: { type: 'title' },
    status: { type: 'select', options: ['todo', 'in_progress', 'done'] },
    priority: { type: 'number' },
    tags: { type: 'multi_select', options: ['bug', 'feature', 'enhancement'] }
  } as const
})

// Create a record
const task = await tasksTable.create({
  title: 'Implement new feature',
  status: 'todo',
  priority: 1,
  tags: ['feature']
})

// Query records with filtering and sorting
const { records } = await tasksTable.findMany({
  where: {
    status: 'in_progress',
    priority: { $gte: 3 }
  },
  sorts: [{ property: 'priority', direction: 'descending' }],
  limit: 10
})

// Update a record
await tasksTable.update(task.id, {
  status: 'done'
})
```

### Working with Markdown Content

```typescript
import { NotionTable, NotionMarkdown } from '@interactive-inc/notion-client'

// Create a markdown enhancer to transform heading levels
const enhancer = new NotionMarkdown({
  heading_1: 'heading_2',  // Convert H1 to H2
  heading_2: 'heading_3'   // Convert H2 to H3
})

// Create table with markdown support
const blogTable = new NotionTable({
  client,
  tableId: 'your-blog-database-id',
  schema: {
    title: { type: 'title' },
    content: { type: 'rich_text' }
  },
  enhancer  // Optional: transforms markdown before saving
})

// Create a post with markdown content
const post = await blogTable.create({
  title: 'My Blog Post',
  body: `# Introduction
  
This is a paragraph with **bold** and *italic* text.

## Features
- Feature 1
- Feature 2

\`\`\`typescript
const hello = "world"
\`\`\`
`
})
```

### Advanced Querying

```typescript
// Complex queries with operators
const results = await tasksTable.findMany({
  where: {
    $or: [
      { status: 'todo' },
      { 
        $and: [
          { priority: { $gte: 5 } },
          { tags: { $contains: 'urgent' } }
        ]
      }
    ]
  },
  sorts: [
    { property: 'priority', direction: 'descending' },
    { property: 'created_time', direction: 'ascending' }
  ],
  limit: 20
})

// Find one record
const urgentTask = await tasksTable.findOne({
  where: { 
    status: 'todo',
    priority: { $gte: 8 }
  }
})

// Update multiple records
await tasksTable.updateMany({
  where: { status: 'todo' },
  data: { status: 'in_progress' }
})
```

### Validation and Hooks

```typescript
const userTable = new NotionTable({
  client,
  tableId: 'users-database-id',
  schema: {
    email: {
      type: 'email',
      validate: (value) => {
        if (!value.includes('@')) {
          return 'Invalid email format'
        }
        return true
      }
    },
    age: {
      type: 'number',
      min: 0,
      max: 120
    }
  } as const,
  hooks: {
    beforeCreate: async (data) => {
      // Add timestamp
      return {
        ...data,
        created_at: new Date().toISOString()
      }
    },
    afterFind: async (records) => {
      // Transform data after fetching
      return records.map(record => ({
        ...record,
        displayName: record.email.split('@')[0]
      }))
    }
  }
})
```

## Supported Block Types

### Block Type Mapping

| Markdown | Notion Block Type | Example |
|----------|------------------|---------|
| Plain text | `paragraph` | Hello world |
| `# Heading 1` | `heading_1` | # Title |
| `## Heading 2` | `heading_2` | ## Subtitle |
| `### Heading 3` | `heading_3` | ### Section |
| `- Item` | `bulleted_list_item` | - List item |
| `1. Item` | `numbered_list_item` | 1. First item |
| `` ```code``` `` | `code` | ```js<br>console.log()<br>``` |
| `**bold**` | Rich text with bold | **Important** |
| `*italic*` | Rich text with italic | *Emphasis* |
| `~~strike~~` | Rich text with strikethrough | ~~Deleted~~ |
| `` `code` `` | Rich text with code | `variable` |

### Notion to Markdown
- Paragraph blocks → Plain text
- Heading 1, 2, 3 blocks → `#`, `##`, `###`
- Bulleted list items → `-` lists
- Numbered list items → `1.` lists
- Code blocks → `` ``` `` fenced code blocks
- Rich text formatting preserved (bold, italic, strikethrough, inline code)

### Markdown to Notion
- Plain text → Paragraph blocks
- Headers (`#`, `##`, `###`) → Heading blocks
- Unordered lists (`-`, `*`, `+`) → Bulleted list items
- Ordered lists (`1.`, `2.`) → Numbered list items
- Fenced code blocks → Code blocks with language support
- Inline formatting → Rich text with annotations

## API Reference

### NotionTable

Create a type-safe client for Notion database operations.

```typescript
new NotionTable({
  client: Client,           // Notion API client
  tableId: string,         // Database ID
  schema: Schema,          // Database schema definition
  enhancer?: NotionMarkdown, // Optional markdown transformer
  hooks?: {                // Optional lifecycle hooks
    beforeCreate?: (data) => Promise<data>
    afterCreate?: (record) => Promise<record>
    beforeUpdate?: (id, data) => Promise<data>
    afterUpdate?: (record) => Promise<record>
    beforeFind?: (options) => Promise<options>
    afterFind?: (records) => Promise<records>
  }
})
```

### NotionMarkdown

Transform markdown content when saving to Notion.

```typescript
new NotionMarkdown({
  heading_1?: 'heading_1' | 'heading_2' | 'heading_3',
  heading_2?: 'heading_1' | 'heading_2' | 'heading_3',
  heading_3?: 'heading_1' | 'heading_2' | 'heading_3'
})
```

### Table Methods

- `findMany(options?)` - Query multiple records
  - `where` - Filter conditions with operators ($eq, $ne, $gt, $gte, $lt, $lte, $contains, $or, $and, $not)
  - `sorts` - Array of sort specifications
  - `limit` - Maximum number of records
  - `cursor` - Pagination cursor
  
- `findOne(options?)` - Find the first matching record
- `findById(id: string)` - Get a record by ID
- `create(data)` - Create a new record with optional markdown body
- `update(id, data)` - Update a record
- `updateMany(options)` - Update multiple records
- `upsert(options)` - Create or update based on conditions
- `delete(id)` - Archive a record
- `deleteMany(where?)` - Archive multiple records
- `restore(id)` - Restore an archived record

### Schema Types

- `title` - Page title (required for all databases)
- `rich_text` - Plain text content
- `number` - Numeric values with optional min/max validation
- `select` - Single selection from predefined options
- `multi_select` - Multiple selections from predefined options
- `checkbox` - Boolean values
- `url` - URL strings
- `email` - Email addresses
- `phone_number` - Phone numbers
- `date` - Date values
- `files` - File attachments
- `people` - User references
- `relation` - Relations to other databases
- `formula` - Computed values
- `rollup` - Aggregated values from relations
