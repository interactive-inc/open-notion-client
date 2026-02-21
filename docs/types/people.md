# People

User references for assigning and mentioning.

## Schema Definition

```typescript
{
  assignee: { type: 'people' },
  reviewers: { type: 'people' }  // Can be multiple users
}
```

## TypeScript Type

```typescript
string[] | undefined  // Array of user IDs
```

## Writing

```typescript
await table.create({
  properties: {
    assignee: ['user-id-1'],
    reviewers: ['user-id-1', 'user-id-2']
  }
})

await table.update('page-id', {
  properties: { assignee: ['new-user-id'] }
})
```

## Querying

```typescript
// Contains specific user
await table.findMany({
  where: { 
    assignee: { contains: 'user-id-1' }
  }
})

// Available operators
contains       // Contains user ID
is_empty       // No users assigned
is_not_empty   // Has users assigned
```

## Examples

```typescript
const tasksTable = new NotionTable({
  client,
  dataSourceId: 'tasks-db',
  properties: {
    title: { type: 'title' },
    assignee: { type: 'people' },
    reviewers: { type: 'people' },
    watchers: { type: 'people' }
  }
})

// Create task with assignee
const task = await tasksTable.create({
  properties: {
    title: 'Review PR #123',
    assignee: ['user-123'],
    reviewers: ['user-456', 'user-789']
  }
})

// Find tasks assigned to user
const { records: myTasks } = await tasksTable.findMany({
  where: {
    assignee: { contains: 'user-123' }
  }
})

// Find unassigned tasks
const { records: unassigned } = await tasksTable.findMany({
  where: {
    assignee: { is_empty: true }
  }
})

// Find tasks needing review (OR: assigned to either reviewer)
const { records: needsReview } = await tasksTable.findMany({
  where: {
    or: [
      { reviewers: { contains: 'user-456' } },
      { reviewers: { contains: 'user-789' } }
    ]
  }
})
```