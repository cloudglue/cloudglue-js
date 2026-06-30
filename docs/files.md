# Files API

Manage video, audio, and image files in Cloudglue.

## Upload a File

```typescript
const uploaded = await client.files.uploadFile({
  file: myFile,                        // globalThis.File object (video, audio, or image)
  metadata: { project: 'demo' },      // optional key-value metadata
  enable_segment_thumbnails: true,     // optional: generate thumbnails per segment
});

// Wait for processing to complete
const file = await client.files.waitForReady(uploaded.data.id);
```

**Note:** File uploads use `multipart/form-data` via axios directly (not Zodios). The `file` parameter must be a `globalThis.File` object.

### Image files

Images (JPEG/PNG/WebP, …) upload through the same `uploadFile`/`syncFromUrl`/`waitForReady` flow as video and audio. On the returned file, `media_type === 'image'` and `media_info` carries `width`/`height` (with `duration_seconds` ≈ 0 and `has_audio: false`).

Images are processed **at the file level only** — they are not segmented. As a result they have no segments, no per-segment thumbnails, and `enable_segment_thumbnails` is ignored. Describe and extract still work on images: pass the file's `cloudglue://files/<id>` URI (or a direct public image URL) to `describe.createDescribe()` / `extract.createExtract()`. Visual modalities (`visual_scene_description`, `scene_text`, `summary`, `title`) are populated; speech/audio modalities come back empty.

## Sync from URL

Materialize a publicly accessible URL into a Cloudglue file without a data connector or a collection. Idempotent: syncing the same URL returns the existing file.

```typescript
const file = await client.files.syncFromUrl('https://example.com/video.mp4', {
  metadata: { project: 'demo' },           // optional key-value metadata
  enable_segment_thumbnails: true,          // optional, defaults to true (matching upload)
});

const ready = await client.files.waitForReady(file.id);
```

Accepted URL forms:

- Direct http(s) video, audio, or image file URLs (e.g. `.mp4`, `.jpg`/`.png`/`.webp`)
- Public Dropbox share links (`dropbox.com/scl/fi/...`, `/s/...`)
- TikTok video URLs (consumes scrape credits — 402 if the balance is insufficient)
- Loom share URLs (non-canonical forms are rewritten client-side)

The host must serve the bytes to an anonymous request. Image URLs gated behind a browser User-Agent (e.g. some Wikimedia links) are rejected server-side as `Unsupported file type`.

Not accepted — the SDK rejects these client-side with guidance:

- YouTube URLs: collection-only, use `collections.addMediaByUrl()`
- Connector-native URLs (`s3://`, `gs://`, `gdrive://`, `dropbox://`, Zoom/Gong/Recall/Grain links, Drive share links): use `dataConnectors.syncFile()`/`syncUrl()` — see [Data Connectors](./data-connectors.md)

## List Files

```typescript
const files = await client.files.listFiles({
  status: 'completed',                 // 'pending' | 'processing' | 'completed' | 'failed' | 'not_applicable'
  limit: 10,
  offset: 0,
  order: 'created_at',                 // 'created_at' | 'filename'
  sort: 'desc',                        // 'asc' | 'desc'
  created_before: '2025-01-01',  // YYYY-MM-DD format
  created_after: '2024-01-01',
  filter: {                            // optional metadata/property filters
    metadata: [{
      path: 'project',
      operator: FilterOperator.Equal,
      valueText: 'demo',
    }],
  },
});
```

## Get, Update, Delete

```typescript
const file = await client.files.getFile(fileId);

await client.files.updateFile(fileId, {
  filename: 'new-name.mp4',
  metadata: { updated: true },
});

await client.files.deleteFile(fileId);
```

## File Segments & Segmentations

```typescript
// List segmentations for a file
const segmentations = await client.files.listFileSegmentations(fileId, { limit: 10 });

// Create a new segmentation
await client.files.createFileSegmentation(fileId, {
  strategy: 'shot-detector',  // or 'uniform', 'narrative'
});

// List segments
const segments = await client.files.listFileSegments(fileId, {
  limit: 50,
  startTimeAfter: 0,
  endTimeBefore: 120,
});

// Get/update a specific segment
const segment = await client.files.getFileSegment(fileId, segmentId);
await client.files.updateFileSegment(fileId, segmentId, { metadata: { label: 'intro' } });
```

## Thumbnails

```typescript
const thumbnails = await client.files.getFileThumbnails(fileId, {
  limit: 10,
  type: ['segment', 'keyframe'],  // 'segment' | 'keyframe' | 'file' | 'frame'
  isDefault: false,
  segmentationId: 'seg_...',       // optional: filter by segmentation
});
```

## Frame Extraction

```typescript
await client.files.createFileFrameExtraction(fileId, {
  // FrameExtractionConfig
});
```

## Tags

```typescript
const tags = await client.files.getFileTags(fileId);
const segmentTags = await client.files.getFileSegmentTags(fileId, segmentId);
```

## Describe Outputs per Segment

```typescript
const describes = await client.files.listFileSegmentDescribes(fileId, segmentId, {
  status: 'completed',
  response_format: 'json',  // or 'markdown'
  include_data: true,
});

const describe = await client.files.getFileSegmentDescribe(fileId, segmentId, jobId, {
  response_format: 'markdown',
});
```

## File Statuses

| Status | Meaning |
|--------|---------|
| `pending` | Uploaded, awaiting processing |
| `processing` | Currently being processed |
| `completed` | Ready to use |
| `failed` | Processing failed |
| `not_applicable` | No processing needed |

## waitForReady

Polls `getFile` until the file reaches a terminal state (`completed`, `failed`, `not_applicable`).

```typescript
const file = await client.files.waitForReady(fileId, {
  pollingInterval: 5000,  // default: 5000ms
  maxAttempts: 36,        // default: 36 (= 3 min total)
});
```

Throws `CloudglueError` if the file fails or polling times out.
