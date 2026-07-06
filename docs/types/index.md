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

Write `null` to `title` or `rich_text` to clear the value. Strings over 2,000 characters are split into multiple rich text elements automatically to fit Notion's limit.

## Numbers

- `number` -- `number | null`

Optional `min` and `max` in the config are validated on write. Out-of-range values throw an error.

```typescript
{
  priority: { type: "number", min: 0, max: 10 },
}
```

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

When `options` is defined, values outside the list throw an error on write.

## Boolean

- `checkbox` -- `boolean`

Writing `null` is treated as `false`, since a Notion checkbox has no unset state.

## Date

- `date` -- `{ start: string, end: string | null, timeZone: string | null } | null` -- ISO date strings.

```typescript
await table.create({
  properties: {
    deadline: { start: "2024-12-31", end: null, timeZone: null },
  },
})
```

## References

- `people` -- User objects. Write with user IDs, read as `{ id, name, email, avatarUrl }`.
- `files` -- File objects with `name`, `url`, and `type` (`"file"` or `"external"`). Notion-hosted files (`type: "file"`) are preserved when written back.
- `relation` -- Array of related page IDs.

## Read-only

These are computed by Notion and cannot be written:

- `formula` -- Computed value (string, number, boolean, or date). Declared with `formulaType` in the config; if the actual formula result type differs, reading throws an error.
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
