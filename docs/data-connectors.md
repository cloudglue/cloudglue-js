# Data Connectors API

Browse files available in connected external data sources and sync them into Cloudglue files. Data connectors are configured in the Cloudglue dashboard — this API lets you list connectors, browse their files, and materialize individual files.

## Supported Connectors

S3, Google Cloud Storage (GCS), Dropbox, Google Drive, Zoom, Gong, Recall, Grain

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
  folder_id: 'folder_123',    // Google Drive, Dropbox
  path: '/recordings/',        // path-based sources
  bucket: 'my-bucket',        // S3, GCS
  prefix: 'videos/',          // S3, GCS
  title_search: 'video-title', // Grain
  team: 'team-name',           // Grain
  meeting_type: 'type-123'     // Grain
});
```

Each returned file has a `uri` (null for folders). These URIs are the canonical input for syncing — pass them verbatim to `syncFile()`/`syncUrl()`, or to general ingestion methods like `client.collections.addMediaByUrl()` or `client.describe.createDescribe()`.

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
| `dropbox` | `dropbox://<path>` |
| `zoom` | `zoom://uuid/<meetingUuid>`, `zoom://id/<meetingId>`, or `https://*.zoom.us/{j\|s\|recording/detail}/...` links |
| `grain` | `grain://recording/<recordingId>` |
| `gong` | `gong://call/<callId>` |
| `recall` | `recall://recording/<recordingId>` |

### Share links the SDK rewrites for you

The sync methods normalize URLs client-side (see the `normalizeVideoUrl` utility in [Other Sources](./other-sources.md)), so these pasted links also work:

- `https://drive.google.com/file/d/<id>/view`, `/open?id=<id>`, `/uc?id=<id>` → `gdrive://file/<id>`
- `https://<bucket>.s3.<region>.amazonaws.com/<key>` (and path-style) → `s3://<bucket>/<key>`
- `https://storage.googleapis.com/<bucket>/<key>` → `gs://<bucket>/<key>`

URLs that cannot map to any connector type — generic http(s) video URLs, YouTube, TikTok, Loom, and `www.dropbox.com` share links — are rejected client-side with guidance: they cannot be synced through a connector. Use them with general ingestion methods instead (`collections.addMediaByUrl()`, `describe.createDescribe()`, ...); see [Other Sources](./other-sources.md).

## Get Source Metadata

Fetch metadata for a connector URI from the upstream source without creating a Cloudglue file. Currently supported for Grain; other connector types return 501.

```typescript
const metadata = await client.dataConnectors.getSourceMetadata(
  connectorId,
  'grain://recording/<recordingId>',
);
```
