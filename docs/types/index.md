# Property Types

Define your schema with property types that map Notion properties to simple TypeScript values.

```typescript
const table = new NotionTable({
  client,
  dataSourceId: "db-id",
  properties: {
    title: { type: "title" },
    status: { type: "select", options: ["todo", "done"] as const },
    priority: { type: "number" },
  } as const,
})
```

Use `as const` to preserve literal types for auto-completion.

## Text

- `title` -- `string` -- Page title. Every database must have one.
- `rich_text` -- `string | null` -- Text content.
- `url` -- `string | null` -- URL string.
- `email` -- `string | null` -- Email address.
- `phone_number` -- `string | null` -- Phone number.

## Numbers

- `number` -- `number | null`

## Selection

- `select` -- `string | null` -- Single choice from options.
- `multi_select` -- `string[]` -- Multiple choices from options.
- `status` -- `string | null` -- Status field (special select).

```typescript
{
  category: { type: "select", options: ["bug", "feature"] as const },
  tags: { type: "multi_select", options: ["urgent", "blocked"] as const },
}
```

## Boolean

- `checkbox` -- `boolean`

## Date

- `date` -- `{ start: string, end: string | null } | null` -- ISO date strings.

```typescript
await table.create({
  properties: {
    deadline: { start: "2024-12-31", end: null },
  },
})
```

## References

- `people` -- User objects. Write with user IDs, read as `{ id, name, email, avatarUrl }`.
- `files` -- File objects with `name` and `url`.
- `relation` -- Array of related page IDs.

## Read-only

These are computed by Notion and cannot be written:

- `formula` -- Computed value (string, number, boolean, or date).
- `rollup` -- Aggregated value from relations.
- `created_time` -- ISO timestamp.
- `last_edited_time` -- ISO timestamp.
- `created_by` -- User object.
- `last_edited_by` -- User object.

## Type Inference

Extract TypeScript types from your schema with `SchemaType`:

```typescript
import type { SchemaType } from "@interactive-inc/notion-client"

const properties = {
  title: { type: "title" },
  status: { type: "select", options: ["active", "inactive"] as const },
  count: { type: "number" },
} as const

type MyRecord = SchemaType<typeof properties>
// { title: string, status: string | null, count: number | null }
```
