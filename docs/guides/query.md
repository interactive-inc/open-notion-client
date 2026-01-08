# Query

Learn how to query and retrieve data from Notion databases.

## Basic Setup

First, create a NotionTable instance with your schema:

```typescript
import { NotionTable } from '@interactive-inc/notion-client'
import { Client } from '@notionhq/client'

const client = new Client({ auth: process.env.NOTION_TOKEN })

const contactsTable = new NotionTable({
  client,
  dataSourceId: 'your-database-id',
  properties: {
    name: { type: 'title' },
    email: { type: 'email' },
    company: { type: 'select', options: ['Apple', 'Google', 'Microsoft'] },
    active: { type: 'checkbox' }
  }
})
```

## Finding Records

### Find Many

Retrieve multiple records with optional filtering:

```typescript
// Get all records
const contacts = await contactsTable.findMany()

// With filtering
const activeContacts = await contactsTable.findMany({
  where: { active: { equals: true } }
})

// With count limit
const first10 = await contactsTable.findMany({
  count: 10
})

// Access properties
for (const contact of contacts) {
  const props = contact.properties()
  console.log(props.name, props.email)
}
```

### Find One

Get the first matching record:

```typescript
const contact = await contactsTable.findOne({
  where: { email: 'john@example.com' }
})

if (contact) {
  const props = contact.properties()
  console.log(props.name)
}
```

### Find by ID

Retrieve a specific record by Notion page ID:

```typescript
const contact = await contactsTable.findById('page-id-here')
```

## Advanced Queries

### Comparison Operators

```typescript
// Greater than or equal to
const highPriority = await tasksTable.findMany({
  where: { priority: { greater_than_or_equal_to: 8 } }
})

// Does not equal
const activeTasks = await tasksTable.findMany({
  where: { status: { does_not_equal: 'completed' } }
})

// Range query using AND
const mediumPriority = await tasksTable.findMany({
  where: {
    and: [
      { priority: { greater_than_or_equal_to: 4 } },
      { priority: { less_than_or_equal_to: 7 } }
    ]
  }
})
```

### String Operators

```typescript
// Contains
const results = await contactsTable.findMany({
  where: { name: { contains: 'John' } }
})

// Starts with
const results = await contactsTable.findMany({
  where: { email: { starts_with: 'admin@' } }
})

// Ends with
const results = await contactsTable.findMany({
  where: { email: { ends_with: '@company.com' } }
})
```

### Logical Operators

```typescript
// OR query
const results = await tasksTable.findMany({
  where: {
    or: [
      { status: { equals: 'urgent' } },
      { priority: { greater_than_or_equal_to: 9 } }
    ]
  }
})

// Complex AND/OR
const results = await tasksTable.findMany({
  where: {
    and: [
      { active: { equals: true } },
      {
        or: [
          { priority: { greater_than_or_equal_to: 8 } },
          { tags: { contains: 'important' } }
        ]
      }
    ]
  }
})
```

## Sorting Results

```typescript
// Single sort
const results = await tasksTable.findMany({
  sorts: [{ field: 'priority', direction: 'desc' }]
})

// Multiple sorts
const results = await contactsTable.findMany({
  sorts: [
    { field: 'company', direction: 'asc' },
    { field: 'name', direction: 'asc' }
  ]
})
```

## Working with Results

Transform and use query results:

```typescript
const contacts = await contactsTable.findMany({
  where: { active: { equals: true } }
})

// Access properties
for (const contact of contacts) {
  const props = contact.properties()
  console.log(`${props.name} - ${props.email}`)

  // Get metadata
  console.log(contact.id)
  console.log(contact.url)
  console.log(contact.createdAt)
  console.log(contact.updatedAt)

  // Get page body as markdown
  const body = await contact.body()
  console.log(body)
}

// Map to simple objects
const simpleList = contacts.map(c => c.properties())
```

## Performance Tips

### Use Specific Queries

```typescript
// Good: Specific query with filter
const active = await table.findMany({
  where: { status: { equals: 'active' } },
  count: 20
})

// Avoid: Fetching all then filtering in JavaScript
const all = await table.findMany()
const active = all.filter(r => r.properties().status === 'active')
```

### Use Built-in Caching

NotionTable has built-in caching for `findById`:

```typescript
// Use cache option to enable caching
const page = await table.findById('page-id', { cache: true })

// Cache stores pages and blocks automatically
// Clear cache when needed
table.clearCache()
```

You can also share a cache instance across multiple tables:

```typescript
import { NotionMemoryCache, NotionTable } from '@interactive-inc/notion-client'

const cache = new NotionMemoryCache()

const tasksTable = new NotionTable({
  client,
  dataSourceId: 'tasks-db',
  properties: { title: { type: 'title' } } as const,
  cache
})

const projectsTable = new NotionTable({
  client,
  dataSourceId: 'projects-db',
  properties: { name: { type: 'title' } } as const,
  cache
})
```

## Error Handling

```typescript
try {
  const contact = await contactsTable.findById('invalid-id')
} catch (error) {
  if (error.message.includes('not found')) {
    console.log('Contact does not exist')
  }
}
```