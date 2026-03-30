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

## Segments

Create intelligent segments for video or audio files based on shot detection or narrative analysis.

**Important:**
- YouTube URLs and audio files only support `narrative` criteria (shot detection requires direct video file access)
- YouTube URLs and audio files automatically use the `balanced` narrative strategy

### Shot-Based Segmentation

Detect scene changes in video files. Not available for YouTube URLs or audio files.

```typescript
const result = await client.segments.createSegmentJob({
  url: 'https://example.com/video.mp4',  // HTTP URL, cloudglue:// URI, or data connector URI
  criteria: 'shot',
  shot_config: {
    detector: 'adaptive',              // 'adaptive' or 'content'
    min_duration_seconds: 2,           // 1-600
    max_duration_seconds: 30,          // 1-600
    fill_gaps: true,
  },
});

const ready = await client.segments.waitForReady(result.id);
// ready.shots — array of detected shots with start_time and end_time
```

### Narrative Segmentation (Chapters)

Generate semantic chapters. Supports video files, audio files, and YouTube URLs.

```typescript
const result = await client.segments.createSegmentJob({
  url: 'https://example.com/video.mp4',
  criteria: 'narrative',
  narrative_config: {
    strategy: 'comprehensive',       // 'comprehensive' (default for video) or 'balanced' (default for YouTube/audio)
    number_of_chapters: 5,           // target chapter count (auto-calculated if omitted)
    min_chapters: 3,                 // optional minimum
    max_chapters: 8,                 // optional maximum
    // prompt: 'custom instructions for chapter generation',
  },
});

const ready = await client.segments.waitForReady(result.id);
// ready.chapters — array of chapters with start_time, end_time, and description
```

**Narrative strategies:**
- `comprehensive` — deep VLM analysis of video (default for non-YouTube video files; not available for YouTube or audio)
- `balanced` — multi-modal analysis (default for YouTube URLs and audio files; auto-selected, other strategies rejected)

### List, Get, Delete

```typescript
const jobs = await client.segments.listSegmentJobs({
  criteria: 'shot',         // 'shot' or 'narrative'
  status: 'completed',
  limit: 10,
});

const seg = await client.segments.getSegmentJob(jobId);
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
