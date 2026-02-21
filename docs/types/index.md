# Property Types

Notion databases support various property types, each with specific behaviors and constraints.

## Overview

This section documents all supported Notion property types and how to use them with notion-client:

- **Basic Types** - Text, numbers, checkboxes, and dates
- **Selection Types** - Single and multi-select options
- **Reference Types** - People, files, and relations
- **Computed Types** - Formulas and rollups

## Quick Reference

| Property Type | TypeScript Type | Example |
|--------------|----------------|---------|
| `title` | `string` | `"Project Name"` |
| `rich_text` | `string` | `"Description text"` |
| `number` | `number` | `42` |
| `select` | `string` | `"in_progress"` |
| `multi_select` | `string[]` | `["bug", "urgent"]` |
| `checkbox` | `boolean` | `true` |
| `date` | `string` | `"2024-01-15"` |
| `email` | `string` | `"user@example.com"` |
| `url` | `string` | `"https://example.com"` |
| `phone_number` | `string` | `"+1-555-0123"` |
| `people` | `string[]` | `["user-id-1", "user-id-2"]` |
| `files` | `Array<{name, url}>` | `[{name: "doc.pdf", url: "..."}]` |
| `relation` | `string[]` | `["page-id-1", "page-id-2"]` |
| `formula` | `any` | Read-only computed value |
| `rollup` | `any` | Read-only aggregated value |

## Usage Pattern

Each property type follows the same pattern:

```typescript
// Schema definition
{
  propertyName: { 
    type: 'property_type',
    // Type-specific options
  }
}

// Writing
await table.create({
  properties: { propertyName: value }
})

// Querying
await table.findMany({
  where: { 
    propertyName: filterValue 
  }
})
```

Browse the individual pages for detailed documentation on each type.