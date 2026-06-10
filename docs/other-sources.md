# Other Sources

Use any publicly available video URL directly with Cloudglue. Accepted by most API endpoints that operate on a video (`collections.addMediaByUrl()`, `describe.createDescribe()`, `extract.createExtract()`, `segments.createSegmentJob()`, ...).

## Supported URLs

| Source | Accepted forms | Notes |
|---|---|---|
| Direct video/audio URLs | Any public `http(s)://` URL pointing at a media file | Validated server-side via content type (mp4, mov, webm, mkv, avi, ogg + common audio formats). HTML pages fail with an unsupported-media-type error. |
| YouTube | `youtube.com/watch?v=`, `youtu.be/<id>`, `/shorts/`, `/live/`, `/embed/`, `/v/` | Public videos only. Shot-based segmentation is unavailable (no direct file access). |
| TikTok | `tiktok.com/@user/video/<id>`, `tiktok.com/t/<code>`, `vm.tiktok.com/<code>`, `vt.tiktok.com/<code>` | Public videos only. |
| Loom | `https://www.loom.com/share/<32-char-id>` | Public videos only. The SDK normalizes `loom.com/share/...` (no `www.`) and `/embed/` links to this form. |
| Zoom | `https://*.zoom.us/j/...`, `/s/...`, `/recording/detail...` | `zoom.us/rec/share/...` and `/rec/play/...` recording links are **not** supported. |
| Dropbox share links | `https://www.dropbox.com/scl/fi/...`, `/s/...` | Treated as a generic HTTP download (the server converts `dl=0` to `dl=1`): works only when the link is publicly accessible without login. Not usable with `dataConnectors.syncFile()`/`syncUrl()` — use the `dropbox://` URI from `dataConnectors.listFiles()` for connector sync. |
| Connector URIs | `s3://`, `gs://`, `gdrive://file/`, `zoom://`, `grain://recording/`, ... | Require a matching data connector; see [Data Connectors](./data-connectors.md). |
| Cloudglue files | `cloudglue://files/<fileId>` | References an already-ingested file. |

Google Drive share links (`drive.google.com/file/d/<id>`), S3 object URLs, and GCS object URLs are not accepted by the API as-is, but the SDK rewrites them to their connector URI forms automatically (see below) — they work wherever a matching data connector exists.

## Using URLs with Cloudglue

```typescript
const url = `https://www.loom.com/share/12345678901234567890123456789012`

const description = await client.describe.createDescribe(url, {
  enable_summary: true,
  enable_speech: true,
  enable_scene_text: true,
  enable_visual_scene_description: true,
});
```

## URL Utilities

The SDK exports the URL helpers it uses internally for sync, so you can classify and normalize URLs yourself (e.g. to validate user input before making a request):

```typescript
import { classifyVideoUrl, normalizeVideoUrl } from '@cloudglue/cloudglue-js';

classifyVideoUrl('https://youtu.be/dQw4w9WgXcQ');
// 'youtube'

const result = normalizeVideoUrl('https://drive.google.com/file/d/1a2bC3dE4f/view');
// {
//   url: 'gdrive://file/1a2bC3dE4f',   // form the API accepts
//   source: 'google-drive',
//   rewritten: true,
//   warnings: [],                       // notes on known limitations, if any
// }
```

`normalizeVideoUrl` rewrites Google Drive share links, S3/GCS https object URLs, Dropbox preview links (`/preview/<path>`, `/home/<folder>?preview=<file>` — these carry the real file path), Grain share links (`grain.com/share/recording/<id>/...` — syncs when the recording is in the connected Grain workspace), and non-canonical Loom links; everything else passes through unchanged. `warnings` flags URL forms with known limitations (e.g. Dropbox share links, Zoom `/rec/` links). The data connector sync methods apply this normalization automatically.
