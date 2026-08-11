import { ShareApi } from '../../generated';

export class EnhancedShareableApi {
  constructor(private readonly api: typeof ShareApi) {}

  async listShareableAssets(data: {
    limit?: number;
    offset?: number;
    createdBefore?: string;
    createdAfter?: string;
    fileId?: string;
    fileSegmentId?: string;
    visibility?: 'public' | 'private';
  }) {
    return this.api.listShareableAssets({
      queries: {
        limit: data.limit,
        offset: data.offset,
        created_before: data.createdBefore,
        created_after: data.createdAfter,
        file_id: data.fileId,
        file_segment_id: data.fileSegmentId,
        visibility: data.visibility,
      },
    });
  }

  /**
   * Create a shareable asset for a file or file segment.
   *
   * `link_preview` controls rich Open Graph metadata for unfurl bots (Slack,
   * iMessage, etc.) and only affects **private** shares: `'none'` (the API
   * default) emits no preview metadata, `'full'` emits title, description,
   * and thumbnail tags, and `'player'` additionally lets the share play
   * inline when its link is unfurled by the Cloudglue Slack app — anyone who
   * can see the Slack message can play it. Public shares always emit full
   * metadata (and unfurl playable where the Slack app is installed)
   * regardless.
   */
  async createShareableAsset(data: {
    file_id: string;
    file_segment_id?: string;
    title?: string;
    description?: string;
    metadata?: Record<string, unknown>;
    visibility?: 'public' | 'private';
    link_preview?: 'none' | 'full' | 'player';
  }) {
    return this.api.createShareableAsset(data);
  }

  /**
   * Get a shareable asset.
   *
   * Optionally pass an instant-clip window: `clip_start`/`clip_end` are
   * seconds, must be provided together, with `clip_end > clip_start`. When
   * set, the returned `stream_url` plays only that window — the share itself
   * is untouched, and reads without the params keep returning the
   * full-asset stream.
   */
  async getShareableAsset(
    id: string,
    queries?: { clip_start?: number; clip_end?: number },
  ) {
    return this.api.getShareableAsset({
      params: { id },
      queries,
    });
  }

  /**
   * Update a shareable asset's presentation fields.
   *
   * `link_preview` toggles rich Open Graph metadata for unfurl bots on
   * **private** shares: `'none'`, `'full'`, or `'player'` (playable inline
   * when unfurled by the Cloudglue Slack app; downgrading from `'player'`
   * revokes playback in already-posted unfurls). Public shares always emit
   * full metadata. Note `visibility` cannot be changed after creation.
   */
  async updateShareableAsset(
    id: string,
    data: {
      title?: string;
      description?: string;
      metadata?: Record<string, unknown>;
      link_preview?: 'none' | 'full' | 'player';
    },
  ) {
    return this.api.updateShareableAsset(data, {
      params: { id },
    });
  }

  async deleteShareableAsset(id: string) {
    return this.api.deleteShareableAsset(undefined, {
      params: { id },
    });
  }

  async getFileShareableAsset(
    fileId: string,
    queries: {
      limit?: number;
      offset?: number;
      createdBefore?: string;
      createdAfter?: string;
      visibility?: 'public' | 'private';
    },
  ) {
    return this.listShareableAssets({ ...queries, fileId });
  }

  async getFileSegmentShareableAsset(
    fileId: string,
    segmentId: string,
    queries: {
      limit?: number;
      offset?: number;
      createdBefore?: string;
      createdAfter?: string;
      visibility?: 'public' | 'private';
    },
  ) {
    return this.listShareableAssets({
      ...queries,
      fileId,
      fileSegmentId: segmentId,
    });
  }
}
