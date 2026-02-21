# Phone Number

Phone number field with formatting.

## Schema Definition

```typescript
{
  phone: { type: 'phone_number' },
  mobile: { type: 'phone_number' }
}
```

## TypeScript Type

```typescript
string | undefined
// or just string if required
```

## Writing

```typescript
await table.create({
  properties: {
    phone: '+1-555-123-4567',
    mobile: '+81-90-1234-5678'
  }
})

await table.update('page-id', {
  properties: { phone: '(555) 987-6543' }
})
```

## Querying

```typescript
// Exact match
await table.findMany({
  where: { phone: '+1-555-123-4567' }
})

// Contains search
await table.findMany({
  where: { 
    phone: { contains: '555' }
  }
})

// Available operators
equals            // Equals (default)
does_not_equal    // Not equals
contains          // Contains substring
starts_with       // Starts with
ends_with         // Ends with
is_empty          // Is empty
is_not_empty      // Is not empty
```

## Examples

```typescript
const contactsTable = new NotionTable({
  client,
  dataSourceId: 'contacts-db',
  properties: {
    name: { type: 'title' },
    phone: { type: 'phone_number' },
    mobile: { type: 'phone_number' },
    fax: { type: 'phone_number' }
  }
})

// Create contact
const contact = await contactsTable.create({
  properties: {
    name: 'John Smith',
    phone: '+1-555-123-4567',
    mobile: '+1-555-987-6543'
  }
})

// Find by area code
const { records: areaCode555 } = await contactsTable.findMany({
  where: {
    phone: { contains: '555' }
  }
})

// Find contacts with phone numbers
const { records: withPhone } = await contactsTable.findMany({
  where: {
    phone: { is_not_empty: true }
  }
})
```