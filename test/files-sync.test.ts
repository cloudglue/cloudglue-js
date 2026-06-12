import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { EnhancedFilesApi } from '../src/api/files.api';
import { CloudglueError } from '../src/error';

function makeApi() {
  const calls: Array<Record<string, unknown>> = [];
  const api = {
    syncFileFromUrl: async (body: Record<string, unknown>) => {
      calls.push(body);
      return { id: 'file_1', object: 'file' };
    },
  };
  return { api: api as any, calls };
}

describe('files.syncFromUrl', () => {
  it('sends direct media URLs unchanged', async () => {
    const { api, calls } = makeApi();
    const client = new EnhancedFilesApi(api);

    await client.syncFromUrl('https://example.com/video.mp4');

    assert.deepEqual(calls, [{ url: 'https://example.com/video.mp4' }]);
  });

  it('includes metadata and enable_segment_thumbnails only when provided', async () => {
    const { api, calls } = makeApi();
    const client = new EnhancedFilesApi(api);

    await client.syncFromUrl('https://example.com/video.mp4', {
      metadata: { project: 'demo' },
      enable_segment_thumbnails: false,
    });

    assert.deepEqual(calls, [
      {
        url: 'https://example.com/video.mp4',
        metadata: { project: 'demo' },
        enable_segment_thumbnails: false,
      },
    ]);
  });

  it('canonicalizes loom links before sending', async () => {
    const { api, calls } = makeApi();
    const client = new EnhancedFilesApi(api);

    await client.syncFromUrl(
      'https://loom.com/share/0281766fa2d04bb788eaf19e65135184',
    );

    assert.deepEqual(calls, [
      { url: 'https://www.loom.com/share/0281766fa2d04bb788eaf19e65135184' },
    ]);
  });

  it('sends tiktok URLs unchanged', async () => {
    const { api, calls } = makeApi();
    const client = new EnhancedFilesApi(api);

    const url = 'https://www.tiktok.com/@user/video/7123456789012345678';
    await client.syncFromUrl(url);

    assert.deepEqual(calls, [{ url }]);
  });

  it('sends public dropbox file share links unchanged', async () => {
    const { api, calls } = makeApi();
    const client = new EnhancedFilesApi(api);

    const url = 'https://www.dropbox.com/scl/fi/abc/video.mp4?rlkey=x&dl=0';
    await client.syncFromUrl(url);

    assert.deepEqual(calls, [{ url }]);
  });

  it('sends drive uc?id= links unchanged (anonymous http path)', async () => {
    const { api, calls } = makeApi();
    const client = new EnhancedFilesApi(api);

    const url = 'https://drive.google.com/uc?export=download&id=1a2bC3dE4f';
    await client.syncFromUrl(url);

    assert.deepEqual(calls, [{ url }]);
  });

  it('rejects YouTube URLs with a pointer to collections', async () => {
    const { api, calls } = makeApi();
    const client = new EnhancedFilesApi(api);

    await assert.rejects(
      client.syncFromUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
      (err: unknown) =>
        err instanceof CloudglueError && /addMediaByUrl/.test(err.message),
    );
    assert.equal(calls.length, 0);
  });

  it('rejects connector-native URLs with a pointer to dataConnectors', async () => {
    const { api, calls } = makeApi();
    const client = new EnhancedFilesApi(api);

    for (const url of [
      's3://my-bucket/video.mp4',
      'gs://my-bucket/video.mp4',
      'gdrive://file/abc',
      'dropbox:///test/video.mp4',
      'grain://recording/abc-123',
      // https forms that resolve through a connector
      'https://us02web.zoom.us/j/123456789',
      'https://us02web.zoom.us/rec/share/abcdef',
      'https://drive.google.com/file/d/1a2bC3dE4f/view',
      'https://grain.com/share/recording/abc-123/token',
      'https://www.dropbox.com/preview/folder/video.mp4',
      // dropbox CDN URLs are connector-only, unlike dropbox.com share links
      'https://dl.dropboxusercontent.com/1/view/abc/test/video.mp4',
    ]) {
      await assert.rejects(
        client.syncFromUrl(url),
        (err: unknown) =>
          err instanceof CloudglueError &&
          /dataConnectors\.sync/.test(err.message),
      );
    }
    assert.equal(calls.length, 0);
  });

  it('rejects cloudglue file URIs', async () => {
    const { api, calls } = makeApi();
    const client = new EnhancedFilesApi(api);

    await assert.rejects(
      client.syncFromUrl(
        'cloudglue://files/123e4567-e89b-12d3-a456-426614174000',
      ),
      (err: unknown) =>
        err instanceof CloudglueError && /already references/.test(err.message),
    );
    assert.equal(calls.length, 0);
  });

  it('rejects non-URL input', async () => {
    const { api, calls } = makeApi();
    const client = new EnhancedFilesApi(api);

    await assert.rejects(
      client.syncFromUrl('not a url'),
      (err: unknown) =>
        err instanceof CloudglueError && /not a valid/.test(err.message),
    );
    assert.equal(calls.length, 0);
  });
});
