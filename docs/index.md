---
layout: home

hero:
  name: "Notion-Client"
  text: "The type-safe way to use Notion"
  tagline: "Transform your Notion workspace into a powerful TypeScript database"
  actions:
    - theme: brand
      text: Get Started
      link: /guides
    - theme: alt
      text: GitHub
      link: https://github.com/interactive-inc/open-notion-client
    - theme: alt
      text: Contact
      link: https://www.inta.co.jp/contact/

features:
  - title: Type-safe Operations
    details: Full TypeScript support with auto-completion and compile-time validation for all database operations
  - title: Simple API
    details: Clean, intuitive methods that hide Notion's API complexity. Transform nested JSON to simple objects
  - title: Markdown Support
    details: Seamlessly convert between Notion blocks and markdown text with rich formatting preserved
---

## Installation

To get started with notion-client, install the package using your preferred package manager:

```bash
# Using bun
bun i @interactive-inc/notion-client

# Using npm
npm install @interactive-inc/notion-client

# Using yarn
yarn add @interactive-inc/notion-client

# Using pnpm
pnpm add @interactive-inc/notion-client
```

You'll also need the official Notion client:
```bash
bun i @notionhq/client
```

see [@notionhq/client](https://www.npmjs.com/package/@notionhq/client) for more details on the Notion client.

## Quick Start

Here's a complete example to get you started with notion-client:

```typescript
import { NotionTable } from '@interactive-inc/notion-client'
import { Client } from '@notionhq/client'

// Initialize the Notion client with your integration token
const client = new Client({ auth: process.env.NOTION_TOKEN })

// Create a type-safe table instance
const tasksTable = new NotionTable({
  client,
  dataSourceId: 'your-database-id',  // Replace with your Notion database ID
  properties: {
    // Define your database schema
    title: { type: 'title' },
    status: { type: 'select', options: ['todo', 'in_progress', 'done'] },
    priority: { type: 'number' }
  }
})

// Create a new task
const task = await tasksTable.create({
  properties: {
    title: 'Build awesome app',
    status: 'todo',
    priority: 1
  }
})

// Query tasks with filtering and sorting
const tasks = await tasksTable.findMany({
  where: { status: 'todo' },
  sorts: [{ field: 'priority', direction: 'asc' }]
})

// Update a task
await tasksTable.update(task.id, {
  properties: {
    status: 'done'
  }
})
```

### Setting Up Your First Integration

1. **Create a Notion Integration**
   - Go to [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
   - Click "New integration"
   - Give it a name and select the workspace
   - Copy the "Internal Integration Token"

2. **Share Your Database**
   - Open your Notion database
   - Click "Share" in the top right
   - Invite your integration by name
   - Copy the database ID from the URL: `https://notion.so/workspace/{database_id}?v=...`

3. **Set Up Environment Variables**
   ```bash
   # .env
   NOTION_TOKEN=your_integration_token_here
   NOTION_DATABASE_ID=your_database_id_here
   ```

4. **Create Your First Table**
   ```typescript
   import { NotionTable } from '@interactive-inc/notion-client'
   import { Client } from '@notionhq/client'

   // The Client handles authentication with Notion's API
   const client = new Client({ 
     auth: process.env.NOTION_TOKEN 
   })

   // NotionTable wraps the client with type-safe operations
   const table = new NotionTable({
     client,
     dataSourceId: process.env.NOTION_DATABASE_ID,
     properties: {
       // Properties defines the shape of your data
       title: { type: 'title' }
     }
   })

   // Now you can perform CRUD operations
   const record = await table.create({
     properties: {
       title: 'My first record!'
     }
   })
   ```

## Why notion-client

Notion's standard API is powerful but complex. Retrieving a simple text value requires parsing deeply nested objects:

Standard Notion API response:
```json
{
  "properties": {
    "Name": {
      "id": "title",
      "type": "title",
      "title": [{
        "type": "text",
        "text": { "content": "Hello World" },
        "annotations": { "bold": false, "italic": false, "color": "default" },
        "plain_text": "Hello World"
      }]
    }
  }
}
```

With notion-client:
```typescript
{ name: "Hello World" }
```

This simplicity allows you to treat Notion like a traditional database, focusing on your data rather than API complexities.

## Core Features

### Type-safe Database Operations

Define your schema once and get full TypeScript support throughout your application:

```typescript
const blogTable = new NotionTable({
  client,
  dataSourceId: 'blog-database-id',
  properties: {
    title: { type: 'title' },
    content: { type: 'rich_text' },
    tags: { type: 'multi_select', options: ['tech', 'design', 'news'] as const },
    published: { type: 'checkbox' },
    publishDate: { type: 'date' }
  } as const
})

// TypeScript knows all available properties and their types
const post = await blogTable.create({
  properties: {
    title: 'Building Type-safe Applications',
    content: 'Introduction paragraph',
    tags: ['tech'],  // Must be one of the defined options
    published: true,
    publishDate: { start: new Date().toISOString(), end: null }
  },
  body: '# Introduction\n\nWrite in markdown!'
})
```

### Advanced Querying

Notion-native query syntax makes complex searches intuitive:

```typescript
// Complex conditional queries
const results = await tasksTable.findMany({
  where: {
    or: [
      { priority: { greater_than_or_equal_to: 5 } },
      {
        and: [
          { status: 'in_progress' },
          { tags: { contains: 'urgent' } }
        ]
      }
    ]
  },
  sorts: [
    { field: 'priority', direction: 'desc' },
    { field: 'created_time', direction: 'asc' }
  ],
  count: 20
})
```

### Markdown Support

Seamlessly work with markdown content:

```typescript
const article = await blogTable.create({
  properties: {
    title: 'Getting Started with Markdown'
  },
  body: `# Overview

This article explains how to use **notion-client**.

## Features

- Type-safe operations
- Simple API
- Markdown support

### Code Example

\`\`\`typescript
const result = await table.findOne({
  where: { status: 'published' }
})
\`\`\`

Learn more in the [official docs](https://github.com/interactive-inc/notion-client).`
})
```

## Use Cases

### Task Management System

```typescript
const taskSystem = new NotionTable({
  client,
  dataSourceId: 'tasks-db-id',
  properties: {
    title: { type: 'title' },
    assignee: { type: 'people' },
    status: { type: 'select', options: ['backlog', 'todo', 'in_progress', 'review', 'done'] },
    priority: { type: 'number' },
    dueDate: { type: 'date' },
    description: { type: 'rich_text' }
  }
})

// Find overdue tasks
const overdueTasks = await taskSystem.findMany({
  where: {
    and: [
      { status: { does_not_equal: 'done' } },
      { dueDate: { before: new Date().toISOString() } }
    ]
  }
})
```

### Blog/CMS

```typescript
const cms = new NotionTable({
  client,
  dataSourceId: 'articles-db-id',
  properties: {
    title: { type: 'title' },
    slug: { type: 'rich_text' },
    content: { type: 'rich_text' },
    author: { type: 'people' },
    category: { type: 'select', options: ['tech', 'design', 'business'] },
    tags: { type: 'multi_select', options: null },
    published: { type: 'checkbox' },
    publishDate: { type: 'date' }
  }
})

// Get published articles
const publishedArticles = await cms.findMany({
  where: {
    and: [
      { published: { equals: true } },
      { publishDate: { on_or_before: new Date().toISOString() } }
    ]
  },
  sorts: [{ field: 'publishDate', direction: 'desc' }]
})
```

### Customer Relationship Management (CRM)

```typescript
const crm = new NotionTable({
  client,
  dataSourceId: 'customers-db-id',
  properties: {
    name: { type: 'title' },
    email: { type: 'email' },
    company: { type: 'rich_text' },
    status: { type: 'select', options: ['lead', 'prospect', 'customer', 'churned'] },
    revenue: { type: 'number' },
    lastContact: { type: 'date' },
    notes: { type: 'rich_text' }
  }
})

// Find high-value customers
const vipCustomers = await crm.findMany({
  where: {
    and: [
      { status: { equals: 'customer' } },
      { revenue: { greater_than_or_equal_to: 100000 } }
    ]
  }
})
```