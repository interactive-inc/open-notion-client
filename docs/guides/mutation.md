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

### Bulk update

Returns `BatchResult` with `succeeded` and `failed` arrays. All matching records are processed, paging through results automatically:

```typescript
const result = await tasks.updateMany({
  where: { status: "todo" },
  update: { properties: { status: "doing" } },
})

console.log(result.succeeded.length, result.failed.length)
```

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
