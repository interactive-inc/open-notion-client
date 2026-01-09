# fromNotionBlocks

Convert Notion blocks to markdown text.

## Import

```typescript
import { fromNotionBlocks } from '@interactive-inc/notion-client'
```

## Function Signature

```typescript
function fromNotionBlocks(blocks: NotionBlock[]): string
```

## Supported Block Types

### Headings

| Notion Block | Markdown Output | Example |
|-------------|-----------------|---------|
| `heading_1` | `# ` | `# Main Title` |
| `heading_2` | `## ` | `## Section` |
| `heading_3` | `### ` | `### Subsection` |

```typescript
const blocks = [{
  type: 'heading_1',
  heading_1: {
    rich_text: [{ text: { content: 'Welcome' } }]
  }
}]

fromNotionBlocks(blocks)  // "# Welcome"
```

### Paragraph

| Notion Block | Markdown Output |
|-------------|-----------------|
| `paragraph` | Plain text with line breaks |

```typescript
const blocks = [{
  type: 'paragraph',
  paragraph: {
    rich_text: [{ text: { content: 'Hello world' } }]
  }
}]

fromNotionBlocks(blocks)  // "Hello world"
```

### Lists

| Notion Block | Markdown Output | Example |
|-------------|-----------------|---------|
| `bulleted_list_item` | `- ` | `- Item` |
| `numbered_list_item` | `1. ` | `1. First` |

```typescript
const blocks = [
  {
    type: 'bulleted_list_item',
    bulleted_list_item: {
      rich_text: [{ text: { content: 'First item' } }]
    }
  },
  {
    type: 'bulleted_list_item',
    bulleted_list_item: {
      rich_text: [{ text: { content: 'Second item' } }]
    }
  }
]

fromNotionBlocks(blocks)
// - First item
// - Second item
```

### Code Blocks

| Notion Block | Markdown Output |
|-------------|-----------------|
| `code` | ` ```language\ncode\n``` ` |

```typescript
const blocks = [{
  type: 'code',
  code: {
    rich_text: [{ text: { content: 'console.log("Hello")' } }],
    language: 'javascript'
  }
}]

fromNotionBlocks(blocks)
// ```javascript
// console.log("Hello")
// ```
```

### Rich Text Formatting

| Notion Annotation | Markdown Output | Example |
|------------------|-----------------|---------|
| `bold: true` | `**text**` | `**Bold**` |
| `italic: true` | `*text*` | `*Italic*` |
| `strikethrough: true` | `~~text~~` | `~~Strike~~` |
| `code: true` | `` `text` `` | `` `code` `` |

```typescript
const blocks = [{
  type: 'paragraph',
  paragraph: {
    rich_text: [
      { text: { content: 'Normal ' } },
      { text: { content: 'bold', annotations: { bold: true } } },
      { text: { content: ' and ' } },
      { text: { content: 'italic', annotations: { italic: true } } }
    ]
  }
}]

fromNotionBlocks(blocks)  // "Normal **bold** and *italic*"
```

## Complex Examples

### Full Document

```typescript
const notionBlocks = [
  {
    type: 'heading_1',
    heading_1: {
      rich_text: [{ text: { content: 'Project README' } }]
    }
  },
  {
    type: 'paragraph',
    paragraph: {
      rich_text: [
        { text: { content: 'This is a ' } },
        { text: { content: 'TypeScript', annotations: { code: true } } },
        { text: { content: ' project.' } }
      ]
    }
  },
  {
    type: 'heading_2',
    heading_2: {
      rich_text: [{ text: { content: 'Features' } }]
    }
  },
  {
    type: 'bulleted_list_item',
    bulleted_list_item: {
      rich_text: [{ text: { content: 'Type-safe API' } }]
    }
  },
  {
    type: 'bulleted_list_item',
    bulleted_list_item: {
      rich_text: [{ text: { content: 'Auto-completion' } }]
    }
  },
  {
    type: 'code',
    code: {
      rich_text: [{ text: { content: 'npm install @interactive-inc/notion-client' } }],
      language: 'bash'
    }
  }
]

const markdown = fromNotionBlocks(notionBlocks)
// # Project README
// 
// This is a `TypeScript` project.
// 
// ## Features
// 
// - Type-safe API
// - Auto-completion
// 
// ```bash
// npm install @interactive-inc/notion-client
// ```
```

### Nested Lists (Child Blocks)

```typescript
const blocksWithChildren = [
  {
    type: 'bulleted_list_item',
    bulleted_list_item: {
      rich_text: [{ text: { content: 'Parent item' } }]
    },
    has_children: true,
    children: [
      {
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ text: { content: 'Child item' } }]
        }
      }
    ]
  }
]

fromNotionBlocks(blocksWithChildren)
// - Parent item
//   - Child item
```

## All Supported Block Types

All major Notion block types are supported:

| Category | Block Types |
| -------- | ----------- |
| Text | `paragraph`, `heading_1`, `heading_2`, `heading_3`, `bulleted_list_item`, `numbered_list_item`, `code`, `quote`, `callout`, `to_do`, `toggle` |
| Layout | `divider`, `equation`, `table`, `column_list`, `column` |
| Media | `image`, `video`, `audio`, `file`, `pdf` |
| Embed | `embed`, `bookmark`, `link_preview`, `child_page`, `child_database`, `link_to_page` |

Unsupported blocks output an HTML comment: `<!-- 未対応のブロックタイプ: {type} -->`

## Limitations

- Text color and background color annotations are ignored
- Nested blocks beyond lists may not maintain proper structure

## Usage with NotionTable

```typescript
// Fetch blocks from a Notion page
const page = await notion.pages.retrieve({ page_id: 'page-id' })
const blocks = await notion.blocks.children.list({ block_id: 'page-id' })

// Convert to markdown
const markdown = fromNotionBlocks(blocks.results)

// Use in your application
console.log(markdown)
```

## Best Practices

### Handle Empty Content

```typescript
const blocks = [
  {
    type: 'paragraph',
    paragraph: { rich_text: [] }  // Empty paragraph
  }
]

fromNotionBlocks(blocks)  // Returns empty string with newline
```

### Preserve Formatting

```typescript
// Rich text with multiple annotations
const richBlock = {
  type: 'paragraph',
  paragraph: {
    rich_text: [{
      text: { content: 'Important' },
      annotations: {
        bold: true,
        italic: true,
        code: true
      }
    }]
  }
}

fromNotionBlocks([richBlock])  // "***`Important`***"
```