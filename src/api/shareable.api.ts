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
    return this.api.listShareableAssets({ queries: data });
  }

  /**
   * Create a shareable asset for a file or file segment.
   *
   * `link_preview` controls rich Open Graph metadata for unfurl bots (Slack,
   * iMessage, etc.) and only affects **private** shares: `'none'` (the API
   * default) emits no preview metadata, `'full'` emits title, description,
   * and thumbnail tags. Public shares always emit full metadata regardless.
   */
  async createShareableAsset(data: {
    file_id: string;
    file_segment_id?: string;
    title?: string;
    description?: string;
    metadata?: Record<string, unknown>;
    visibility?: 'public' | 'private';
    link_preview?: 'none' | 'full';
  }) {
    return this.api.createShareableAsset(data);
  }

  async getShareableAsset(id: string) {
    return this.api.getShareableAsset({
      params: { id },
    });
  }

  /**
   * Update a shareable asset's presentation fields.
   *
   * `link_preview` toggles rich Open Graph metadata for unfurl bots on
   * **private** shares (`'none'` or `'full'`); public shares always emit full
   * metadata. Note `visibility` cannot be changed after creation.
   */
  async updateShareableAsset(
    id: string,
    data: {
      title?: string;
      description?: string;
      metadata?: Record<string, unknown>;
      link_preview?: 'none' | 'full';
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
    return this.api.listShareableAssets({
      queries: { file_id: fileId, ...queries },
    });
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
    return this.api.listShareableAssets({
      queries: { file_id: fileId, file_segment_id: segmentId, ...queries },
    });
  }
}
