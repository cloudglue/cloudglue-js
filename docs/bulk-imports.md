# Bulk Imports API

Batch-import a data connector's source files into a collection. A bulk import is a saved definition that lists the connector's files and brings each match into the collection, on demand or on repeat.

**What a run ingests follows the target collection's type.** It is inferred at creation, fixed for the import's lifetime, and reported as `import_type` on the definition and on every run:

| Target collection | `import_type` | What a run does | Cost |
|---|---|---|---|
| `metadata` | `metadata` | imports each file's source metadata as a collection file — no media downloaded or processed | **free** — runs consume no credits |
| any other type (`media-descriptions`, `entities`, `rich-transcripts`, `face-analysis`) | `media` | ingests and processes the media itself, exactly like a manual `addMedia` | **billed per file**, and counts against the account's file usage limits |

A media run is additionally capped at **10,000 files per run** whatever `max_files` says. If it exhausts credits or a usage limit it stops with a user-facing error and keeps everything it already imported — rerun in `append` mode to resume.

Runs page the connector — and, for media imports, add each file — with the account's default active API key, and fail with a clear error when the account has none.

> **Naming.** This API was `client.metadataImports` before spec v0.7.21, when imports only applied to metadata collections. It is now `client.bulkImports`. The old property still works and refers to the same instance, so existing code keeps running.

## Create an Import

By default the first run starts immediately (`start: false` saves the definition only):

```typescript
const imp = await client.bulkImports.createMetadataImport(collectionId, {
  name: 'All Grain recordings',
  connector_id: 'connector_uuid',
  // Optional:
  filters: [{ from: '2026-01-01', to: '2026-06-30' }],  // up to 20 listing passes
  default_mode: 'append',        // 'append' | 'refresh'
  delete_missing: false,         // remove collection files no longer in the source
  rate_limit: 10,                // listing requests/sec (1-50, clamped per connector)
  start: true,                   // default: true
  max_files: 10000,              // cap per run (a capped run skips the delete-missing sweep)
  include_thumbnails: false,     // metadata imports only
  enrich_metadata: false,        // metadata imports only
});

console.log(imp.import_type);    // 'metadata' | 'media' — inferred from the collection
console.log(imp.latest_run);     // the triggered run (null if start: false or slot busy)
```

Definitions are immutable — delete and recreate to change one.

### Filters

Each entry in `filters` is one listing pass over the connector; overlapping passes are deduplicated. Empty or omitted means a single unfiltered pass. Per-connector fields:

- `from` / `to` — date window (YYYY-MM-DD, UTC)
- `title_search` — title filter
- `folder_id` — Google Drive only
- `path` — Dropbox only; lists the direct children of the folder
- `recursive` — Dropbox only; `'true'` lists the whole subtree under `path` (or the whole account when no `path` is given) instead of its direct children. Note this is the **string** `'true'` / `'false'`, not a boolean.
- `team` / `meeting_type` — Grain only

```typescript
// One recursive pass over a Dropbox tree, instead of one pass per folder
filters: [{ path: '/recordings', recursive: 'true' }]
```

### Metadata-only options

`include_thumbnails` and `enrich_metadata` apply to **metadata imports only** — setting either on a media import fails with a 400, because imported media gets real thumbnails from the processing pipeline and a media run has no metadata-only record to enrich.

- **`include_thumbnails`** — copy the connector's poster images as default thumbnails (Grain and Iconik today). Off by default; it costs one rate-limited lookup per file, which is slow over large Iconik imports.
- **`enrich_metadata`** — backfill source-metadata fields the connector's list endpoint omits, after each index batch settles. Off by default. Today that means Gong parties + Call Spotlight content (batched — enriched documents are re-embedded so the content becomes searchable) and Dropbox `media_info` duration and dimensions (per-file). It is a no-op for other connectors, and costs upstream API budget plus, for Gong, embedding work.

## List, Get, Delete

```typescript
// List a collection's imports, newest first, each with its latest run inline
const imports = await client.bulkImports.listMetadataImports(collectionId, { limit: 50 });

// Get a definition with one page of its run history (newest first)
const detail = await client.bulkImports.getMetadataImport(collectionId, importId, {
  limit: 20,
  offset: 0,
});

// Delete the definition (files it imported stay in the collection)
await client.bulkImports.deleteMetadataImport(collectionId, importId);
```

## Trigger & Cancel Runs

Only one run may be active per collection at a time — triggering while any run in the collection is active fails with 409.

```typescript
// mode/delete_missing default to the definition's saved values
const run = await client.bulkImports.createMetadataImportRun(collectionId, importId, {
  mode: 'refresh',               // optional per-run override
  max_files: 500,                // optional per-run override
  enrich_metadata: true,         // optional per-run override (metadata imports only)
});

// Cancel an active run (files already imported stay in the collection)
await client.bulkImports.cancelMetadataImportRun(collectionId, importId, run.id);
```

Rerunning is also how a media import resumes after it stopped on exhausted credits or a usage limit: an `append` run skips files it already imported and retries the rest.

## Modes

| Mode | Behavior |
|------|----------|
| `append` | Only files not already in the collection are imported; previously-failed files are retried |
| `refresh` | Everything the filters match is re-imported. On a **media** import this re-syncs already-imported files' source metadata only — media bytes are never re-downloaded |

Only `refresh` runs honor `delete_missing`, and it sweeps **only** files that this import brought in and the source no longer returns — manually-added files and files from other imports are never touched. A `max_files`-capped run never sweeps, because a truncated listing proves nothing about what is missing.

To refresh a single file's source metadata instead of a whole run, use `client.files.syncSourceMetadata(fileId)` — see [Files](./files.md).

## Run Progress

Each run carries best-effort progress counters:

| Counter | Meaning |
|---|---|
| `pages_listed` / `files_listed` | listing progress over the connector |
| `files_created` / `files_updated` / `files_skipped` | collection-file bookkeeping |
| `files_imported` | media imports: files ingested into the collection so far |
| `files_queued` / `files_indexed` | metadata imports: search-index progress |
| `files_enriched` | metadata imports with `enrich_metadata`: records backfilled |
| `files_failed` / `files_removed` | failures, and delete-missing sweep removals |
