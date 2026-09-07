# Testing

Run the library checks with Vite+. The managed runtime remains Bun.

```bash
vp install --frozen-lockfile
vp fmt --check
vp lint
vp run check
vp test
vp run build
vp run docs:build
```

These checks also run on pull requests and pushes to `main` in the **Library checks** workflow.

## HTTP mocks

Table integration tests instantiate the official Notion SDK and replace only its `fetch` option. Shared fixtures in `lib/testing` conform to the SDK's response types. Each HTTP exchange declares its method, path, response and, when relevant, exact request body. Unexpected requests and unused responses fail the test, including when `.safe` catches the request error. The default global `fetch` rejects unexpected network access; the suite needs no Notion token or live workspace.

Property converters, Markdown parsers, query builders and caches run their real implementations. Invalid API responses are supplied explicitly in tests for partial pages, incomplete queries and malformed pagination. Retry tests use virtual timers to assert the actual delays and attempt counts. Cache races use controlled promises instead of timing assumptions.

## Regression cases

- Query filters: mixed logical and property conditions, relative dates, formula filters, unknown keys, empty mutation filters and property names that collide with JavaScript object keys.
- Pagination: requested limits, zero and invalid limits, empty pages, repeated cursors, incomplete responses, nested block traversal and batches larger than 1,024 records.
- Mutations: partial batch failures, read-only properties, body omission versus clearing, 100-block chunks, append-before-delete ordering and cache invalidation after failures.
- Caching: exact TTL expiry, eviction, snapshot isolation and reads completing after updates or cache clearing.
- Markdown: long Unicode text, annotation and link preservation, literal Markdown punctuation, inline backticks and fenced code.
- Retries and concurrency: retryable and permanent errors, retry exhaustion, `Retry-After`, backoff overflow, failed workers and shared concurrency limits.
- Safe mode: all methods return errors or per-record failures according to their public contract.

## Verification limits

HTTP mocks test serialization and SDK error handling locally. They do not establish live workspace permissions, rate-limit timing, or behavior under concurrent edits made by other clients. The suite does not claim that every possible input is covered or that the library is free of defects.

Coverage percentages require the optional `@vitest/coverage-v8` package, which is not currently installed. Passing test counts are not coverage percentages.
