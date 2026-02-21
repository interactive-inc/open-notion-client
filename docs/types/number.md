# Number

Numeric values with optional validation.

## Schema Definition

```typescript
{
  price: { type: 'number' },
  quantity: { 
    type: 'number', 
    
    min: 0,
    max: 1000
  }
}
```

## TypeScript Type

```typescript
number | undefined
// or just number if required
```

## Writing

```typescript
await table.create({
  properties: {
    price: 29.99,
    quantity: 100
  }
})

await table.update('page-id', {
  properties: { price: 34.99 }
})
```

## Querying

```typescript
// Exact match
await table.findMany({
  where: { price: 29.99 }
})

// Comparison operators
await table.findMany({
  where: { 
    price: { greater_than_or_equal_to: 20, less_than_or_equal_to: 50 }
  }
})

// Available operators
equals                    // Equals (default)
does_not_equal            // Not equals
greater_than              // Greater than
greater_than_or_equal_to  // Greater than or equal
less_than                 // Less than
less_than_or_equal_to     // Less than or equal
is_empty                  // Is empty
is_not_empty              // Is not empty
```

## Examples

```typescript
const productsTable = new NotionTable({
  client,
  dataSourceId: 'products-db',
  properties: {
    name: { type: 'title' },
    price: {
      type: 'number',

      min: 0
    },
    stock: {
      type: 'number',
      min: 0,
      max: 10000
    },
    rating: {
      type: 'number',
      min: 1,
      max: 5
    }
  }
})

// Create product
const product = await productsTable.create({
  properties: {
    name: 'Premium Widget',
    price: 49.99,
    stock: 500,
    rating: 4.5
  }
})

// Find products in price range
const { records: affordable } = await productsTable.findMany({
  where: {
    price: { greater_than_or_equal_to: 10, less_than_or_equal_to: 100 },
    stock: { greater_than: 0 }
  },
  sorts: [{ field: 'price', direction: 'asc' }]
})

// Find highly rated products
const { records: topRated } = await productsTable.findMany({
  where: { rating: { greater_than_or_equal_to: 4 } }
})
```