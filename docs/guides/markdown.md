# Enhance Function

The `enhance` function recursively fetches all child blocks from Notion pages.

## Purpose

When fetching blocks from Notion API, child blocks are not included by default. The `enhance` function wraps the Notion client to automatically fetch all nested blocks recursively.

## Import

```typescript
import { enhance } from "@interactive-inc/notion-client"
```

## Function Signature

```typescript
function enhance(
  client: (args: ListBlockChildrenParameters) => Promise<ListBlockChildrenResponse>,
): (args: ListBlockChildrenParameters) => Promise<NotionBlock[]>
```

## How It Works

1. Fetches blocks for a given block ID
2. For each block with `has_children: true`, recursively fetches its children
3. Returns a flat array with all blocks including their nested children

## Basic Usage

```typescript
import { Client } from "@notionhq/client"
import { enhance } from "@interactive-inc/notion-client"

const notion = new Client({ auth: process.env.NOTION_TOKEN })

// Wrap the blocks.children.list method
const fetchAllBlocks = enhance((args) => notion.blocks.children.list(args))

// Fetch all blocks including nested children
const blocks = await fetchAllBlocks({
  block_id: "page-id",
})
```

## Example: Fetching Complete Page Content

```typescript
import { Client } from "@notionhq/client"
import { enhance, fromNotionBlocks } from "@interactive-inc/notion-client"

const notion = new Client({ auth: process.env.NOTION_TOKEN })

// Create enhanced client
const fetchAllBlocks = enhance((args) => notion.blocks.children.list(args))

// Fetch page with all nested content
async function getPageContent(pageId: string) {
  // Get all blocks including children
  const blocks = await fetchAllBlocks({
    block_id: pageId,
  })

  // Convert to markdown
  const markdown = fromNotionBlocks(blocks)

  return markdown
}

// Use it
const content = await getPageContent("your-page-id")
console.log(content)
```

## Nested Block Structure

Without `enhance`:

```typescript
// Standard API call only returns top-level blocks
const response = await notion.blocks.children.list({
  block_id: 'page-id'
})

// response.results:
[
  { type: 'heading_1', has_children: false, ... },
  { type: 'bulleted_list_item', has_children: true, ... }, // Children not included!
  { type: 'paragraph', has_children: false, ... }
]
```

With `enhance`:

```typescript
// Enhanced call returns all blocks with children
const blocks = await fetchAllBlocks({
  block_id: 'page-id'
})

// blocks:
[
  { type: 'heading_1', has_children: false, children: [], ... },
  {
    type: 'bulleted_list_item',
    has_children: true,
    children: [
      { type: 'bulleted_list_item', has_children: false, children: [], ... },
      { type: 'bulleted_list_item', has_children: false, children: [], ... }
    ],
    ...
  },
  { type: 'paragraph', has_children: false, children: [], ... }
]
```

## Use Cases

### Export Entire Pages

```typescript
const fetchAllBlocks = enhance((args) => notion.blocks.children.list(args))

async function exportPage(pageId: string) {
  const blocks = await fetchAllBlocks({ block_id: pageId })
  const markdown = fromNotionBlocks(blocks)

  await fs.writeFile(`export/${pageId}.md`, markdown)
}
```

### Deep Copy Pages

```typescript
async function copyPageWithChildren(sourceId: string, targetId: string) {
  const blocks = await fetchAllBlocks({ block_id: sourceId })

  // Recreate structure in target
  for (const block of blocks) {
    await createBlockWithChildren(targetId, block)
  }
}
```

### Content Analysis

```typescript
async function analyzePageStructure(pageId: string) {
  const blocks = await fetchAllBlocks({ block_id: pageId })

  const stats = {
    total: blocks.length,
    byType: {},
    maxDepth: 0,
  }

  // Analyze block types and nesting
  analyzeBlocks(blocks, stats)

  return stats
}
```

## Performance Considerations

### Pagination

The enhance function handles pagination automatically:

```typescript
// No need to handle pagination manually
const blocks = await fetchAllBlocks({
  block_id: "page-id",
  // page_size is handled internally
})
```

### Large Pages

For very large pages with deep nesting:

```typescript
// Consider implementing caching
const cache = new Map()

const cachedFetch = enhance((args) => {
  const key = args.block_id
  if (cache.has(key)) {
    return Promise.resolve(cache.get(key))
  }

  return notion.blocks.children.list(args).then((result) => {
    cache.set(key, result)
    return result
  })
})
```

### Rate Limiting

Be aware of Notion's rate limits when fetching deeply nested structures:

```typescript
// Add delay for large operations
const fetchWithDelay = enhance(async (args) => {
  await new Promise((resolve) => setTimeout(resolve, 100))
  return notion.blocks.children.list(args)
})
```

## Error Handling

```typescript
const fetchAllBlocks = enhance((args) => notion.blocks.children.list(args))

try {
  const blocks = await fetchAllBlocks({
    block_id: "page-id",
  })
} catch (error) {
  if (error.code === "object_not_found") {
    console.error("Page not found")
  } else if (error.code === "rate_limited") {
    console.error("Rate limited, retry later")
  }
}
```
