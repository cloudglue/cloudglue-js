import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { EnhancedDataConnectorsApi } from '../src/api/data-connectors.api';
import { CloudglueError } from '../src/error';

function makeApi(
  connectors: Array<{ id: string; type: string; created_at: number }>,
) {
  const calls: Array<{ url: string; connectorId: string }> = [];
  const api = {
    listDataConnectors: async () => ({ object: 'list', data: connectors }),
    syncDataConnectorFile: async (
      body: { url: string },
      config: { params: { id: string } },
    ) => {
      calls.push({ url: body.url, connectorId: config.params.id });
      return { id: 'file_1' };
    },
  };
  return { api: api as any, calls };
}

describe('dataConnectors.syncUrl', () => {
  it('routes to the oldest connector of the matching type', async () => {
    const { api, calls } = makeApi([
      { id: 'gdrive_new', type: 'google-drive', created_at: 2000 },
      { id: 'gdrive_old', type: 'google-drive', created_at: 1000 },
      { id: 'dropbox_1', type: 'dropbox', created_at: 500 },
    ]);
    const client = new EnhancedDataConnectorsApi(api);

    await client.syncUrl('gdrive://file/abc123');

    assert.deepEqual(calls, [
      { url: 'gdrive://file/abc123', connectorId: 'gdrive_old' },
    ]);
  });

  it('rewrites share links before resolving the connector', async () => {
    const { api, calls } = makeApi([
      { id: 'gdrive_1', type: 'google-drive', created_at: 1000 },
    ]);
    const client = new EnhancedDataConnectorsApi(api);

    await client.syncUrl(
      'https://drive.google.com/file/d/abc123/view?usp=sharing',
    );

    assert.deepEqual(calls, [
      { url: 'gdrive://file/abc123', connectorId: 'gdrive_1' },
    ]);
  });

  it('rejects URLs with no matching connector on the account', async () => {
    const { api } = makeApi([
      { id: 'dropbox_1', type: 'dropbox', created_at: 500 },
    ]);
    const client = new EnhancedDataConnectorsApi(api);

    await assert.rejects(
      client.syncUrl('s3://bucket/key.mp4'),
      (err: unknown) =>
        err instanceof CloudglueError &&
        /No 's3' data connector/.test(err.message),
    );
  });

  it('rejects non-connector URLs client-side without a request', async () => {
    const { api, calls } = makeApi([
      { id: 'dropbox_1', type: 'dropbox', created_at: 500 },
    ]);
    const client = new EnhancedDataConnectorsApi(api);

    for (const url of [
      'https://example.com/video.mp4',
      'https://www.tiktok.com/@user/video/7123456789012345678',
      'https://www.dropbox.com/scl/fo/abc/folder?dl=0',
    ]) {
      await assert.rejects(
        client.syncUrl(url),
        (err: unknown) =>
          err instanceof CloudglueError &&
          /cannot be synced through a data connector/.test(err.message) &&
          /files\.syncFromUrl/.test(err.message),
      );
    }
    assert.equal(calls.length, 0);
  });

  it('points YouTube URLs at collections.addMediaByUrl', async () => {
    const { api, calls } = makeApi([]);
    const client = new EnhancedDataConnectorsApi(api);

    await assert.rejects(
      client.syncUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
      (err: unknown) =>
        err instanceof CloudglueError && /addMediaByUrl/.test(err.message),
    );
    assert.equal(calls.length, 0);
  });

  it('routes dropbox file share links to a dropbox connector verbatim', async () => {
    const { api, calls } = makeApi([
      { id: 'dropbox_1', type: 'dropbox', created_at: 500 },
    ]);
    const client = new EnhancedDataConnectorsApi(api);

    const url = 'https://www.dropbox.com/scl/fi/abc/video.mp4?rlkey=x&dl=0';
    await client.syncUrl(url);

    assert.deepEqual(calls, [{ url, connectorId: 'dropbox_1' }]);
  });

  it('routes zoom rec/share links to a zoom connector verbatim', async () => {
    const { api, calls } = makeApi([
      { id: 'zoom_1', type: 'zoom', created_at: 500 },
    ]);
    const client = new EnhancedDataConnectorsApi(api);

    const url = 'https://us02web.zoom.us/rec/share/abcdef';
    await client.syncUrl(url);

    assert.deepEqual(calls, [{ url, connectorId: 'zoom_1' }]);
  });
});

describe('dataConnectors.syncFile', () => {
  it('normalizes the url and uses the given connector', async () => {
    const { api, calls } = makeApi([]);
    const client = new EnhancedDataConnectorsApi(api);

    await client.syncFile(
      'conn_1',
      'https://my-bucket.s3.us-west-2.amazonaws.com/folder/video.mp4',
    );

    assert.deepEqual(calls, [
      { url: 's3://my-bucket/folder/video.mp4', connectorId: 'conn_1' },
    ]);
  });

  it('passes connector URIs through verbatim', async () => {
    const { api, calls } = makeApi([]);
    const client = new EnhancedDataConnectorsApi(api);

    await client.syncFile('conn_1', 'dropbox:///test/video.mp4');

    assert.deepEqual(calls, [
      { url: 'dropbox:///test/video.mp4', connectorId: 'conn_1' },
    ]);
  });
});
