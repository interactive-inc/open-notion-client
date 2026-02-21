# Formula

Computed values from other properties (read-only).

## Schema Definition

```typescript
{
  total: { type: 'formula' },
  fullName: { type: 'formula' }
}
```

## TypeScript Type

```typescript
string | number | boolean | undefined  // Depends on formula result
```

## Writing

Formula fields are computed automatically by Notion and cannot be written directly.

```typescript
// Cannot set formula values
await table.create({
  properties: { total: 100 }  // This will be ignored
})

// Set the source fields instead
await table.create({
  properties: {
    price: 50,
    quantity: 2
    // total formula will compute to 100
  }
})
```

## Querying

```typescript
// Query computed values
await table.findMany({
  where: { 
    total: { greater_than_or_equal_to: 100 }
  }
})

// Available operators depend on formula type
// Number formulas: equals, does_not_equal, greater_than, greater_than_or_equal_to, less_than, less_than_or_equal_to
// String formulas: contains, starts_with, ends_with
// Boolean formulas: true, false
```

## Examples

```typescript
const ordersTable = new NotionTable({
  client,
  dataSourceId: 'orders-db',
  properties: {
    product: { type: 'title' },
    price: { type: 'number' },
    quantity: { type: 'number' },
    total: { type: 'formula' },  // price * quantity
    taxAmount: { type: 'formula' },  // total * 0.1
    grandTotal: { type: 'formula' }  // total + taxAmount
  }
})

// Create order - formulas calculate automatically
const order = await ordersTable.create({
  properties: {
    product: 'Widget',
    price: 29.99,
    quantity: 3
    // total: 89.97 (calculated)
    // taxAmount: 8.997 (calculated)
    // grandTotal: 98.967 (calculated)
  }
})

// Query by formula values
const { records: largeOrders } = await ordersTable.findMany({
  where: {
    grandTotal: { greater_than_or_equal_to: 1000 }
  }
})

// String formula example
const contactsTable = new NotionTable({
  properties: {
    firstName: { type: 'rich_text' },
    lastName: { type: 'rich_text' },
    fullName: { type: 'formula' }  // Concatenates names
  }
})

// Find by computed full name
const { records: john } = await contactsTable.findMany({
  where: {
    fullName: { contains: 'John Smith' }
  }
})
```