# Mutation

Learn how to create and update records in Notion databases.

## Creating Records

### Basic Creation

Create a new record with required fields:

```typescript
const task = await tasksTable.create({
  properties: {
    title: 'Complete documentation',
    status: 'in_progress',
    priority: 5
  }
})

console.log(task.id) // Notion page ID
```

### With Markdown Content

Add rich text content using markdown:

```typescript
const blogPost = await blogTable.create({
  properties: {
    title: 'Getting Started with notion-client'
  },
  body: `# Introduction

This library makes working with Notion databases **simple** and *intuitive*.

## Features

- Type-safe operations
- Markdown support
- Advanced queries

\`\`\`typescript
const table = new NotionTable({ ... })
\`\`\`
`
})
```

### Bulk Creation

Create multiple records with `createMany`:

```typescript
const tasks = [
  { properties: { title: 'Task 1', priority: 5 } },
  { properties: { title: 'Task 2', priority: 3 } },
  { properties: { title: 'Task 3', priority: 8 } }
]

const result = await tasksTable.createMany(tasks)

console.log(`Created: ${result.succeeded.length}`)
console.log(`Failed: ${result.failed.length}`)

// Access failed items with error details
for (const failure of result.failed) {
  console.error(failure.error.message)
}
```

## Updating Records

### Update by ID

Update specific fields of a record:

```typescript
const updated = await tasksTable.update('page-id', {
  properties: {
    status: 'completed'
  }
})
```

### Update with Markdown

Update page body content:

```typescript
const updated = await blogTable.update(postId, {
  properties: {
    title: 'Updated Title'
  },
  body: `# Updated Content

New content with **bold** text.

- Updated list item 1
- Updated list item 2
`
})
```

### Update Many

Bulk update multiple records matching a condition:

```typescript
// Mark all high-priority tasks as urgent
const count = await tasksTable.updateMany({
  where: { priority: { greater_than_or_equal_to: 8 } },
  update: {
    properties: {
      status: 'urgent'
    }
  }
})

console.log(`Updated ${count} tasks`)
```

## Upsert Operations

Create or update based on conditions:

```typescript
const contact = await contactsTable.upsert({
  where: { email: 'john@example.com' },
  insert: {
    properties: {
      name: 'John Doe',
      email: 'john@example.com',
      company: 'Acme Corp'
    }
  },
  update: {
    properties: {
      lastContacted: { start: new Date().toISOString(), end: null }
    }
  }
})
```

## Delete Operations

### Delete Single Record

Archive a record (soft delete):

```typescript
await tasksTable.delete('page-id')
```

### Delete Many

Archive multiple records matching a condition:

```typescript
const count = await tasksTable.deleteMany({
  status: 'cancelled'
})

console.log(`Deleted ${count} tasks`)
```

### Restore

Restore an archived record:

```typescript
const restored = await tasksTable.restore('page-id')
```

## Markdown Enhancement

Transform heading levels for consistency:

```typescript
import { NotionMarkdown, NotionTable } from '@interactive-inc/notion-client'

const markdown = new NotionMarkdown({
  heading_1: 'heading_2', // Convert all H1 to H2
  heading_2: 'heading_3'  // Convert all H2 to H3
})

const docsTable = new NotionTable({
  client,
  dataSourceId: 'docs-db',
  properties: {
    title: { type: 'title' }
  } as const,
  markdown
})

await docsTable.create({
  properties: {
    title: 'API Guide'
  },
  body: `# Main Title

## Subsection

Content here.`
})
// In Notion: H1 becomes H2, H2 becomes H3
```

## Best Practices

### Input Validation

Always validate before database operations:

```typescript
function validateTaskInput(data: { title?: string; priority?: number }) {
  if (!data.title || data.title.length < 3) {
    throw new Error('Title must be at least 3 characters')
  }

  if (data.priority !== undefined && (data.priority < 1 || data.priority > 10)) {
    throw new Error('Priority must be between 1 and 10')
  }
}

// Use before creation
validateTaskInput(input)
const task = await tasksTable.create({ properties: input })
```

### Error Handling

Provide clear error messages:

```typescript
try {
  await tasksTable.create({
    properties: {
      // Missing required title
      priority: 5
    }
  })
} catch (error) {
  if (error instanceof Error) {
    console.error('Failed to create task:', error.message)
  }
}
```
