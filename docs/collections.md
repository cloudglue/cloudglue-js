# Collections API

Collections group videos together for batch processing and querying (chat, search, responses, deep search).

## Collection Types

| Type | Description | Supports |
|------|-------------|----------|
| `media-descriptions` | Full multimodal (speech + visual + scene text + audio) | Chat, Search, Responses, Deep Search |
| `rich-transcripts` | Speech-focused with visual context | Chat, Search, Deep Search |
| `entities` | Structured extracted data | Query API (SQL), Search & Deep Search (file scope, `doc_lexical`), Responses API (entity-backed with nimbus-002-preview) |
| `face-analysis` | Face detection data | Face-specific queries |
| `metadata` | Connector source metadata + user metadata indexed into file-level search docs — no media download or processing, free to index | Search & Deep Search (file scope, `doc_lexical`), metadata-mode extraction |

## Create a Collection

```typescript
const collection = await client.collections.createCollection({
  name: 'My Videos',
  collection_type: 'media-descriptions',  // default
  // Optional configs:
  // default_segmentation_config: { strategy: 'shot-detector' },
  // describe_config: { enable_speech: true, enable_visual_scene_description: true },
  // default_thumbnails_config: { ... },
  // For 'entities' collections:
  // extract_config: { prompt, schema, enable_video_level_entities,
  //                   enable_segment_level_entities, enable_transcript_mode,
  //                   enable_metadata_mode },
});
```

Only provide the config that matches the `collection_type` — other configs are ignored.

## Metadata Collections

`collection_type: 'metadata'` indexes connector source metadata and user metadata into file-level search documents **without downloading or processing the media**. Indexing is free. Supported sources: google-drive, dropbox, zoom, gong, recall, grain, and iconik URLs. No processing configs are accepted.

Populate one via `addMedia` with connector-synced files, or in bulk with the [Bulk Imports API](./bulk-imports.md) (`client.bulkImports`). Query with search/deep search at `file` scope (the `doc_lexical` modality matches the metadata docs), or run metadata-mode extraction over the files (see [Extract](./extract.md)). Refresh a single file's source metadata — and re-index its documents — with `client.files.syncSourceMetadata(fileId)`.

## Add Videos

```typescript
// Add an already-uploaded file
await client.collections.addMedia(collectionId, fileId, {
  // Optional: override collection-level configs for this file
});

// Add by URL (Cloudglue will download and process)
await client.collections.addMediaByUrl({
  collectionId,
  url: 'https://example.com/video.mp4',
  params: {},
});

// Wait for a specific video to be ready in the collection
await client.collections.waitForReady(collectionId, fileId);
```

## List & Manage

```typescript
// List collections
const collections = await client.collections.listCollections({
  collection_type: 'media-descriptions',
  order: 'created_at',
  limit: 10,
});

// Get, update, delete
const coll = await client.collections.getCollection(collectionId);
await client.collections.updateCollection(collectionId, { name: 'Renamed' });
await client.collections.deleteCollection(collectionId);

// List videos in a collection
const videos = await client.collections.listVideos(collectionId, {
  status: 'completed',
  limit: 50,
  filter: { metadata: [{ path: 'tag', operator: FilterOperator.Equal, valueText: 'demo' }] },
});

// Get/delete a specific video
const video = await client.collections.getVideo(collectionId, fileId);
await client.collections.deleteVideo(collectionId, fileId);

// Videos in searchable collections (media-descriptions, rich-transcripts,
// metadata, entities) also report searchable_status ('pending' |
// 'processing' | 'completed' | 'failed') — indexing progress of the
// file's search documents.
```

## Retrieve Processed Data

```typescript
// Get entities (for 'entities' collection type)
const entities = await client.collections.getEntities(collectionId, fileId, {
  include_thumbnails: true,
  include_chapters: true,            // requires narrative segmentation
  include_shots: true,               // requires shot_detector segmentation
});

// Get media descriptions (for 'media-descriptions' type)
const descriptions = await client.collections.getMediaDescriptions(collectionId, fileId, {
  response_format: 'markdown',  // or 'json'
  include_thumbnails: true,
  include_word_timestamps: true,
  include_chapters: true,            // requires narrative segmentation
  include_metadata: true,            // include file's `metadata` + `source_metadata` on `file`
});

// Get transcripts (for 'rich-transcripts' type)
const transcripts = await client.collections.getTranscripts(collectionId, fileId, {
  response_format: 'json',
  modalities: ['speech', 'visual_scene_description'],
  include_word_timestamps: true,
});

// List all entities/descriptions/transcripts across a collection
// (description/transcript listings also accept include_metadata)
const allEntities = await client.collections.listEntities(collectionId, { limit: 50 });
const allDescriptions = await client.collections.listMediaDescriptions(collectionId, { limit: 50 });
const allTranscripts = await client.collections.listRichTranscripts(collectionId, { limit: 50 });

// Get face detections
const faces = await client.collections.getFaceDetections(collectionId, fileId);
```

## Deprecated Methods

- `addVideo` → use `addMedia`
- `addVideoByUrl` → use `addMediaByUrl`
