# Select

Single choice from predefined options.

## Schema Definition

```typescript
{
  status: { 
    type: 'select', 
    options: ['todo', 'in_progress', 'done'] as const,
      // Optional
  }
}
```

Use `as const` to preserve literal types.

## TypeScript Type

```typescript
'todo' | 'in_progress' | 'done' | undefined
// or just 'todo' | 'in_progress' | 'done' if required
```

## Writing

```typescript
await table.create({
  properties: { status: 'todo' }  // Auto-completes options
})

await table.update('page-id', {
  properties: { status: 'done' }
})
```

## Querying

```typescript
// Exact match
await table.findMany({
  where: { status: 'done' }
})

// Multiple values (use or)
await table.findMany({
  where: {
    or: [
      { status: 'todo' },
      { status: 'in_progress' }
    ]
  }
})

// Available operators
equals            // Equals (default)
does_not_equal    // Not equals
is_empty          // No selection
is_not_empty      // Has selection
```

## Examples

```typescript
const tasksTable = new NotionTable({
  client,
  dataSourceId: 'tasks-db',
  properties: {
    title: { type: 'title' },
    status: {
      type: 'select',
      options: ['backlog', 'todo', 'in_progress', 'review', 'done'] as const
    },
    priority: {
      type: 'select',
      options: ['low', 'medium', 'high', 'urgent'] as const,

    }
  }
})

// Create with select values
const task = await tasksTable.create({
  properties: {
    title: 'Implement auth',
    status: 'todo',
    priority: 'high'
  }
})

// Query by status
const { records: activeTasks } = await tasksTable.findMany({
  where: {
    and: [
      { or: [{ status: 'todo' }, { status: 'in_progress' }] },
      { priority: { does_not_equal: 'low' } }
    ]
  }
})
```