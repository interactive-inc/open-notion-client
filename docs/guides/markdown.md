# Markdown

## Writing Markdown to Notion

Create or update pages with Markdown content:

```typescript
await tasks.create({
  properties: { title: "Blog Post" },
  body: `# Introduction

Paragraph with **bold** and *italic*.

## Features

- Item A
- Item B

\`\`\`typescript
const x = 1
\`\`\`

> Blockquote text

---
`,
})
```

Supported: headings, paragraphs, bulleted/numbered lists, code blocks, blockquotes, dividers, to-do items, callouts, inline formatting (bold, italic, strikethrough, code, links).

### Heading level transformation

```typescript
import { NotionMarkdown } from "@interactive-inc/notion-client"

const markdown = new NotionMarkdown({
  heading_1: "heading_2",
  heading_2: "heading_3",
})

const tasks = new NotionTable({
  client,
  dataSourceId: "database-id",
  properties: { title: { type: "title" } } as const,
  markdown,
})

// Create a new instance with different mapping
const updated = markdown.withMapping({ heading_1: "heading_3" })
```

## Reading Notion as Markdown

### Via NotionPageReference

```typescript
const page = await tasks.findById("page-id")
const body = await page.body()
```

### Via fromNotionBlocks

```typescript
import { fromNotionBlocks } from "@interactive-inc/notion-client"

const markdown = fromNotionBlocks(notionBlocks)
```

Unsupported block types are silently skipped. Use `onUnsupportedBlock` to track them:

```typescript
const markdown = fromNotionBlocks(blocks, {
  onUnsupportedBlock: (blockType, blockId) => {
    console.warn(`Skipped: ${blockType} (${blockId})`)
  },
})
```

### Via toNotionBlocks

```typescript
import { toNotionBlocks } from "@interactive-inc/notion-client"

const blocks = toNotionBlocks("# Hello\n\nWorld")
```

## Fetching nested blocks

The Notion API does not include child blocks by default. Use `enhance` to recursively fetch all children:

```typescript
import { enhance, fromNotionBlocks } from "@interactive-inc/notion-client"

const fetchAllBlocks = enhance((args) => notion.blocks.children.list(args))

const blocks = await fetchAllBlocks({ block_id: "page-id" })
const markdown = fromNotionBlocks(blocks)
```
