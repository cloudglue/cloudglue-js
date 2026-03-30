# Files API

Manage video and audio files in CloudGlue.

## Upload a File

```typescript
const uploaded = await client.files.uploadFile({
  file: myFile,                        // globalThis.File object
  metadata: { project: 'demo' },      // optional key-value metadata
  enable_segment_thumbnails: true,     // optional: generate thumbnails per segment
});

// Wait for processing to complete
const file = await client.files.waitForReady(uploaded.data.id);
```

**Note:** File uploads use `multipart/form-data` via axios directly (not Zodios). The `file` parameter must be a `globalThis.File` object.

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
