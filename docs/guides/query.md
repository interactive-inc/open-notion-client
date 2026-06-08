# Query

## findMany

```typescript
const { records, hasMore, nextCursor } = await tasks.findMany({
  where: { status: "todo" },
  sorts: [{ field: "priority", direction: "desc" }],
  limit: 20,
})

// Pagination
const { records: nextPage } = await tasks.findMany({
  limit: 20,
  cursor: nextCursor,
})
```

## findOne

```typescript
const task = await tasks.findOne({
  where: { title: "Important Task" },
})
```

## findById

```typescript
const task = await tasks.findById("page-id")
```

## Filter Operators

### Simple match

```typescript
await tasks.findMany({
  where: { status: "done" },
})
```

### Comparison

```typescript
await tasks.findMany({
  where: {
    priority: { greater_than_or_equal_to: 5 },
    status: { does_not_equal: "done" },
  },
})
```

Supported: `equals`, `does_not_equal`, `contains`, `does_not_contain`, `starts_with`, `ends_with`, `greater_than`, `less_than`, `greater_than_or_equal_to`, `less_than_or_equal_to`, `before`, `after`, `on_or_before`, `on_or_after`, `is_empty`, `is_not_empty`

### Logical operators

```typescript
await tasks.findMany({
  where: {
    or: [
      { status: "urgent" },
      {
        and: [
          { priority: { greater_than_or_equal_to: 8 } },
          { tags: { contains: "important" } },
        ],
      },
    ],
  },
})
```

## Sorting

```typescript
await tasks.findMany({
  sorts: [
    { field: "priority", direction: "desc" },
    { field: "created_time", direction: "asc" },
  ],
})
```

## Working with Results

```typescript
const { records } = await tasks.findMany()

for (const record of records) {
  const props = record.properties()
  console.log(props.title, props.status)

  console.log(record.id)
  console.log(record.url)
  console.log(record.createdAt)

  const body = await record.body()
}
```
