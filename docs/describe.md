# Describe API

Generate rich multimodal descriptions of video content including speech transcription, visual scene descriptions, scene text (OCR), and audio descriptions.

**Note:** The `transcribe` API is deprecated. Use `describe` instead.

## Create a Describe Job

```typescript
const job = await client.describe.createDescribe(
  'https://example.com/video.mp4',  // video URL
  {
    enable_speech: true,
    enable_visual_scene_description: true,
    enable_scene_text: true,
    enable_audio_description: true,
    enable_summary: true,
    include_chapters: true,            // chapters use narrative segmentation
    include_shots: true,               // shots use shot_detector segmentation
    use_in_default_index: true,        // makes file searchable via default index for Responses API / Deep Search
    segmentation_config: {
      strategy: 'shot-detector',      // or 'uniform', 'narrative'
    },
    // thumbnail_config: { ... },
    // segmentation_id: 'existing_seg_id',  // use existing segmentation
  }
);
```

## Wait for Completion

```typescript
const result = await client.describe.waitForReady(job.id, {
  response_format: 'json',  // 'json' | 'markdown' | 'speech_srt' | 'speech_vtt' | 'speech_markdown' | 'speech_text'
  pollingInterval: 5000,
  maxAttempts: 36,
});
```

## Get a Describe Result

```typescript
const describe = await client.describe.getDescribe(jobId, {
  response_format: 'markdown',
  modalities: ['speech', 'visual_scene_description'],  // filter which modalities to include
  start_time_seconds: 0,
  end_time_seconds: 60,
  include_thumbnails: true,
  include_word_timestamps: true,
  include_chapters: true,            // requires narrative segmentation on the file
  include_shots: true,               // requires shot_detector segmentation on the file
});
```

## List & Delete

```typescript
const describes = await client.describe.listDescribes({
  status: 'completed',
  url: 'https://example.com/video.mp4',
  include_data: true,
  response_format: 'json',
  modalities: ['speech'],
  limit: 10,
});

await client.describe.deleteDescribe(jobId);
```

## Update

```typescript
// Toggle whether this describe's file appears in the default index
await client.describe.updateDescribe(jobId, { use_in_default_index: false });
```

## Modalities

| Modality | Description |
|----------|-------------|
| `speech` | Speech transcription |
| `visual_scene_description` | Visual scene narration |
| `scene_text` | OCR / on-screen text |
| `audio_description` | Non-speech audio events |
| `summary` | Overall video summary |
| `segment_summary` | Per-segment summaries |
| `title` | Generated title |

## Response Formats

| Format | Description |
|--------|-------------|
| `json` | Structured JSON with all fields |
| `markdown` | Human-readable markdown |
| `speech_srt` | SRT subtitle format |
| `speech_vtt` | WebVTT subtitle format |
| `speech_markdown` | Speech as Markdown |
| `speech_text` | Plain text speech only |
