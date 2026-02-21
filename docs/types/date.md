# Date

Date and optional time values.

## Schema Definition

```typescript
{
  createdAt: { type: 'date' },
  deadline: { type: 'date' }
}
```

## TypeScript Type

```typescript
string | undefined  // ISO 8601 format
// or just string if required
```

## Writing

```typescript
await table.create({
  properties: {
    createdAt: '2024-01-15',
    deadline: '2024-12-31T23:59:59Z'
  }
})

// Using Date object
await table.create({
  properties: {
    deadline: new Date('2024-12-31').toISOString()
  }
})
```

## Querying

```typescript
// Date comparisons
await table.findMany({
  where: { 
    deadline: { greater_than_or_equal_to: '2024-01-01' }
  }
})

// Available operators
equals            // Equals
does_not_equal    // Not equals
before            // Before date
after             // After date
on_or_before      // On or before
on_or_after       // On or after
is_empty          // No date
is_not_empty      // Has date
```

## Examples

```typescript
const eventsTable = new NotionTable({
  client,
  dataSourceId: 'events-db',
  properties: {
    title: { type: 'title' },
    startDate: { type: 'date' },
    endDate: { type: 'date' },
    registrationDeadline: { type: 'date' }
  }
})

// Create event
const event = await eventsTable.create({
  properties: {
    title: 'Tech Conference 2024',
    startDate: '2024-06-15',
    endDate: '2024-06-17',
    registrationDeadline: '2024-06-01'
  }
})

// Find upcoming events
const { records: upcoming } = await eventsTable.findMany({
  where: {
    startDate: { after: new Date().toISOString() }
  },
  sorts: [{ field: 'startDate', direction: 'asc' }]
})

// Find events this month
const { records: thisMonth } = await eventsTable.findMany({
  where: {
    startDate: {
      on_or_after: '2024-01-01',
      before: '2024-02-01'
    }
  }
})
```