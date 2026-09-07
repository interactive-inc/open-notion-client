# Mutation

## Create

```typescript
const task = await tasks.create({
  properties: {
    title: "New task",
    status: "todo",
    priority: 5,
  },
})
```

### With Markdown body

```typescript
const post = await posts.create({
  properties: { title: "Blog Post" },
  body: `# Introduction

This is **markdown** content.

- Item A
- Item B
`,
})
```

### Bulk creation

```typescript
const result = await tasks.createMany([
  { properties: { title: "Task 1", priority: 5 } },
  { properties: { title: "Task 2", priority: 3 } },
])

console.log(result.succeeded.length)
console.log(result.failed.length)

for (const failure of result.failed) {
  console.error(failure.error.message)
}
```

## Update

```typescript
await tasks.update("page-id", {
  properties: { status: "done" },
})

// Update body
await tasks.update("page-id", {
  properties: {},
  body: "# Updated content",
})

// Clear body (pass null)
await tasks.update("page-id", {
  properties: {},
  body: null,
})
```

Omitting `body` leaves the existing body unchanged; `null`, `""`, or whitespace clears it. Text is split into rich-text elements of at most 2,000 UTF-16 code units without splitting surrogate pairs. Top-level blocks are sent in chunks of at most 100. Nested arrays or rich-text arrays exceeding 100 elements, and equations exceeding 1,000 characters, are rejected before a page is changed.

Body replacement appends all new blocks before deleting the old ones. Notion does not provide a transaction for this operation: a failed append can leave the old body plus part of the new body, and a failed delete can leave both old and new blocks. Properties may already be updated. A failure invalidates cached values so a subsequent read can inspect the current state before retrying. Concurrent replacements are not atomic.

### Bulk update

Returns `BatchResult` with `succeeded` and `failed` arrays. All matching records are processed, paging through results automatically:

```typescript
const result = await tasks.updateMany({
  where: { status: "todo" },
  update: { properties: { status: "doing" } },
})

console.log(result.succeeded.length, result.failed.length)
```

`limit: 0` performs no updates. Invalid limits throw before querying. A nonempty `where` with no effective filter is rejected; use `{}` explicitly to update all matching records.

## Upsert

```typescript
await contacts.upsert({
  where: { email: "john@example.com" },
  create: {
    properties: { name: "John", email: "john@example.com" },
  },
  update: {
    properties: { lastSeen: { start: new Date().toISOString(), end: null, timeZone: null } },
  },
})
```

The lookup and write are separate requests. Concurrent upserts can create duplicates because Notion has no uniqueness constraint for this operation.

## Delete

```typescript
// Archive
await tasks.delete("page-id")

// Bulk archive (processes all matching records, returns BatchResult)
const result = await tasks.deleteMany({ status: "cancelled" })

// Restore
await tasks.restore("page-id")
```

## Safe Mode

The library retries reads and idempotent updates on 429/5xx errors. Page creation and block appends retry explicit temporary refusals (429/529), but do not retry other 5xx responses because the write may already have succeeded. An injected SDK client can have its own retry policy; pass `retry: false` to `new Client(...)` when you want the table's retry count to be the only retry layer.

All mutation methods are available on `.safe`, returning `T | Error` instead of throwing:

```typescript
const result = await tasks.safe.create({
  properties: { title: "New task" },
})

if (result instanceof Error) {
  console.error(result.message)
} else {
  console.log(result.id)
}
```
