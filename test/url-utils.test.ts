import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  classifyVideoUrl,
  normalizeVideoUrl,
  CONNECTOR_SYNC_URI_GRAMMAR,
} from '../src/url-utils';

describe('classifyVideoUrl', () => {
  const cases: Array<[string, string | null]> = [
    ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'youtube'],
    ['https://youtu.be/dQw4w9WgXcQ', 'youtube'],
    ['https://www.youtube.com/shorts/dQw4w9WgXcQ', 'youtube'],
    ['https://www.youtube.com/live/dQw4w9WgXcQ', 'youtube'],
    ['s3://my-bucket/folder/video.mp4', 's3'],
    ['gs://my-bucket/folder/video.mp4', 'gcs'],
    ['dropbox:///test/video.mp4', 'dropbox'],
    ['https://dl.dropboxusercontent.com/1/view/abc/test/video.mp4', 'dropbox'],
    ['cloudglue://files/123e4567-e89b-12d3-a456-426614174000', 'video'],
    ['zoom://uuid/abc%3D%3D', 'zoom'],
    ['zoom://id/123456789', 'zoom'],
    ['https://us02web.zoom.us/j/123456789', 'zoom'],
    ['https://zoom.us/recording/detail?meeting_id=abc', 'zoom'],
    ['gdrive://file/1a2b3c4d5e', 'google-drive'],
    ['https://www.tiktok.com/@user/video/7123456789012345678', 'tiktok'],
    ['https://vm.tiktok.com/ZM8abcdef/', 'tiktok'],
    ['https://vt.tiktok.com/ZM8abcdef/', 'tiktok'],
    ['https://www.tiktok.com/t/ZM8abcdef/', 'tiktok'],
    ['https://www.loom.com/share/0281766fa2d04bb788eaf19e65135184', 'loom'],
    ['gong://call/123456', 'gong'],
    ['recall://recording/abc-123', 'recall'],
    ['grain://recording/abc-123', 'grain'],
    ['https://example.com/video.mp4', 'http'],
    ['http://example.com/video.mp4', 'http'],
    // share links the server treats as generic http
    [
      'https://www.dropbox.com/scl/fi/r85h2r4d9s13la63r5pzf/video.mp4?rlkey=x&dl=0',
      'http',
    ],
    ['https://zoom.us/rec/share/abcdef', 'http'],
    // loom without www / http scheme falls through to http
    ['https://loom.com/share/0281766fa2d04bb788eaf19e65135184', 'http'],
    // hostname must actually be dl.dropboxusercontent.com, not a substring elsewhere
    ['https://evil.com/dl.dropboxusercontent.com/video.mp4', 'http'],
    ['not a url', null],
    ['ftp://example.com/video.mp4', null],
  ];

  for (const [url, expected] of cases) {
    it(`classifies ${url} as ${expected}`, () => {
      assert.equal(classifyVideoUrl(url), expected);
    });
  }
});

describe('normalizeVideoUrl rewrites', () => {
  const rewriteCases: Array<[string, string, string]> = [
    // Google Drive
    [
      'https://drive.google.com/file/d/1a2bC3dE4fG5hI6jK7lM/view?usp=sharing',
      'gdrive://file/1a2bC3dE4fG5hI6jK7lM',
      'google-drive',
    ],
    [
      'https://drive.google.com/file/d/1a2bC3dE4fG5hI6jK7lM/preview',
      'gdrive://file/1a2bC3dE4fG5hI6jK7lM',
      'google-drive',
    ],
    [
      'https://drive.google.com/open?id=1a2bC3dE4fG5hI6jK7lM',
      'gdrive://file/1a2bC3dE4fG5hI6jK7lM',
      'google-drive',
    ],
    [
      'https://drive.google.com/uc?export=download&id=1a2bC3dE4fG5hI6jK7lM',
      'gdrive://file/1a2bC3dE4fG5hI6jK7lM',
      'google-drive',
    ],
    [
      'https://drive.google.com/open/?id=1a2bC3dE4fG5hI6jK7lM',
      'gdrive://file/1a2bC3dE4fG5hI6jK7lM',
      'google-drive',
    ],
    [
      'https://drive.google.com/uc/?id=1a2bC3dE4fG5hI6jK7lM',
      'gdrive://file/1a2bC3dE4fG5hI6jK7lM',
      'google-drive',
    ],
    // S3 virtual-hosted style
    [
      'https://my-bucket.s3.amazonaws.com/folder/video.mp4',
      's3://my-bucket/folder/video.mp4',
      's3',
    ],
    [
      'https://my-bucket.s3.us-west-2.amazonaws.com/folder/video.mp4',
      's3://my-bucket/folder/video.mp4',
      's3',
    ],
    [
      'https://my-bucket.s3-eu-west-1.amazonaws.com/video.mp4',
      's3://my-bucket/video.mp4',
      's3',
    ],
    [
      'https://my-bucket.s3.dualstack.us-east-1.amazonaws.com/video.mp4',
      's3://my-bucket/video.mp4',
      's3',
    ],
    // S3 path style
    [
      'https://s3.amazonaws.com/my-bucket/folder/video.mp4',
      's3://my-bucket/folder/video.mp4',
      's3',
    ],
    [
      'https://s3.us-east-1.amazonaws.com/my-bucket/video.mp4',
      's3://my-bucket/video.mp4',
      's3',
    ],
    // S3 percent-encoded key
    [
      'https://my-bucket.s3.amazonaws.com/my%20folder/video%20file.mp4',
      's3://my-bucket/my folder/video file.mp4',
      's3',
    ],
    // GCS
    [
      'https://storage.googleapis.com/my-bucket/folder/video.mp4',
      'gs://my-bucket/folder/video.mp4',
      'gcs',
    ],
    [
      'https://storage.cloud.google.com/my-bucket/video.mp4',
      'gs://my-bucket/video.mp4',
      'gcs',
    ],
    [
      'https://my-bucket.storage.googleapis.com/folder/video.mp4',
      'gs://my-bucket/folder/video.mp4',
      'gcs',
    ],
    // Dropbox preview links → dropbox:/// URI (same form listFiles emits)
    [
      'https://www.dropbox.com/preview/test%20with%20spaces/runyourway.mp4?context=content_suggestions&role=personal',
      'dropbox:///test with spaces/runyourway.mp4',
      'dropbox',
    ],
    [
      'https://www.dropbox.com/preview/root-video.mp4',
      'dropbox:///root-video.mp4',
      'dropbox',
    ],
    [
      'https://www.dropbox.com/home/test%20with%20spaces?preview=runyourway.mp4',
      'dropbox:///test with spaces/runyourway.mp4',
      'dropbox',
    ],
    [
      'https://www.dropbox.com/home?preview=video.mp4',
      'dropbox:///video.mp4',
      'dropbox',
    ],
    // Loom variants → canonical share URL
    [
      'https://loom.com/share/0281766fa2d04bb788eaf19e65135184',
      'https://www.loom.com/share/0281766fa2d04bb788eaf19e65135184',
      'loom',
    ],
    [
      'https://www.loom.com/embed/0281766fa2d04bb788eaf19e65135184',
      'https://www.loom.com/share/0281766fa2d04bb788eaf19e65135184',
      'loom',
    ],
  ];

  for (const [input, expectedUrl, expectedSource] of rewriteCases) {
    it(`rewrites ${input} → ${expectedUrl}`, () => {
      const result = normalizeVideoUrl(input);
      assert.equal(result.url, expectedUrl);
      assert.equal(result.source, expectedSource);
      assert.equal(result.rewritten, true);
    });
  }
});

describe('normalizeVideoUrl pass-throughs', () => {
  const passthroughCases: string[] = [
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://www.tiktok.com/@user/video/7123456789012345678',
    'https://vm.tiktok.com/ZM8abcdef/',
    'https://www.loom.com/share/0281766fa2d04bb788eaf19e65135184?sid=x',
    'https://us02web.zoom.us/j/123456789',
    'https://example.com/video.mp4',
    // dropbox /home without a preview file has nothing to rewrite to
    'https://www.dropbox.com/home/test%20with%20spaces',
    // malformed percent-encoding must pass through, not throw URIError
    'https://my-bucket.s3.amazonaws.com/bad%zzkey.mp4',
    'https://storage.googleapis.com/my-bucket/bad%zzkey.mp4',
    'https://www.dropbox.com/preview/bad%zzpath/video.mp4',
    // dropbox URIs pass through verbatim — never rewritten client-side
    'dropbox:///test/video.mp4',
    'dropbox://test/video.mp4',
    's3://my-bucket/video.mp4',
    'gs://my-bucket/video.mp4',
    'gdrive://file/abc',
    'grain://recording/abc',
    'cloudglue://files/123e4567-e89b-12d3-a456-426614174000',
    'not a url',
  ];

  for (const url of passthroughCases) {
    it(`passes through ${url}`, () => {
      const result = normalizeVideoUrl(url);
      assert.equal(result.url, url);
      assert.equal(result.rewritten, false);
    });
  }
});

describe('normalizeVideoUrl warnings', () => {
  it('warns on www.dropbox.com share links (scl/fi form)', () => {
    const result = normalizeVideoUrl(
      'https://www.dropbox.com/scl/fi/r85h2r4d9s13la63r5pzf/video.mp4?rlkey=x&dl=0',
    );
    assert.equal(result.source, 'http');
    assert.equal(result.warnings.length, 1);
    assert.match(result.warnings[0], /syncFile/);
  });

  it('warns on legacy /s/ dropbox share links', () => {
    const result = normalizeVideoUrl(
      'https://www.dropbox.com/s/abc123/video.mp4?dl=0',
    );
    assert.equal(result.warnings.length, 1);
  });

  it('warns on non-/1/view dl.dropboxusercontent.com URLs', () => {
    const result = normalizeVideoUrl(
      'https://dl.dropboxusercontent.com/scl/fi/r85h2r4d9s13la63r5pzf/video.mp4?rlkey=x',
    );
    assert.equal(result.source, 'dropbox');
    assert.equal(result.warnings.length, 1);
  });

  it('does not warn on /1/view dl.dropboxusercontent.com URLs', () => {
    const result = normalizeVideoUrl(
      'https://dl.dropboxusercontent.com/1/view/abc/test/video.mp4',
    );
    assert.equal(result.source, 'dropbox');
    assert.equal(result.warnings.length, 0);
  });

  it('warns on zoom.us/rec/ recording links', () => {
    const result = normalizeVideoUrl('https://us02web.zoom.us/rec/share/abc');
    assert.equal(result.source, 'http');
    assert.equal(result.warnings.length, 1);
    assert.match(result.warnings[0], /zoom/i);
  });

  it('produces no warnings for clean URLs', () => {
    assert.equal(
      normalizeVideoUrl('https://example.com/video.mp4').warnings.length,
      0,
    );
  });
});

describe('CONNECTOR_SYNC_URI_GRAMMAR', () => {
  it('covers all connector types', () => {
    assert.deepEqual(
      Object.keys(CONNECTOR_SYNC_URI_GRAMMAR).sort(),
      ['dropbox', 'gcs', 'gong', 'google-drive', 'grain', 'recall', 's3', 'zoom'].sort(),
    );
  });
});
