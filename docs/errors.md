# Error Handling

## CloudglueError

All API errors are wrapped in `CloudglueError`:

```typescript
import { CloudglueError } from '@cloudglue/cloudglue-js';

try {
  await client.files.getFile('bad-id');
} catch (error) {
  if (error instanceof CloudglueError) {
    error.message;       // Error description
    error.statusCode;    // HTTP status code
    error.data;          // Request body that caused the error
    error.headers;       // Response headers
    error.responseData;  // Full response body
  }
}
```

## Common Errors

| Status | Cause | Fix |
|--------|-------|-----|
| 401 | Invalid or missing API key | Check `CLOUDGLUE_API_KEY` env var or `apiKey` constructor param. Keys start with `cg-`. |
| 404 | Resource not found | Verify the resource ID exists. File IDs, collection IDs, and job IDs are UUIDs. |
| 408 | Request timeout | Increase `timeout` in client config or check network. |
| 429 | Rate limit exceeded | Back off and retry. Check your plan's rate limits. |
| 500 | Server error | Retry with exponential backoff. |

## URL Ingestion & Sync Errors

On URL ingestion endpoints (`files.syncFromUrl()`, `dataConnectors.syncFile()`/`syncUrl()`, `collections.addMediaByUrl()`, ...):

| Status | Cause | Fix |
|--------|-------|-----|
| 400 | Folder link (Dropbox `/scl/fo/...`, Drive folder), unsupported video-page host (`vimeo.com`, `1drv.ms`, `onedrive.live.com`, `box.com`), or URL/connector type mismatch | Share a single file; for unsupported hosts, use a direct-download URL shape (e.g. `app.box.com/shared/static/...`, `player.vimeo.com/progressive_redirect/...`). |
| 402 | Insufficient credit balance (TikTok URLs consume scrape credits) | Top up credits or remove TikTok URLs. |
| 403 | Source file not accessible (login-gated, expired, or restricted share link) | Make the link public, or sync via a data connector's OAuth (`dataConnectors.syncFile()`). |
| 404 | File/recording not found at the source (e.g. a stale Zoom `rec/share` token) | For Zoom, use the recording-detail link (`zoom.us/recording/detail?meeting_id=<uuid>`). |
| 415 | URL does not serve a supported video/audio content type | Point at the media file itself, not an HTML page. |
| 429 | External service rate limit (Dropbox, Zoom) or plan resource limits (upload count, duration, file size) | Retry shortly; check plan limits. |
| 502 | Upstream/network failure fetching the source | Retry with backoff. |

## Polling Timeouts

`waitForReady()` methods throw `CloudglueError` when max attempts are reached:

```text
Timeout waiting for file abc123 to process after 36 attempts
```

To increase the timeout:
```typescript
await client.files.waitForReady(fileId, {
  pollingInterval: 10000,  // 10s between polls
  maxAttempts: 60,         // 60 attempts = 10 min total
});
```

## Processing Failures

`waitForReady()` also throws when a job fails:

```text
File processing failed: abc123
```

Check the file/job status via `getFile()` or `getDescribe()` for more details.

## Streaming Errors

Streaming (Responses API, Deep Search) requires an environment that supports `ReadableStream`:
- Node.js 18+
- Modern browsers

Error: `Response body is empty — streaming not supported in this environment`

## Network Errors

Connection timeouts return status 408 with `ECONNABORTED` error code. Configure timeout:

```typescript
const client = new Cloudglue({
  apiKey: process.env.CLOUDGLUE_API_KEY,
  timeout: 30000,  // 30 seconds
});
```
