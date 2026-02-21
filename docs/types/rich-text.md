# Rich Text

Plain text content without formatting.

## Schema Definition

```typescript
{
  description: { type: 'rich_text' },
  notes: { type: 'rich_text' }
}
```

## TypeScript Type

```typescript
string | undefined
// or just string if required
```

## Writing

```typescript
await table.create({
  properties: {
    description: 'This is plain text content',
    notes: 'Required field'
  }
})

// With markdown body
await table.create({
  properties: {
    title: 'My Page',
  },
  body: `# Markdown Content

  This is **bold** and *italic* text.`
})
```

## Querying

```typescript
// String operators
await table.findMany({
  where: { 
    description: { contains: 'important' }
  }
})

// Available operators
contains        // Contains substring
starts_with     // Starts with string
ends_with       // Ends with string
is_empty        // Is empty
is_not_empty    // Is not empty
```

## Examples

```typescript
const notesTable = new NotionTable({
  client,
  dataSourceId: 'notes-db',
  properties: {
    title: { type: 'title' },
    content: { type: 'rich_text' },
    summary: { type: 'rich_text' }
  }
})

// Create note with rich text
const note = await notesTable.create({
  properties: {
    title: 'Meeting Notes',
    content: 'Discussed project timeline and deliverables',
    summary: 'Q4 planning meeting'
  }
})

// Create with markdown body
const article = await notesTable.create({
  properties: {
    title: 'Technical Guide',
  },
  body: `## Overview

This guide covers:
- Installation steps
- Configuration options
- Best practices

### Code Example

\`\`\`typescript
const result = await api.call()
\`\`\`
`
})

// Search notes
const { records: results } = await notesTable.findMany({
  where: {
    content: { contains: 'project' }
  }
})
```