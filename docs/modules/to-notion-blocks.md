# toNotionBlocks

Convert markdown text to Notion block objects.

## Import

```typescript
import { toNotionBlocks } from '@interactive-inc/notion-client'
```

## Function Signature

```typescript
function toNotionBlocks(markdown: string): BlockObjectRequest[]
```

Note: Block type transformation (e.g., heading level adjustment) is handled by the [NotionMarkdown](./index#notionmarkdown) option in NotionTable, not in this function directly.

## Supported Markdown

### Headings

| Markdown | Notion Block | Example |
|----------|--------------|---------|
| `# ` | `heading_1` | `# Title` |
| `## ` | `heading_2` | `## Section` |
| `### ` | `heading_3` | `### Subsection` |
| `#### ` and below | `heading_3` | `#### Details` → H3 |

```typescript
const markdown = `# Main Title
## Section
### Subsection`

const blocks = toNotionBlocks(markdown)
// [
//   { type: 'heading_1', heading_1: { rich_text: [...] } },
//   { type: 'heading_2', heading_2: { rich_text: [...] } },
//   { type: 'heading_3', heading_3: { rich_text: [...] } }
// ]
```

### Paragraphs

| Markdown | Notion Block |
|----------|--------------|
| Plain text | `paragraph` |

```typescript
const markdown = `This is a paragraph.

This is another paragraph.`

const blocks = toNotionBlocks(markdown)
// [
//   { type: 'paragraph', paragraph: { rich_text: [...] } },
//   { type: 'paragraph', paragraph: { rich_text: [...] } }
// ]
```

### Lists

| Markdown | Notion Block | Example |
|----------|--------------|---------|
| `- `, `* `, `+ ` | `bulleted_list_item` | `- Item` |
| `1. `, `2. `, etc. | `numbered_list_item` | `1. First` |

```typescript
const markdown = `- First bullet
- Second bullet
  - Nested bullet

1. First number
2. Second number`

const blocks = toNotionBlocks(markdown)
// Bullets and numbered lists with proper nesting
```

### Code Blocks

| Markdown | Notion Block |
|----------|--------------|
| ` ```lang ` | `code` with language |
| ` ``` ` | `code` without language |

```typescript
const markdown = `\`\`\`typescript
const hello = "world"
console.log(hello)
\`\`\``

const blocks = toNotionBlocks(markdown)
// [{
//   type: 'code',
//   code: {
//     rich_text: [{ text: { content: 'const hello = "world"\nconsole.log(hello)' } }],
//     language: 'typescript'
//   }
// }]
```

### Inline Formatting

| Markdown | Notion Annotation | Example |
|----------|------------------|---------|
| `**text**` | `bold: true` | `**Bold text**` |
| `*text*` or `_text_` | `italic: true` | `*Italic text*` |
| `~~text~~` | `strikethrough: true` | `~~Strikethrough~~` |
| `` `text` `` | `code: true` | `` `inline code` `` |

```typescript
const markdown = `This has **bold**, *italic*, ~~strike~~, and \`code\`.`

const blocks = toNotionBlocks(markdown)
// Paragraph with rich text annotations
```

## Complex Examples

### Full Document

```typescript
const markdown = `# Project Documentation

This project uses **TypeScript** and *React*.

## Installation

Run the following command:

\`\`\`bash
npm install
\`\`\`

## Features

- Type safety
- Hot reload
- Modern tooling

### Configuration

1. Copy the example file
2. Update settings
3. Restart server`

const blocks = toNotionBlocks(markdown)
// Complete Notion block structure
```

### With Block Type Transformation

```typescript
import { NotionMarkdown, NotionTable } from '@interactive-inc/notion-client'

const markdown = new NotionMarkdown({
  heading_1: 'heading_2',  // # becomes ##
  heading_2: 'heading_3'   // ## becomes ###
})

const table = new NotionTable({
  client,
  dataSourceId: 'db-id',
  properties: { title: { type: 'title' } },
  markdown  // Transformation applied during create/update
})

// Title is heading_2, Subtitle is heading_3
await table.create({
  properties: { title: 'Document' },
  body: `# Title\n## Subtitle`
})
```

### Nested Lists

```typescript
const markdown = `- Parent item
  - Child item
    - Grandchild item
  - Another child
- Back to parent`

const blocks = toNotionBlocks(markdown)
// Creates proper parent-child relationships
```

## Limitations

The following markdown features are not yet converted to Notion blocks:

| Feature | Current Behavior |
| ------- | ---------------- |
| Tables | Ignored |
| Images `![alt](url)` | Ignored |
| Blockquotes `>` | Ignored |
| Horizontal rules `---` | Ignored |
| To-do `- [ ]` | Ignored |
| HTML tags | Stripped |

Links `[text](url)` in inline text are converted to rich text with link annotations.

Notes:

- Only CommonMark and GitHub Flavored Markdown are supported
- Indented code blocks (4 spaces) are treated as paragraphs
- Nested lists are fully supported

## Usage with NotionTable

```typescript
const blogTable = new NotionTable({
  client,
  dataSourceId: 'blog-db',
  properties: {
    title: { type: 'title' }
  }
})

// Create page with markdown content
const post = await blogTable.create({
  properties: {
    title: 'My Blog Post'
  },
  body: `# Introduction

This is my **awesome** blog post about \`TypeScript\`.

## Main Points

1. Type safety is important
2. Developer experience matters
3. Performance is key

\`\`\`typescript
interface User {
  name: string
  email: string
}
\`\`\`

## Conclusion

Thanks for reading!`
})
```

## Best Practices

### Escape Special Characters

```typescript
// Escape backticks in inline code
const markdown = 'Use \\`console.log()\\` to debug'

// Escape asterisks if not formatting
const markdown = 'Multiply 5 \\* 10'
```

### Handle Empty Lines

```typescript
const markdown = `Paragraph one


Paragraph two`  // Multiple empty lines

const blocks = toNotionBlocks(markdown)
// Only creates two paragraph blocks
```

### Language Detection

```typescript
// Specify language for syntax highlighting
const markdown = `\`\`\`javascript
// JavaScript code
\`\`\`

\`\`\`python
# Python code
\`\`\`

\`\`\`
// No language specified
\`\`\``
```

## Performance Tips

### Batch Processing

```typescript
// Process large documents in chunks
const chunks = markdown.split('\n\n')
const blockArrays = chunks.map(chunk => toNotionBlocks(chunk))
const allBlocks = blockArrays.flat()
```

### Caching

```typescript
// Cache converted blocks for repeated use
const cache = new Map<string, BlockObjectRequest[]>()

function getCachedBlocks(markdown: string): BlockObjectRequest[] {
  if (cache.has(markdown)) {
    return cache.get(markdown)!
  }

  const blocks = toNotionBlocks(markdown)
  cache.set(markdown, blocks)
  return blocks
}
```