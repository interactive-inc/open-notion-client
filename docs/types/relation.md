# Relation

Links to other database entries.

## Schema Definition

```typescript
{
  project: { type: 'relation' },
  relatedTasks: { type: 'relation' }  // Can be multiple
}
```

## TypeScript Type

```typescript
string[] | undefined  // Array of page IDs
```

## Writing

```typescript
await table.create({
  properties: {
    project: ['project-page-id'],
    relatedTasks: ['task-1-id', 'task-2-id']
  }
})

await table.update('page-id', {
  properties: { project: ['new-project-id'] }
})
```

## Querying

```typescript
// Contains specific relation
await table.findMany({
  where: { 
    project: { contains: 'project-id' }
  }
})

// Available operators
contains       // Contains page ID
is_empty       // No relations
is_not_empty   // Has relations
```

## Examples

```typescript
const tasksTable = new NotionTable({
  client,
  dataSourceId: 'tasks-db',
  properties: {
    title: { type: 'title' },
    project: { type: 'relation' },
    blockedBy: { type: 'relation' },
    relatedTasks: { type: 'relation' }
  }
})

// Create task with relations
const task = await tasksTable.create({
  properties: {
    title: 'Implement authentication',
    project: ['project-123'],
    blockedBy: ['task-456'],
    relatedTasks: ['task-789', 'task-101']
  }
})

// Find tasks in project
const { records: projectTasks } = await tasksTable.findMany({
  where: {
    project: { contains: 'project-123' }
  }
})

// Find blocked tasks
const { records: blockedTasks } = await tasksTable.findMany({
  where: {
    blockedBy: { is_not_empty: true }
  }
})

// Find tasks with specific relations (OR: related to either task)
const { records: related } = await tasksTable.findMany({
  where: {
    or: [
      { relatedTasks: { contains: 'task-789' } },
      { relatedTasks: { contains: 'task-101' } }
    ]
  }
})
```