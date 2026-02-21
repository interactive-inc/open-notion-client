# Rollup

Aggregated values from related entries (read-only).

## Schema Definition

```typescript
{
  taskCount: { type: 'rollup' },
  totalHours: { type: 'rollup' }
}
```

## TypeScript Type

```typescript
string | number | boolean | undefined  // Depends on rollup type
```

## Writing

Rollup fields aggregate data from relations and cannot be written directly.

```typescript
// Cannot set rollup values
await table.create({
  properties: { taskCount: 5 }  // This will be ignored
})

// Rollups update automatically based on relations
await table.create({
  properties: {
    relatedTasks: ['task-1', 'task-2', 'task-3']
    // taskCount rollup will show 3
  }
})
```

## Querying

```typescript
// Query aggregated values
await table.findMany({
  where: { 
    taskCount: { greater_than_or_equal_to: 5 }
  }
})

// Available operators depend on rollup type
// Count/Sum: equals, does_not_equal, greater_than, greater_than_or_equal_to, less_than, less_than_or_equal_to
// Average: equals, does_not_equal, greater_than, greater_than_or_equal_to, less_than, less_than_or_equal_to
// Show original: depends on original field type
```

## Examples

```typescript
const projectsTable = new NotionTable({
  client,
  dataSourceId: 'projects-db',
  properties: {
    name: { type: 'title' },
    tasks: { type: 'relation' },
    taskCount: { type: 'rollup' },  // Count of related tasks
    totalHours: { type: 'rollup' },  // Sum of task hours
    avgPriority: { type: 'rollup' },  // Average task priority
    completedCount: { type: 'rollup' }  // Count where status = done
  }
})

// Rollups calculate automatically from relations
const project = await projectsTable.findById('project-123')
console.log(project.properties().taskCount)     // e.g., 15
console.log(project.properties().totalHours)    // e.g., 120
console.log(project.properties().avgPriority)   // e.g., 7.5

// Query by rollup values
const { records: largeProjects } = await projectsTable.findMany({
  where: {
    taskCount: { greater_than_or_equal_to: 10 }
  }
})

const { records: timeIntensive } = await projectsTable.findMany({
  where: {
    totalHours: { greater_than: 100 }
  }
})

// Team example with member stats
const teamsTable = new NotionTable({
  properties: {
    name: { type: 'title' },
    members: { type: 'relation' },
    memberCount: { type: 'rollup' },  // Count
    avgExperience: { type: 'rollup' },  // Average years
    totalCapacity: { type: 'rollup' }  // Sum of capacity
  }
})

// Find teams by size
const { records: largeTeams } = await teamsTable.findMany({
  where: {
    memberCount: { greater_than_or_equal_to: 10 }
  }
})
```