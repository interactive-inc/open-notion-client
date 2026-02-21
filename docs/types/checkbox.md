# Checkbox

Boolean true/false values.

## Schema Definition

```typescript
{
  isActive: { type: 'checkbox' },
  isPublished: { type: 'checkbox' }
}
```

## TypeScript Type

```typescript
boolean | undefined
// or just boolean if required
```

## Writing

```typescript
await table.create({
  properties: {
    isActive: true,
    isPublished: false
  }
})

await table.update('page-id', {
  properties: { isPublished: true }
})
```

## Querying

```typescript
// Exact match
await table.findMany({
  where: { isActive: true }
})

// Find unchecked
await table.findMany({
  where: { isPublished: false }
})

// Available operators
true   // Checked
false  // Unchecked
```

## Examples

```typescript
const articlesTable = new NotionTable({
  client,
  dataSourceId: 'articles-db',
  properties: {
    title: { type: 'title' },
    published: { type: 'checkbox' },
    featured: { type: 'checkbox' },
    allowComments: { type: 'checkbox' }
  }
})

// Create draft article
const article = await articlesTable.create({
  properties: {
    title: 'Getting Started with TypeScript',
    published: false,
    featured: false,
    allowComments: true
  }
})

// Publish article
await articlesTable.update(article.id, {
  properties: { published: true }
})

// Find all published articles
const { records: publishedArticles } = await articlesTable.findMany({
  where: { published: true }
})

// Find featured articles
const { records: featured } = await articlesTable.findMany({
  where: {
    published: true,
    featured: true
  }
})
```