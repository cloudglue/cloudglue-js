# Extract API

Extract structured data from videos using custom prompts and schemas.

**Images:** `createExtract` also accepts images — pass an uploaded image's `cloudglue://files/<id>` URI or a direct public image URL. Images aren't segmented, so use whole-file extraction (`enable_video_level_entities: true`, `enable_segment_level_entities: false`); `segment_entities` comes back empty.

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
    enable_metadata_mode: false,           // set true to extract from the file's metadata document
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
- **Metadata mode** (`enable_metadata_mode: true`): Extracts entities from the file's **metadata document** (filename, file details, user metadata, connector source metadata) instead of the media content. File-level entities only, flat 1 credit per file, and works on metadata-only files (e.g. files in a `metadata` collection) — the media itself is never processed.

Segment-level and video-level are mutually exclusive — set one to `true` and the other to `false`.

## Query Extracted Data

Once files have completed extractions, run SQL or natural-language queries over the results with the [Query API](./query.md) (`client.query`).
