# Advanced APIs

## Face Detection

Detect faces in video frames.

```typescript
const job = await client.faceDetection.createFaceDetection({
  url: 'https://example.com/video.mp4',
  // frame_extraction_id: '...',       // use existing frame extraction
  // frame_extraction_config: { ... }, // or create new one
});

const result = await client.faceDetection.waitForReady(job.id);
const detection = await client.faceDetection.getFaceDetection(job.id, { limit: 50 });

// List and delete
const list = await client.faceDetection.listFaceDetections({ status: 'completed' });
await client.faceDetection.deleteFaceDetection(job.id);
```

## Face Match

Match a specific face across a video.

```typescript
const job = await client.faceMatch.createFaceMatch({
  source_image: {
    url: 'https://example.com/person.jpg',
    // OR base64_image: 'data:image/jpeg;base64,...'
    // OR file_path: '/path/to/image.jpg'
  },
  target_video_url: 'https://example.com/video.mp4',
  max_faces: 5,
  // face_detection_id: '...',        // use existing detection
  // frame_extraction_id: '...',
  // frame_extraction_config: { ... },
});

const result = await client.faceMatch.waitForReady(job.id);
const matches = await client.faceMatch.getFaceMatch(job.id, { limit: 50 });
await client.faceMatch.deleteFaceMatch(job.id);
```

## Segments (Segmentation Jobs)

Create and manage standalone segmentation jobs on videos. This is distinct from `client.segmentations` (which reads/manages existing segmentations on files).

```typescript
// Create a shot-based segmentation job
const job = await client.segments.createSegmentJob({
  url: 'https://example.com/video.mp4',
  criteria: 'shot',  // 'shot' or 'narrative'
  shot_config: {
    detector: 'adaptive',              // 'adaptive' or 'content'
    min_duration_seconds: 2,           // 1-600
    max_duration_seconds: 30,          // 1-600
    fill_gaps: true,
  },
});

// Create a narrative (chapter) segmentation job
const narrativeJob = await client.segments.createSegmentJob({
  url: 'https://example.com/video.mp4',
  criteria: 'narrative',
  // narrative_config: { ... },
});

// Wait for completion
const result = await client.segments.waitForReady(job.id);
// result.segments, result.shots, result.chapters available depending on criteria

// Get a segment job
const segJob = await client.segments.getSegmentJob(jobId);

// List segment jobs
const jobs = await client.segments.listSegmentJobs({
  criteria: 'shot',
  status: 'completed',
  limit: 10,
});

// Delete
await client.segments.deleteSegmentJob(jobId);
```

## Segmentations

Manage existing segmentations on files (read/delete, get thumbnails, list describes). Also accessible via `client.files`.

```typescript
const seg = await client.segmentations.getSegmentation(segmentationId, { limit: 50 });
await client.segmentations.deleteSegmentation(segmentationId);

// Get thumbnails for a segmentation
const thumbs = await client.segmentations.getSegmentationThumbnails(segmentationId, {
  segment_ids: ['seg_1', 'seg_2'],
  type: ['segment', 'keyframe'],
});

// List describe jobs for a segmentation
const describes = await client.segmentations.listSegmentationDescribes(segmentationId, {
  include_data: true,
  response_format: 'json',
});
```

## Segmentation Types

| Type | Description |
|------|-------------|
| `uniform` | Fixed-duration segments |
| `shot-detector` | Scene-change detection |
| `narrative` | Chapter-based (semantic) segmentation |

## Webhooks

```typescript
// CRUD operations via client.webhooks
// See source: src/api/webhooks.api.ts
```

## Tags

```typescript
// CRUD operations via client.tags
// See source: src/api/tags.api.ts
```

## Shareable Assets

```typescript
// Create public sharing links via client.shareable
// See source: src/api/shareable.api.ts
```
