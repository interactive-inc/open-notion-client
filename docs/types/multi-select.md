# Multi-Select

Multiple choices from predefined options.

## Schema Definition

```typescript
{
  tags: { 
    type: 'multi_select', 
    options: ['bug', 'feature', 'docs', 'urgent'] as const
  }
}
```

## TypeScript Type

```typescript
('bug' | 'feature' | 'docs' | 'urgent')[] | undefined
```

## Writing

```typescript
await table.create({
  properties: {
    tags: ['bug', 'urgent']  // Array of options
  }
})

await table.update('page-id', {
  properties: {
    tags: ['feature']  // Replace all tags
  }
})
```

## Querying

```typescript
// Contains specific tag
await table.findMany({
  where: { 
    tags: { contains: 'bug' }
  }
})

// Contains any of these tags (use or)
await table.findMany({
  where: {
    or: [
      { tags: { contains: 'bug' } },
      { tags: { contains: 'urgent' } }
    ]
  }
})

// Available operators
contains       // Contains specific value
is_empty       // No tags
is_not_empty   // Has tags
```

## Examples

```typescript
const issuesTable = new NotionTable({
  client,
  dataSourceId: 'issues-db',
  properties: {
    title: { type: 'title' },
    tags: {
      type: 'multi_select',
      options: ['bug', 'feature', 'enhancement', 'docs', 'urgent', 'blocked'] as const
    },
    labels: {
      type: 'multi_select',
      options: ['frontend', 'backend', 'database', 'api'] as const
    }
  }
})

// Create issue with multiple tags
const issue = await issuesTable.create({
  properties: {
    title: 'Login button not working',
    tags: ['bug', 'urgent'],
    labels: ['frontend']
  }
})

// Find urgent bugs (AND: must have both tags)
const { records: urgentBugs } = await issuesTable.findMany({
  where: {
    and: [
      { tags: { contains: 'bug' } },
      { tags: { contains: 'urgent' } }
    ]
  }
})

// Find frontend or backend issues (OR: has either tag)
const { records: techIssues } = await issuesTable.findMany({
  where: {
    or: [
      { labels: { contains: 'frontend' } },
      { labels: { contains: 'backend' } }
    ]
  }
})
```