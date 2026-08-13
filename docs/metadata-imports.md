# Metadata Imports API

Bulk-import a data connector's source metadata into a metadata collection. A metadata import is a saved definition that lists the connector's source files and imports each one's source metadata as collection files — no media is downloaded or processed, and runs consume no credits.

Metadata imports only apply to collections of type `metadata` (see [Collections](./collections.md)). Runs page the connector with the account's default active API key and fail with a clear error when the account has none.

## Create an Import

By default the first run starts immediately (`start: false` saves the definition only):

```typescript
const imp = await client.metadataImports.createMetadataImport(collectionId, {
  name: 'All Grain recordings',
  connector_id: 'connector_uuid',
  // Optional:
  filters: [{ from: '2026-01-01', to: '2026-06-30' }],  // up to 20 listing passes
  default_mode: 'append',        // 'append' | 'refresh'
  delete_missing: false,         // remove collection files no longer in the source
  rate_limit: 10,                // listing requests/sec (1-50, clamped per connector)
  start: true,                   // default: true
  max_files: 10000,              // cap per run (a capped run skips the delete-missing sweep)
  include_thumbnails: false,
});

console.log(imp.latest_run);     // the triggered run (null if start: false or slot busy)
```

### Filters

Each entry in `filters` is one listing pass over the connector; overlapping passes are deduplicated. Empty or omitted means a single unfiltered pass. Per-connector fields:

- `from` / `to` — date window (YYYY-MM-DD, UTC)
- `title_search` — title filter
- `folder_id` — Google Drive only
- `path` — Dropbox only (non-recursive, direct children)
- `team` / `meeting_type` — Grain only

## List, Get, Delete

```typescript
// List a collection's imports, newest first, each with its latest run inline
const imports = await client.metadataImports.listMetadataImports(collectionId, { limit: 50 });

// Get a definition with one page of its run history (newest first)
const detail = await client.metadataImports.getMetadataImport(collectionId, importId, {
  limit: 20,
  offset: 0,
});

// Delete the definition (files it imported stay in the collection)
await client.metadataImports.deleteMetadataImport(collectionId, importId);
```

## Trigger & Cancel Runs

Only one run may be active per collection at a time — triggering while any run in the collection is active fails with 409.

```typescript
// mode/delete_missing default to the definition's saved values
const run = await client.metadataImports.createMetadataImportRun(collectionId, importId, {
  mode: 'refresh',               // optional per-run override
  max_files: 500,                // optional per-run override
});

// Cancel an active run (files already imported stay in the collection)
await client.metadataImports.cancelMetadataImportRun(collectionId, importId, run.id);
```

## Modes

| Mode | Behavior |
|------|----------|
| `append` | Only files not already in the collection are imported |
| `refresh` | Existing files' source metadata is re-fetched and re-indexed too |

To refresh a single file's source metadata instead of a whole run, use `client.files.syncSourceMetadata(fileId)` — see [Files](./files.md).
