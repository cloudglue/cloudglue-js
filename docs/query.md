# Query API

Run read-only SQL — or natural-language questions compiled to SQL — over the structured data extracted from your collections. Queries execute against three virtual tables built from each file's most recent completed extraction:

| Table | Contents |
|-------|----------|
| `files` | One row per collection file (filename, uri, duration, metadata, ...) |
| `entities` | File-level extracted entities |
| `segment_entities` | Segment-level extracted entities with timestamps |

The `entities`/`segment_entities` tables are populated from collection extractions, so the Query API is most useful over `entities` collections; for collections without extractions only the `files` table has data. Face-analysis collections cannot be queried (rejected with 400). Queries are stored, so completed runs can be re-fetched later.

## Discover the Schema

Introspect the queryable tables and per-collection extracted fields before writing SQL — column names, entity field names, types, and levels, plus each collection's verbatim extract schema and prompt:

```typescript
const schema = await client.query.getQuerySchema(['col_id_1', 'col_id_2']); // 1-20 collections
```

## Run a SQL Query

```typescript
const result = await client.query.runQuery({
  collections: ['col_id'],           // 1-20 collection IDs
  sql: `SELECT e.name, COUNT(*) AS mentions
        FROM entities e
        GROUP BY e.name
        ORDER BY mentions DESC
        LIMIT 10`,
  max_rows: 1000,                    // optional, 1-10000
});

console.log(result.columns, result.rows);
```

Each SQL query costs 2 credits. Only a single `SELECT` statement is accepted — multiple statements, non-SELECT statements, and unparseable SQL are rejected with 400.

## Natural-Language Queries

Provide `query` instead of `sql` and Cloudglue compiles the question to SQL against the same virtual schema (4 credits). The compiled statement is returned in the result's `sql` field:

```typescript
const result = await client.query.runQuery({
  collections: ['col_id'],
  query: 'Which products were mentioned most often, with average price?',
});

console.log(result.sql);   // the compiled SQL
console.log(result.rows);
```

Provide exactly one of `sql` or `query`.

## Dry Run

Validate SQL (or compile a natural-language question) without executing:

```typescript
const check = await client.query.runQuery({
  collections: ['col_id'],
  sql: 'SELECT ...',
  dry_run: true,
});
```

## Background Exports

For large result sets, run the query in the background and export to a file retrievable via `download_url`:

```typescript
const run = await client.query.runQuery({
  collections: ['col_id'],
  sql: 'SELECT * FROM segment_entities',
  background: true,
  format: 'csv',                     // 'json' | 'csv' | 'jsonl'
});

const done = await client.query.waitForReady(run.id);
console.log(done.download_url);

// Cancel an in-progress export (reserved credits are refunded)
await client.query.cancelQueryExport(run.id);
```

## List & Get Query Runs

```typescript
// List runs (list items omit the columns/rows payloads)
const history = await client.query.listQueries({ limit: 10, status: 'completed' });

// Fetch a stored run with its full result. Results larger than the inline
// storage cap are replayed truncated (truncated: true).
const run = await client.query.getQuery(queryId);
```

## Errors

| Status | Meaning |
|--------|---------|
| 400 | Invalid parameters or rejected SQL (multiple statements, non-SELECT, unparseable, or a face-analysis collection in scope) |
| 402 | Insufficient credit balance |
| 404 | One or more collections not found |
| 408 | Query exceeded the execution time limit |
| 409 | The selected collections exceed the maximum queryable dataset size |
