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

Direct values also work for `url` / `email` / `phone_number` (exact match), `relation` (a page ID or an array of page IDs), and `people` (a user ID, a user object, or an array of either).

If a `where` value cannot be converted to a Notion filter, an `Error` is thrown instead of silently matching all records.

Unknown property names also throw. `null`, `undefined`, and empty array values are omitted; use `{ is_empty: true }` to search for empty values. Bulk mutations and `upsert` reject a nonempty `where` that produces no effective filter. Use `{}` explicitly for operations intended to match all records.

Relative date operators (`this_week`, `past_week`, `past_month`, `past_year`, `next_week`, `next_month`, `next_year`) and typed formula filters are supported. Logical operators and property conditions at the same level are combined with AND. A schema property named `or` or `and` takes precedence over the logical operator of the same name.

`limit` must be a non-negative safe integer. `limit: 0` returns an empty result without an API call. Each `findMany` call returns at most 1,024 records; follow `nextCursor` for more. Inconsistent or repeated cursors, partial pages and incomplete query responses throw rather than return a result that appears complete.

### Logical operators

```typescript
await tasks.findMany({
  where: {
    or: [
      { status: "urgent" },
      {
        and: [{ priority: { greater_than_or_equal_to: 8 } }, { tags: { contains: "important" } }],
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
