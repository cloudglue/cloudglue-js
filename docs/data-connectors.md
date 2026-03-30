# Data Connectors API

Browse files available in connected external data sources. Data connectors are configured in the CloudGlue dashboard — this API lets you list connectors and browse their files.

## Supported Connectors

S3, Google Cloud Storage (GCS), Dropbox, Google Drive, Zoom, Gong, Recall

## List Connectors

```typescript
const connectors = await client.dataConnectors.list();
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
});
```

Files returned include URIs compatible with CloudGlue's import system — use them with `client.collections.addMediaByUrl()` or `client.describe.createDescribe()`.
