# enhance

Recursively fetch child blocks for Notion blocks with nested content.

## Import

```typescript
import { enhance } from "@interactive-inc/notion-client"
```

## Function Signature

```typescript
type Client = (args: ListBlockChildrenParameters) => Promise<ListBlockChildrenResponse>

function enhance(client: Client): (args: ListBlockChildrenParameters) => Promise<NotionBlock[]>
```

## Purpose

The Notion API returns blocks without their children populated. The `enhance` function creates a wrapper around the blocks API that recursively fetches all child blocks, building a complete tree structure.

## Basic Usage

```typescript
import { Client } from "@notionhq/client"
import { enhance } from "@interactive-inc/notion-client"

const notion = new Client({ auth: process.env.NOTION_TOKEN })

// Create enhanced client
const enhancedClient = enhance(notion.blocks.children.list.bind(notion.blocks.children))

// Fetch blocks with all children recursively populated
const blocks = await enhancedClient({ block_id: "page-id" })

// blocks now includes full tree structure with children
```

## How It Works

### Without enhance

```typescript
const notion = new Client({ auth: process.env.NOTION_TOKEN })

// Get top-level blocks only
const response = await notion.blocks.children.list({ block_id: "page-id" })

// response.results[0].has_children === true
// But children are not populated - need manual recursive fetch
```

### With enhance

```typescript
const enhancedClient = enhance(notion.blocks.children.list.bind(notion.blocks.children))

// Get blocks with all children recursively
const blocks = await enhancedClient({ block_id: "page-id" })

// blocks[0].children is fully populated
// blocks[0].children[0].children is also populated, and so on
```

## Return Type

Returns `NotionBlock[]` where each block has a `children` property:

```typescript
type NotionBlock = BlockObjectResponse & {
  children: NotionBlock[] // Recursively populated
}
```

## Examples

### Nested List Items

```typescript
const enhancedClient = enhance(notion.blocks.children.list.bind(notion.blocks.children))

const blocks = await enhancedClient({ block_id: "page-id" })

// Example structure:
// [
//   {
//     type: 'bulleted_list_item',
//     bulleted_list_item: { rich_text: [{ text: { content: 'Parent' } }] },
//     children: [
//       {
//         type: 'bulleted_list_item',
//         bulleted_list_item: { rich_text: [{ text: { content: 'Child' } }] },
//         children: []
//       }
//     ]
//   }
// ]
```

### Full Page Content

```typescript
// Get complete page structure
const blocks = await enhancedClient({ block_id: "page-id" })

// Convert to markdown with nested structure preserved
import { fromNotionBlocks } from "@interactive-inc/notion-client"
const markdown = fromNotionBlocks(blocks)
```

### Working with Nested Structures

```typescript
function printBlockTree(blocks: NotionBlock[], indent = 0) {
  for (const block of blocks) {
    console.log("  ".repeat(indent) + block.type)

    if (block.children.length > 0) {
      printBlockTree(block.children, indent + 1)
    }
  }
}

const blocks = await enhancedClient({ block_id: "page-id" })
printBlockTree(blocks)
// paragraph
// heading_1
// bulleted_list_item
//   bulleted_list_item
//     bulleted_list_item
// heading_2
```

## Use Cases

### Full Content Export

```typescript
// Export complete page structure with all nested blocks
const enhancedClient = enhance(notion.blocks.children.list.bind(notion.blocks.children))

async function exportPage(pageId: string) {
  const blocks = await enhancedClient({ block_id: pageId })
  const markdown = fromNotionBlocks(blocks)
  return markdown
}
```

### Content Synchronization

```typescript
// Sync Notion content to external system
async function syncContent(pageId: string) {
  const blocks = await enhancedClient({ block_id: pageId })

  // Process each block with full context of children
  for (const block of blocks) {
    await processBlock(block)
  }
}
```

### Hierarchical Analysis

```typescript
// Analyze document structure
function analyzeStructure(blocks: NotionBlock[]): {
  depth: number
  blockCount: number
} {
  let maxDepth = 0
  let totalCount = 0

  function traverse(blocks: NotionBlock[], depth: number) {
    totalCount += blocks.length
    maxDepth = Math.max(maxDepth, depth)

    for (const block of blocks) {
      if (block.children.length > 0) {
        traverse(block.children, depth + 1)
      }
    }
  }

  traverse(blocks, 1)
  return { depth: maxDepth, blockCount: totalCount }
}
```

## Performance Considerations

### API Rate Limits

```typescript
// enhance makes recursive API calls
// Be mindful of rate limits for deeply nested content

// For pages with many nested blocks:
// - Consider caching results
// - Implement rate limiting
// - Use pagination if needed
```

### Caching

```typescript
// Cache enhanced results
const cache = new Map<string, NotionBlock[]>()

async function getCachedBlocks(blockId: string) {
  if (cache.has(blockId)) {
    return cache.get(blockId)!
  }

  const blocks = await enhancedClient({ block_id: blockId })
  cache.set(blockId, blocks)
  return blocks
}
```

## Integration with NotionTable

```typescript
import { NotionTable, enhance } from "@interactive-inc/notion-client"

const table = new NotionTable({
  client: notion,
  dataSourceId: "db-id",
  properties: { title: { type: "title" } },
})

// Get page reference
const page = await table.findById("page-id")

// Fetch enhanced blocks
const enhancedClient = enhance(notion.blocks.children.list.bind(notion.blocks.children))
const blocks = await enhancedClient({ block_id: page.id })

// Convert to markdown
const markdown = fromNotionBlocks(blocks)
```

## Best Practices

### Bind Context Properly

```typescript
// ✅ Good: Bind context
const enhancedClient = enhance(notion.blocks.children.list.bind(notion.blocks.children))

// ❌ Bad: Context lost
const enhancedClient = enhance(notion.blocks.children.list)
```

### Error Handling

```typescript
try {
  const blocks = await enhancedClient({ block_id: "page-id" })
} catch (error) {
  console.error("Failed to fetch blocks:", error)
  // Handle API errors, rate limits, etc.
}
```

### Type Safety

```typescript
import type { NotionBlock } from "@interactive-inc/notion-client"

function processBlocks(blocks: NotionBlock[]) {
  // TypeScript knows about children property
  blocks.forEach((block) => {
    console.log(block.children) // ✅ Type-safe
  })
}
```

## Related

- [fromNotionBlocks](from-blocks.md) - Convert enhanced blocks to markdown
- [NotionTable](notion-table.md) - Main API for database operations
