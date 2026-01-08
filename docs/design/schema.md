# Schema Definition

Learn how to define type-safe schemas for your Notion databases.

## Basic Schema

Define your database structure with TypeScript using the `properties` parameter:

```typescript
const tasksTable = new NotionTable({
  client,
  dataSourceId: 'your-database-id',
  properties: {
    title: { type: 'title' },
    description: { type: 'rich_text' },
    priority: { type: 'number' },
    status: { type: 'select', options: ['todo', 'in_progress', 'done'] }
  } as const
})
```

## Property Types

### Title

Every Notion database must have exactly one title property:

```typescript
{
  title: { type: 'title' }
}
```

### Text Properties

```typescript
{
  // Rich text with formatting support
  description: { type: 'rich_text' },

  // URL validation
  website: { type: 'url' },

  // Email validation
  email: { type: 'email' },

  // Phone number format
  phone: { type: 'phone_number' }
}
```

### Number Properties

```typescript
{
  // Basic number
  price: { type: 'number' },

  // With format (percent, dollar, etc.)
  discount: { type: 'number', format: 'percent' }
}
```

### Select Properties

```typescript
{
  // Single select with options
  category: {
    type: 'select',
    options: ['bug', 'feature', 'enhancement'] as const
  },

  // Multi-select
  tags: {
    type: 'multi_select',
    options: ['urgent', 'blocked', 'needs-review'] as const
  },

  // Status (special select type)
  status: {
    type: 'status',
    options: ['Not started', 'In progress', 'Done'] as const
  }
}
```

### Date Properties

```typescript
{
  // Date with start and optional end
  deadline: { type: 'date' }
}

// Usage
await table.create({
  properties: {
    deadline: { start: '2024-01-01', end: null }
  }
})
```

### Other Properties

```typescript
{
  // Boolean
  isActive: { type: 'checkbox' },

  // User references
  assignee: { type: 'people' },

  // File attachments
  attachments: { type: 'files' },

  // Relations to other databases
  project: { type: 'relation' },

  // Computed values (read-only)
  total: { type: 'formula' },

  // Aggregated from relations (read-only)
  taskCount: { type: 'rollup' },

  // Auto-generated timestamps (read-only)
  createdTime: { type: 'created_time' },
  lastEditedTime: { type: 'last_edited_time' },

  // Auto-generated users (read-only)
  createdBy: { type: 'created_by' },
  lastEditedBy: { type: 'last_edited_by' }
}
```

## Type Inference

The properties automatically infer TypeScript types:

```typescript
const taskProperties = {
  title: { type: 'title' },
  priority: { type: 'number' },
  tags: { type: 'multi_select', options: ['bug', 'feature'] as const }
} as const

const table = new NotionTable({
  client,
  dataSourceId: 'db-id',
  properties: taskProperties
})

// TypeScript infers correct types for create/update
await table.create({
  properties: {
    title: 'Task',           // string
    priority: 5,             // number | null
    tags: ['bug', 'feature'] // ('bug' | 'feature')[]
  }
})

// And for query results
const tasks = await table.findMany()
for (const task of tasks) {
  const props = task.properties()
  // props.title: string
  // props.priority: number | null
  // props.tags: string[]
}
```

## Using SchemaType

Extract the TypeScript type from your properties definition:

```typescript
import type { SchemaType } from '@interactive-inc/notion-client'

const properties = {
  title: { type: 'title' },
  status: { type: 'select', options: ['active', 'inactive'] as const },
  count: { type: 'number' }
} as const

// Extract the type
type MyRecord = SchemaType<typeof properties>
// {
//   title: string
//   status: string | null
//   count: number | null
// }
```

## Best Practices

### Use Const Assertions

```typescript
// Good - preserves literal types for options
const properties = {
  status: {
    type: 'select',
    options: ['active', 'inactive'] as const
  }
} as const

// Avoid - loses type information
const properties = {
  status: {
    type: 'select',
    options: ['active', 'inactive']
  }
}
```

### Organize Complex Schemas

```typescript
// Define properties separately for reuse
const baseProperties = {
  title: { type: 'title' },
  createdAt: { type: 'created_time' }
} as const

const userProperties = {
  ...baseProperties,
  email: { type: 'email' },
  role: { type: 'select', options: ['admin', 'user'] as const }
} as const

const productProperties = {
  ...baseProperties,
  price: { type: 'number' },
  stock: { type: 'number' }
} as const
```

### Validate Before Operations

Since the library doesn't include built-in validation, validate your data before database operations:

```typescript
function validateTask(data: { title?: string; priority?: number }) {
  if (!data.title || data.title.length < 3) {
    throw new Error('Title must be at least 3 characters')
  }

  if (data.priority !== undefined && (data.priority < 1 || data.priority > 10)) {
    throw new Error('Priority must be between 1 and 10')
  }
}

// Use before creation
validateTask(input)
await table.create({ properties: input })
```

## Property Type Reference

| Type | TypeScript Type | Nullable | Notes |
| ---- | --------------- | -------- | ----- |
| `title` | `string` | No | Required, one per database |
| `rich_text` | `string` | Yes | Plain text value |
| `number` | `number` | Yes | Supports format option |
| `select` | `string` | Yes | Single option |
| `multi_select` | `string[]` | Yes | Multiple options |
| `status` | `string` | Yes | Special select type |
| `checkbox` | `boolean` | No | Always has value |
| `date` | `{ start: string, end: string \| null }` | Yes | ISO date strings |
| `url` | `string` | Yes | URL string |
| `email` | `string` | Yes | Email string |
| `phone_number` | `string` | Yes | Phone string |
| `people` | `object[]` | Yes | User objects |
| `files` | `object[]` | Yes | File objects |
| `relation` | `object[]` | Yes | Related page refs |
| `formula` | `string \| number \| boolean \| object` | Yes | Read-only |
| `rollup` | `various` | Yes | Read-only |
| `created_time` | `string` | No | Read-only, ISO date |
| `last_edited_time` | `string` | No | Read-only, ISO date |
| `created_by` | `object` | No | Read-only, user |
| `last_edited_by` | `object` | No | Read-only, user |
