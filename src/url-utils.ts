/**
 * Client-side URL classification and normalization utilities.
 *
 * These mirror the Cloudglue API's server-side URL handling so the SDK can
 * rewrite the links users actually paste (e.g. Google Drive share links,
 * https S3/GCS object URLs) into the URI forms the API accepts, before any
 * network call is made. URL-accepting SDK methods apply `normalizeVideoUrl`
 * automatically; both functions are also exported for direct use.
 */

/**
 * How the Cloudglue API classifies a URL. `video` is a `cloudglue://files/`
 * URI referencing an existing Cloudglue file; `http` is the generic fallback
 * for any other http(s) URL.
 */
export type VideoUrlSource =
  | 'youtube'
  | 's3'
  | 'dropbox'
  | 'video'
  | 'zoom'
  | 'google-drive'
  | 'tiktok'
  | 'loom'
  | 'http'
  | 'gong'
  | 'recall'
  | 'gcs'
  | 'grain';

export interface NormalizedVideoUrl {
  /** The URL to send to the API (rewritten when a known share-link form was recognized) */
  url: string;
  /** How the API will classify the (possibly rewritten) URL, or null if not a recognizable URL */
  source: VideoUrlSource | null;
  /** True when the URL was rewritten into a different form */
  rewritten: boolean;
  /** Human-readable notes about known limitations of the given URL form */
  warnings: string[];
}

// These regexes intentionally match the API server's classification rules.
const YOUTUBE_VIDEO_REGEX =
  /^https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?(?:[^&]*&)*v=|embed\/|v\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
const ZOOM_HTTPS_REGEX =
  /^https:\/\/([a-z0-9-]+\.)?zoom\.us\/(j\/|s\/|recording\/detail)/i;
const TIKTOK_URL_REGEX =
  /^https?:\/\/(?:(?:www\.)?tiktok\.com\/(?:t\/|@[^/]+\/video\/)|(?:vm|vt)\.tiktok\.com\/)/i;
const LOOM_SHARE_URL_REGEX =
  /^https:\/\/www\.loom\.com\/share\/([a-zA-Z0-9_-]{32})/;

/**
 * Connector URI grammar accepted by `POST /data-connectors/:id/sync`, keyed
 * by connector type. URIs returned by `dataConnectors.listFiles()` already
 * use these forms.
 */
export const CONNECTOR_SYNC_URI_GRAMMAR: Record<string, string> = {
  s3: 's3://<bucket>/<key>',
  gcs: 'gs://<bucket>/<key>',
  'google-drive': 'gdrive://file/<fileId>',
  dropbox: 'dropbox://<path>',
  zoom: 'zoom://uuid/<meetingUuid>, zoom://id/<meetingId>, or https://*.zoom.us/{j|s|recording/detail}/... links',
  grain: 'grain://recording/<recordingId>',
  gong: 'gong://call/<callId>',
  recall: 'recall://recording/<recordingId>',
};

function tryParseUrl(url: string): URL | null {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

// Returns null on malformed percent-sequences (e.g. '%zz') so rewrites can
// bail out and pass the URL through instead of throwing URIError
function tryDecodeURIComponent(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

/**
 * Classify a URL the way the Cloudglue API will. Returns null when the input
 * is not an http(s) URL or a recognized URI scheme.
 */
export function classifyVideoUrl(url: string): VideoUrlSource | null {
  if (YOUTUBE_VIDEO_REGEX.test(url)) return 'youtube';
  if (url.startsWith('s3://')) return 's3';
  // The server matches dl.dropboxusercontent.com as a substring; match on the
  // hostname instead so unrelated URLs embedding that string classify as http
  if (
    url.startsWith('dropbox://') ||
    tryParseUrl(url)?.hostname === 'dl.dropboxusercontent.com'
  )
    return 'dropbox';
  if (url.startsWith('cloudglue://files')) return 'video';
  if (
    url.startsWith('zoom://uuid/') ||
    url.startsWith('zoom://id/') ||
    ZOOM_HTTPS_REGEX.test(url)
  )
    return 'zoom';
  if (url.startsWith('gdrive://file/')) return 'google-drive';
  if (TIKTOK_URL_REGEX.test(url)) return 'tiktok';
  if (LOOM_SHARE_URL_REGEX.test(url)) return 'loom';
  if (url.startsWith('gong://call/')) return 'gong';
  if (url.startsWith('recall://recording/')) return 'recall';
  if (url.startsWith('gs://')) return 'gcs';
  if (url.startsWith('grain://recording/')) return 'grain';
  const parsed = tryParseUrl(url);
  if (parsed && (parsed.protocol === 'http:' || parsed.protocol === 'https:'))
    return 'http';
  return null;
}

function rewriteGoogleDriveUrl(parsed: URL): string | null {
  if (parsed.hostname !== 'drive.google.com') return null;
  const fileMatch = parsed.pathname.match(/^\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) return `gdrive://file/${fileMatch[1]}`;
  if (/^\/(open|uc)\/?$/.test(parsed.pathname)) {
    const id = parsed.searchParams.get('id');
    if (id && /^[a-zA-Z0-9_-]+$/.test(id)) return `gdrive://file/${id}`;
  }
  return null;
}

function rewriteS3Url(parsed: URL): string | null {
  const host = parsed.hostname;
  // Virtual-hosted style: <bucket>.s3.amazonaws.com, <bucket>.s3.<region>.amazonaws.com,
  // <bucket>.s3-<region>.amazonaws.com (legacy), incl. dualstack variants
  const virtualHosted = host.match(
    /^(.+?)\.s3(?:[.-][a-z0-9-]+)*\.amazonaws\.com$/,
  );
  // Path style: s3.amazonaws.com/<bucket>/<key>, s3.<region>.amazonaws.com/<bucket>/<key>
  const pathStyle = host.match(/^s3(?:[.-][a-z0-9-]+)*\.amazonaws\.com$/);
  if (virtualHosted) {
    const key = tryDecodeURIComponent(parsed.pathname.replace(/^\//, ''));
    if (!key) return null;
    return `s3://${virtualHosted[1]}/${key}`;
  }
  if (pathStyle) {
    const path = tryDecodeURIComponent(parsed.pathname.replace(/^\//, ''));
    if (path === null) return null;
    const slashIdx = path.indexOf('/');
    if (slashIdx === -1 || slashIdx === path.length - 1) return null;
    return `s3://${path}`;
  }
  return null;
}

function rewriteGcsUrl(parsed: URL): string | null {
  const host = parsed.hostname;
  if (host === 'storage.googleapis.com' || host === 'storage.cloud.google.com') {
    const path = tryDecodeURIComponent(parsed.pathname.replace(/^\//, ''));
    if (path === null) return null;
    const slashIdx = path.indexOf('/');
    if (slashIdx === -1 || slashIdx === path.length - 1) return null;
    return `gs://${path}`;
  }
  const virtualHosted = host.match(/^(.+)\.storage\.googleapis\.com$/);
  if (virtualHosted) {
    const key = tryDecodeURIComponent(parsed.pathname.replace(/^\//, ''));
    if (!key) return null;
    return `gs://${virtualHosted[1]}/${key}`;
  }
  return null;
}

function rewriteDropboxPreviewUrl(parsed: URL): string | null {
  if (
    parsed.hostname !== 'www.dropbox.com' &&
    parsed.hostname !== 'dropbox.com'
  )
    return null;
  // Unlike scl/fi share links, preview links carry the real file path, so
  // they can be rewritten to the dropbox:// URI form that listFiles emits:
  //   /preview/<path>?...            → dropbox:///<path>
  //   /home/<folder>?preview=<file>  → dropbox:///<folder>/<file>
  if (parsed.pathname.startsWith('/preview/')) {
    const path = tryDecodeURIComponent(parsed.pathname.slice('/preview'.length));
    if (path === null || path.length <= 1) return null;
    return `dropbox://${path}`;
  }
  if (parsed.pathname === '/home' || parsed.pathname.startsWith('/home/')) {
    const file = parsed.searchParams.get('preview');
    if (!file) return null;
    const folder = tryDecodeURIComponent(parsed.pathname.slice('/home'.length));
    if (folder === null) return null;
    return `dropbox://${folder}/${file}`;
  }
  return null;
}

function rewriteLoomUrl(url: string, parsed: URL): string | null {
  // Already in the exact form the API accepts — leave untouched
  if (LOOM_SHARE_URL_REGEX.test(url)) return null;
  if (parsed.hostname !== 'loom.com' && parsed.hostname !== 'www.loom.com')
    return null;
  const match = parsed.pathname.match(
    /^\/(?:share|embed)\/([a-zA-Z0-9_-]{32})/,
  );
  if (match) return `https://www.loom.com/share/${match[1]}`;
  return null;
}

function collectWarnings(url: string, warnings: string[]): void {
  const parsed = tryParseUrl(url);
  if (!parsed) return;
  const host = parsed.hostname;
  if (host === 'www.dropbox.com' || host === 'dropbox.com') {
    if (
      parsed.pathname.startsWith('/scl/fi/') ||
      parsed.pathname.startsWith('/s/')
    ) {
      warnings.push(
        'Dropbox share links are treated as generic HTTP downloads: they work with general ingestion methods (e.g. collections.addMediaByUrl) only when the link is publicly accessible, and cannot be used with dataConnectors.syncFile(). To sync via a Dropbox connector, use the dropbox:// URI returned by dataConnectors.listFiles().',
      );
    }
  }
  if (
    host === 'dl.dropboxusercontent.com' &&
    !parsed.pathname.startsWith('/1/view/')
  ) {
    warnings.push(
      'Only dl.dropboxusercontent.com/1/view/... URLs are accepted for Dropbox sync; other dl.dropboxusercontent.com forms (e.g. /scl/fi/...) may be rejected.',
    );
  }
  if (
    (host === 'zoom.us' || host.endsWith('.zoom.us')) &&
    parsed.pathname.startsWith('/rec/')
  ) {
    warnings.push(
      'Zoom recording share links (zoom.us/rec/...) are not supported. Use a zoom://uuid/<meetingUuid> URI from dataConnectors.listFiles(), or a https://*.zoom.us/{j|s|recording/detail} link.',
    );
  }
}

/**
 * Normalize a video URL into the form the Cloudglue API accepts.
 *
 * Rewrites, when recognized:
 * - Google Drive share links (`drive.google.com/file/d/<id>`, `/open?id=`,
 *   `/uc?id=`) → `gdrive://file/<id>`
 * - S3 object URLs (virtual-hosted or path style) → `s3://<bucket>/<key>`
 * - GCS object URLs (`storage.googleapis.com`, `storage.cloud.google.com`)
 *   → `gs://<bucket>/<key>`
 * - Dropbox preview links (`dropbox.com/preview/<path>`,
 *   `dropbox.com/home/<folder>?preview=<file>`) → `dropbox:///<path>`
 * - Loom links missing `www.` or using `/embed/` → canonical
 *   `https://www.loom.com/share/<id>`
 *
 * Everything else passes through unchanged. `warnings` flags URL forms with
 * known limitations (e.g. Dropbox share links, Zoom `/rec/` links).
 */
export function normalizeVideoUrl(url: string): NormalizedVideoUrl {
  const warnings: string[] = [];
  let result = url;
  const parsed = tryParseUrl(url);
  if (parsed && (parsed.protocol === 'http:' || parsed.protocol === 'https:')) {
    const rewrittenUrl =
      rewriteGoogleDriveUrl(parsed) ??
      rewriteS3Url(parsed) ??
      rewriteGcsUrl(parsed) ??
      rewriteDropboxPreviewUrl(parsed) ??
      rewriteLoomUrl(url, parsed);
    if (rewrittenUrl) result = rewrittenUrl;
  }
  collectWarnings(result, warnings);
  return {
    url: result,
    source: classifyVideoUrl(result),
    rewritten: result !== url,
    warnings,
  };
}
