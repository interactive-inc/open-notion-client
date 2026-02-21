# Overview

Get started with notion-client in minutes.

## Installation

Install the required packages:

```bash
# notion-client library
bun i @interactive-inc/notion-client

# Official Notion API client (peer dependency)
bun i @notionhq/client
```

Or using npm/yarn/pnpm:

```bash
npm install @interactive-inc/notion-client @notionhq/client
# or
yarn add @interactive-inc/notion-client @notionhq/client
# or
pnpm add @interactive-inc/notion-client @notionhq/client
```

## Setup

### 1. Create Notion Integration

1. Go to [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click "New integration"
3. Configure:
   - Name: Your app name
   - Associated workspace: Select your workspace
   - Capabilities: Read, Update, Insert content
4. Copy the "Internal Integration Token"

### 2. Share Database

1. Open your Notion database
2. Click "..." menu → "Add connections"
3. Search and add your integration
4. Copy database ID from URL:
   ```
   https://notion.so/workspace/DATABASE_ID?v=...
                              ^^^^^^^^^^^
   ```

### 3. Initialize Client

```typescript
import { NotionTable } from '@interactive-inc/notion-client'
import { Client } from '@notionhq/client'

// Initialize Notion API client
const notion = new Client({
  auth: process.env.NOTION_TOKEN
})

// Create type-safe table instance
const tasksTable = new NotionTable({
  client: notion,
  dataSourceId: process.env.NOTION_DATABASE_ID,
  properties: {
    title: { type: 'title' },
    status: { type: 'select', options: ['todo', 'done'] as const },
    priority: { type: 'number' }
  } as const
})
```

## Basic Usage

### Create Record

```typescript
const task = await tasksTable.create({
  properties: {
    title: 'Learn notion-client',
    status: 'todo',
    priority: 1
  }
})

console.log(task.id) // Notion page ID
```

### Read Records

```typescript
// Find all
const { records: tasks } = await tasksTable.findMany()

// Find with filter
const { records: todoTasks } = await tasksTable.findMany({
  where: { status: 'todo' }
})

// Find one
const task = await tasksTable.findOne({
  where: { title: 'Learn notion-client' }
})

// Find by ID
const specific = await tasksTable.findById('page-id')

// Access properties
if (task) {
  const props = task.properties()
  console.log(props.title)
}
```

### Update Record

```typescript
await tasksTable.update(task.id, {
  properties: {
    status: 'done'
  }
})
```

### Delete Record

```typescript
await tasksTable.delete(task.id)
```

## Environment Variables

Create `.env` file:

```bash
NOTION_TOKEN=secret_xxx...
NOTION_DATABASE_ID=abc123...
```

Load in your app:

```typescript
// Using dotenv
import 'dotenv/config'

// Or using Bun
// Bun automatically loads .env files
```

## TypeScript Configuration

Ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

## Complete Example

```typescript
import { NotionTable } from '@interactive-inc/notion-client'
import { Client } from '@notionhq/client'

// Setup
const notion = new Client({ auth: process.env.NOTION_TOKEN })

// Define schema
const schema = {
  title: { type: 'title' },
  description: { type: 'rich_text' },
  status: { 
    type: 'select', 
    options: ['backlog', 'todo', 'in_progress', 'done'] as const 
  },
  priority: { type: 'number', min: 1, max: 5 },
  assignee: { type: 'people' },
  dueDate: { type: 'date' },
  tags: { 
    type: 'multi_select', 
    options: ['bug', 'feature', 'enhancement'] as const 
  }
} as const

// Create table instance
const projectTable = new NotionTable({
  client: notion,
  dataSourceId: 'your-database-id',
  properties: schema
})

// Create task
const task = await projectTable.create({
  properties: {
    title: 'Fix login bug',
    description: 'Users cannot login with email',
    status: 'todo',
    priority: 5,
    tags: ['bug']
  }
})

// Query tasks
const { records: urgentBugs } = await projectTable.findMany({
  where: {
    status: { does_not_equal: 'done' },
    priority: { greater_than_or_equal_to: 4 },
    tags: { contains: 'bug' }
  },
  sorts: [{ field: 'priority', direction: 'desc' }]
})

// Update task
await projectTable.update(task.id, {
  properties: {
    status: 'in_progress'
  }
})
```

## Next Steps

- [Understand the Concept](/guides/concept) - Learn how notion-client simplifies Notion's API
- [Query Data](/guides/query) - Advanced querying techniques
- [Mutate Data](/guides/mutation) - Create, update, and delete operations
- [Schema Design](/design/schema) - Design your database schema