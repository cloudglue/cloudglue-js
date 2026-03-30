# Extract API

Extract structured data from videos using custom prompts and schemas.

## Create an Extract Job

```typescript
const job = await client.extract.createExtract(
  'https://example.com/video.mp4',
  {
    prompt: 'Extract all product mentions with prices',
    schema: {
      type: 'object',
      properties: {
        product: { type: 'string' },
        price: { type: 'number' },
        timestamp: { type: 'string' },
      },
    },
    enable_segment_level_entities: true,   // per-segment extraction (default behavior)
    enable_video_level_entities: false,    // set true for whole-video extraction instead
    enable_transcript_mode: false,         // set true for transcript-only extraction
    // segmentation_config, segmentation_id, thumbnails_config also available
  }
);
```

## Wait for Completion

```typescript
const result = await client.extract.waitForReady(job.id);
```

## Get Results

```typescript
const extract = await client.extract.getExtract(jobId, {
  limit: 50,
  offset: 0,
  include_thumbnails: true,
  include_chapters: true,            // requires narrative segmentation
  include_shots: true,               // requires shot_detector segmentation
});
```

## List & Delete

```typescript
const extracts = await client.extract.listExtracts({
  status: 'completed',
  url: 'https://example.com/video.mp4',
  include_data: true,
  limit: 10,
});

await client.extract.deleteExtract(jobId);
```

## Extraction Modes

- **Segment-level** (`enable_segment_level_entities: true`): Extracts entities per video segment. Each segment produces its own structured output. This is the default.
- **Video-level** (`enable_video_level_entities: true`): Extracts entities for the entire video as a single output.

These modes are mutually exclusive — set one to `true` and the other to `false`.
