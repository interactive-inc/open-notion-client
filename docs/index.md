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

```bash
bun add @interactive-inc/notion-client @notionhq/client
```

## Quick Start

```typescript
import { NotionTable } from "@interactive-inc/notion-client"
import { Client } from "@notionhq/client"

const client = new Client({ auth: process.env.NOTION_TOKEN })

const tasks = new NotionTable({
  client,
  dataSourceId: "your-database-id",
  properties: {
    title: { type: "title" },
    status: { type: "select", options: ["todo", "doing", "done"] },
    priority: { type: "number" },
  } as const,
})

const task = await tasks.create({
  properties: { title: "Build app", status: "todo", priority: 1 },
})

const { records } = await tasks.findMany({
  where: { status: "todo" },
  sorts: [{ field: "priority", direction: "asc" }],
})

await tasks.update(task.id, {
  properties: { status: "done" },
})
```
