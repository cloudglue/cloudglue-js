# Data Connectors API

Browse files available in connected external data sources and sync them into Cloudglue files. Data connectors are configured in the Cloudglue dashboard — this API lets you list connectors, browse their files, and materialize individual files.

## Supported Connectors

S3, Google Cloud Storage (GCS), Dropbox, Google Drive, Zoom, Gong, Recall, Grain, Iconik

## List Connectors

```typescript
const connectors = await client.dataConnectors.list();
// connectors.data: [{ id, type, created_at, ... }]
```

## Browse Files

```typescript
const files = await client.dataConnectors.listFiles(connectorId, {
  limit: 50,                   // 1-100
  page_token: 'next_page...',  // pagination token from previous response
  from: '2025-01-01',           // YYYY-MM-DD format
  to: '2025-06-01',
  // Provider-specific filters:
  folder_id: 'folder_123',    // Google Drive
  path: '/recordings/',        // Dropbox (folder path, default root)
  bucket: 'my-bucket',        // S3, GCS (required for these)
  prefix: 'videos/',          // S3, GCS
  title_search: 'video-title', // Grain, Zoom, Google Drive, Dropbox, Gong, Iconik
  team: 'team-name',           // Grain
  meeting_type: 'type-123'     // Grain
});
```

The `from`/`to` date filters are supported by Grain, Zoom, Recall, Google Drive, Dropbox, Gong, and Iconik (Zoom and Gong default to a 6-month lookback when omitted); they're ignored for S3/GCS. Filters a connector can't honor are silently ignored, and a filtered page may contain fewer than `limit` items (even zero) while `has_more` is still true — keep paginating until `next_page_token` is null.

Each returned file has a `uri` (null for folders), per-file provider `metadata` (participants, hosts, durations, AI summaries), and an ephemeral `thumbnail_url` where the provider offers one. These URIs are the canonical input for syncing — pass them verbatim to `syncFile()`/`syncUrl()`, or to general ingestion methods like `client.collections.addMediaByUrl()` or `client.describe.createDescribe()`.

## Sync a File

Materialize a connector URI into a Cloudglue file without starting a downstream job. Idempotent: syncing the same URI returns the existing file.

```typescript
// With an explicit connector:
const file = await client.dataConnectors.syncFile(connectorId, 'gdrive://file/<fileId>');

// Or let the SDK resolve the connector from the URL: picks the account's
// oldest connector whose type matches the URL's source.
const file = await client.dataConnectors.syncUrl('gdrive://file/<fileId>');
```

### Sync URI grammar

Each connector type accepts URIs in the form emitted by `listFiles()`:

| Connector type | URI form |
|---|---|
| `s3` | `s3://<bucket>/<key>` |
| `gcs` | `gs://<bucket>/<key>` |
| `google-drive` | `gdrive://file/<fileId>` |
| `dropbox` | `dropbox://<path>`, or `https://www.dropbox.com/{scl/fi\|s}/...` file share links |
| `zoom` | `zoom://uuid/<meetingUuid>`, `zoom://id/<meetingId>`, or `https://*.zoom.us/{j\|s\|recording/detail\|rec/share}/...` links |
| `grain` | `grain://recording/<recordingId>` |
| `gong` | `gong://call/<callId>` |
| `recall` | `recall://recording/<recordingId>` |
| `iconik` | `iconik://asset/<assetId>` |

`dropbox://` path parsing is tolerant: any leading-slash count and %-encoding spellings of the same path resolve — and dedupe — to the same file.

### Share links the SDK rewrites for you

The sync methods normalize URLs client-side (see the `normalizeVideoUrl` utility in [Other Sources](./other-sources.md)), so these pasted links also work:

- `https://drive.google.com/file/d/<id>/view`, `/open?id=<id>`, `/uc?id=<id>` → `gdrive://file/<id>`
- `https://<bucket>.s3.<region>.amazonaws.com/<key>` (and path-style) → `s3://<bucket>/<key>`
- `https://storage.googleapis.com/<bucket>/<key>` → `gs://<bucket>/<key>`
- `https://www.dropbox.com/preview/<path>` and `/home/<folder>?preview=<file>` → `dropbox:///<path>` (these carry the real file path)
- `https://grain.com/share/recording/<id>/<token>` → `grain://recording/<id>` (works when the recording is accessible to the connected Grain workspace; the token itself grants web-only access)

These share links pass through as-is and are resolved server-side via the connector's OAuth:

- Dropbox file share links (`https://www.dropbox.com/scl/fi/...`, `/s/...`) — works for login-gated files. Folder share links (`/scl/fo/...`) are rejected with 400.
- Zoom `https://*.zoom.us/rec/share/<token>` links — **best-effort**: Zoom often mints a new share token each time a link is copied from the portal, so fresh links may 404. The reliable form is the recording-detail link (`zoom.us/recording/detail?meeting_id=<uuid>`), which works for any recording age. `rec/play` links are rejected.

URLs that cannot map to any connector type — generic http(s) video URLs, YouTube, TikTok, Loom — are rejected client-side with guidance: they cannot be synced through a connector. Ingest them without a connector via `files.syncFromUrl()` (YouTube: `collections.addMediaByUrl()` only), or use them directly with general ingestion methods (`collections.addMediaByUrl()`, `describe.createDescribe()`, ...); see [Other Sources](./other-sources.md).

## Get Source Metadata

Fetch metadata for a connector URI from the upstream source without creating a Cloudglue file. Supported for Grain, Zoom, Recall, Google Drive, Dropbox, Gong, and Iconik; S3/GCS return 501 (plain object stores have no richer metadata).

```typescript
const metadata = await client.dataConnectors.getSourceMetadata(
  connectorId,
  'grain://recording/<recordingId>',
);
```

Synced connector files carry the same provider metadata on their `source_metadata` field. To re-fetch it live for an existing file (and re-index any metadata collections it belongs to), use `client.files.syncSourceMetadata(fileId)` — see [Files](./files.md). To index a connector's metadata at scale without downloading media, see [Metadata Imports](./metadata-imports.md).
