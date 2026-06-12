# Other Sources

Use any publicly available video URL directly with Cloudglue. Accepted by most API endpoints that operate on a video (`collections.addMediaByUrl()`, `describe.createDescribe()`, `extract.createExtract()`, `segments.createSegmentJob()`, ...). To materialize a URL into a standalone file without starting a job, use `files.syncFromUrl()` (see [Files](./files.md)).

## Supported URLs

| Source | Accepted forms | Notes |
|---|---|---|
| Direct video/audio URLs | Any public `http(s)://` URL pointing at a media file | Validated server-side via content type (mp4, mov, webm, mkv, avi, ogg + common audio formats). HTML pages fail with an unsupported-media-type error. |
| YouTube | `youtube.com/watch?v=`, `youtu.be/<id>`, `/shorts/`, `/live/`, `/embed/`, `/v/` | Public videos only. Shot-based segmentation is unavailable (no direct file access). |
| TikTok | `tiktok.com/@user/video/<id>`, `tiktok.com/t/<code>`, `vm.tiktok.com/<code>`, `vt.tiktok.com/<code>` | Public videos only. |
| Loom | `https://www.loom.com/share/<32-char-id>` | Public videos only. The SDK normalizes `loom.com/share/...` (no `www.`) and `/embed/` links to this form. |
| Zoom | `https://*.zoom.us/j/...`, `/s/...`, `/recording/detail...`, `/rec/share/...` | Requires a Zoom data connector. `rec/share` links resolve **best-effort**: Zoom often mints a new share token each time a link is copied, so fresh links may 404 — the reliable form is the recording-detail link (`zoom.us/recording/detail?meeting_id=<uuid>`). `/rec/play/...` links are **not** supported. |
| Dropbox file share links | `https://www.dropbox.com/scl/fi/...`, `/s/...` | Sync through a Dropbox data connector via OAuth (`dataConnectors.syncFile()`/`syncUrl()`), including login-gated links. Without a connector, they work on general ingestion (and `files.syncFromUrl()`) only when publicly accessible (the server converts `dl=0` to `dl=1`); login-gated/expired links fail with 403. Folder share links (`/scl/fo/...`) are rejected with 400. |
| Connector URIs | `s3://`, `gs://`, `gdrive://file/`, `zoom://`, `grain://recording/`, ... | Require a matching data connector; see [Data Connectors](./data-connectors.md). |
| Cloudglue files | `cloudglue://files/<fileId>` | References an already-ingested file. |

Google Drive share links (`drive.google.com/file/d/<id>`, `/open?id=<id>`) are normalized server-side to `gdrive://file/<id>` and work wherever a Google Drive connector exists; `uc?id=` direct-download links stay on the anonymous http path. S3 and GCS object URLs are rewritten client-side to their connector URI forms (see below).

**Unsupported video-page hosts:** page links from `vimeo.com`, `1drv.ms`, `onedrive.live.com`, and `box.com` are rejected with a specific 400. Direct-download shapes from those services still work as generic http URLs (e.g. `app.box.com/shared/static/...`, `player.vimeo.com/progressive_redirect/...`).

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

`normalizeVideoUrl` rewrites Google Drive share links, S3/GCS https object URLs, Dropbox preview links (`/preview/<path>`, `/home/<folder>?preview=<file>` — these carry the real file path), Grain share links (`grain.com/share/recording/<id>/...` — syncs when the recording is in the connected Grain workspace), and non-canonical Loom links; everything else passes through unchanged. `warnings` flags URL forms with known limitations (e.g. Dropbox folder links, Zoom `/rec/play/` links, best-effort Zoom `/rec/share/` tokens). The data connector sync methods and `files.syncFromUrl()` apply this normalization automatically.
