import { FilesApi } from '../../generated';
import {
  FrameExtractionConfig,
  ListFilesParams,
  SegmentationConfig,
  ThumbnailType,
  UpdateFileParams,
  WaitForReadyOptions,
} from '../types';
import { CloudglueError } from '../error';
import { isDropboxFileShareLink, normalizeVideoUrl } from '../url-utils';

import type { AxiosResponse } from 'axios';

type UploadFileParams = {
  file: globalThis.File;
  metadata?: Record<string, any>;
  /**
   * If enabled, the file will be segmented and thumbnails will be generated for each segment for the default segmentation config.
   */
  enable_segment_thumbnails?: boolean;
};

type SyncFromUrlParams = {
  /** Key-value metadata to attach to the created file */
  metadata?: Record<string, any>;
  /**
   * Whether to generate per-segment thumbnails for the file. Defaults to
   * true server-side, matching file upload.
   */
  enable_segment_thumbnails?: boolean;
};

/**
 * URL sources `POST /files/sync` resolves through a data connector instead of
 * fetching anonymously. `dropbox` is absent because it splits by URL form:
 * https file share links are accepted here (when public), while `dropbox://`
 * URIs and `dl.dropboxusercontent.com` URLs are connector-only — see the
 * dropbox-specific check in the guard.
 */
const CONNECTOR_ONLY_SOURCES = new Set([
  's3',
  'gcs',
  'google-drive',
  'zoom',
  'gong',
  'recall',
  'grain',
]);

const isHttpUrl = (url: string) => /^https?:\/\//i.test(url);

function isDriveUcLink(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname === 'drive.google.com' &&
      /^\/uc\/?$/.test(parsed.pathname)
    );
  } catch {
    return false;
  }
}

export class EnhancedFilesApi {
  constructor(private readonly api: typeof FilesApi) {}

  async listFiles(params: ListFilesParams = {}) {
    const { filter, ...otherParams } = params;

    // Convert filter object to JSON string if provided
    const queries: any = { ...otherParams };
    if (filter) {
      try {
        queries.filter = JSON.stringify(filter);
      } catch (error) {
        throw new CloudglueError(
          `Failed to serialize filter object: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    return this.api.listFiles({ queries });
  }

  async uploadFile(params: UploadFileParams): Promise<AxiosResponse> {
    // File uploads require special handling for multipart/form-data that the generated Zodios client doesn't handle automatically.
    // We need to:
    // 1. Create a FormData object and append the file with the correct field name
    // 2. JSON stringify the metadata if present
    // 3. Set the correct Content-Type header
    // This is why we use axios directly instead of the generated client method.

    const formData = new FormData();
    formData.append('file', params.file);

    // Add metadata if provided
    if (params.metadata) {
      try {
        formData.append('metadata', JSON.stringify(params.metadata));
      } catch (error) {
        throw new CloudglueError(
          `Failed to serialize metadata object: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }
    if (params.enable_segment_thumbnails !== undefined) {
      formData.append(
        'enable_segment_thumbnails',
        params.enable_segment_thumbnails.toString(),
      );
    }

    // Use axios directly to bypass Zodios validation
    return this.api.axios({
      method: 'post',
      url: '/files',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Materialize a publicly accessible URL into a Cloudglue file without a
   * data connector or a collection. Accepts direct http(s) video/audio file
   * URLs (e.g. `.mp4`), public Dropbox share links, TikTok video URLs, and
   * Loom share URLs. Idempotent: syncing the same URL returns the existing
   * file. The returned file may still be processing — chain
   * `files.waitForReady(file.id)` to wait for it.
   *
   * Non-canonical Loom links are rewritten client-side to the form the API
   * accepts. URLs the API cannot ingest here are rejected before the request
   * is sent: YouTube URLs (collection-only — use
   * `collections.addMediaByUrl()`) and connector-native URLs (`s3://`,
   * `gs://`, `gdrive://`, Zoom/Grain links, ... — use
   * `dataConnectors.syncFile()`/`syncUrl()`).
   *
   * @param url - Publicly accessible URL to sync
   * @param params - Optional metadata and thumbnail settings
   * @returns The resulting Cloudglue file
   * @throws {CloudglueError} If the URL is not ingestible by this endpoint
   */
  async syncFromUrl(url: string, params: SyncFromUrlParams = {}) {
    const normalized = normalizeVideoUrl(url);

    if (!normalized.source) {
      throw new CloudglueError(`'${url}' is not a valid http(s) URL.`, 400);
    }
    if (normalized.source === 'youtube') {
      throw new CloudglueError(
        `YouTube URLs cannot be synced into a standalone file. Add the video to a collection with collections.addMediaByUrl() instead.`,
        400,
      );
    }
    if (normalized.source === 'video') {
      throw new CloudglueError(
        `'${url}' already references a Cloudglue file — use files.getFile() with its file ID instead.`,
        400,
      );
    }

    // Google Drive `uc?id=` links rewrite to gdrive:// for connector sync,
    // but the server keeps them on the anonymous http path here — send the
    // original URL and skip the connector checks.
    const driveUc = isDriveUcLink(url);
    if (!driveUc) {
      if (
        !isHttpUrl(normalized.url) ||
        CONNECTOR_ONLY_SOURCES.has(normalized.source) ||
        (normalized.source === 'dropbox' &&
          !isDropboxFileShareLink(normalized.url))
      ) {
        throw new CloudglueError(
          `URL '${url}' resolves through a data connector ('${normalized.source}') and cannot be synced anonymously. Use dataConnectors.syncFile(connectorId, url) or dataConnectors.syncUrl(url) instead.` +
            (normalized.warnings.length
              ? '\n' + normalized.warnings.join('\n')
              : ''),
          400,
        );
      }
    }

    const body: {
      url: string;
      metadata?: Record<string, any>;
      enable_segment_thumbnails?: boolean;
    } = { url: driveUc ? url : normalized.url };
    if (params.metadata !== undefined) {
      body.metadata = params.metadata;
    }
    if (params.enable_segment_thumbnails !== undefined) {
      body.enable_segment_thumbnails = params.enable_segment_thumbnails;
    }
    return this.api.syncFileFromUrl(body);
  }

  async getFile(fileId: string) {
    return this.api.getFile({ params: { file_id: fileId } });
  }

  async deleteFile(fileId: string) {
    return this.api.deleteFile(undefined, {
      params: { file_id: fileId },
    });
  }

  async updateFile(fileId: string, params: UpdateFileParams) {
    return this.api.updateFile(
      { ...params, filename: params.filename ?? undefined },
      { params: { file_id: fileId } },
    );
  }

  async listFileSegmentations(
    fileId: string,
    params: { limit?: number; offset?: number } = {},
  ) {
    return this.api.listFileSegmentations({
      params: { file_id: fileId },
      queries: params,
    });
  }

  /**
   * Get thumbnails for a file. If a segmentationId is provided, the thumbnails will be for a specific segmentation.
   * @param fileId - The ID of the file
   * @param params - Optional parameters
   * @returns The thumbnails for the file
   */
  async getFileThumbnails(
    fileId: string,
    params: {
      limit?: number;
      offset?: number;
      isDefault?: boolean;
      segmentationId?: string;
      type?: ThumbnailType[];
    },
  ) {
    return this.api.getThumbnails({
      params: { file_id: fileId },
      queries: {
        ...params,
        is_default: params.isDefault ?? false,
        type: params.type?.join(','),
      },
    });
  }

  async createFileSegmentation(fileId: string, params: SegmentationConfig) {
    return this.api.createFileSegmentation(params, {
      params: { file_id: fileId },
      body: params,
    } as any);
  }

  async createFileFrameExtraction(
    fileId: string,
    params: FrameExtractionConfig,
  ) {
    return this.api.createFileFrameExtraction(params, {
      params: { file_id: fileId },
    });
  }

  async getFileSegment(fileId: string, segmentId: string) {
    return this.api.getFileSegment({
      params: { file_id: fileId, segment_id: segmentId },
    });
  }

  async updateFileSegment(
    fileId: string,
    segmentId: string,
    body: { metadata?: Record<string, any> },
  ) {
    return this.api.updateFileSegment(body, {
      params: { file_id: fileId, segment_id: segmentId },
    });
  }

  async getFileTags(fileId: string) {
    return this.api.listFileTags({
      params: { file_id: fileId },
    });
  }

  async getFileSegmentTags(fileId: string, segmentId: string) {
    return this.api.listFileSegmentTags({
      params: { file_id: fileId, segment_id: segmentId },
    });
  }

  async listFileSegments(
    fileId: string,
    params: {
      limit?: number;
      offset?: number;
      startTimeAfter?: number;
      endTimeBefore?: number;
      minDuration?: number;
      maxDuration?: number;
    },
  ) {
    const { minDuration, maxDuration, startTimeAfter, endTimeBefore, ...rest } =
      params;
    return this.api.listFileSegments({
      params: { file_id: fileId },
      queries: {
        ...rest,
        start_time_after: startTimeAfter,
        end_time_before: endTimeBefore,
        min_duration: minDuration,
        max_duration: maxDuration,
      },
    });
  }

  /**
   * List all describe outputs for a specific file segment
   * @param fileId - The ID of the file
   * @param segmentId - The ID of the segment
   * @param params - Optional parameters for filtering and pagination
   * @returns List of describe outputs for the segment
   */
  async listFileSegmentDescribes(
    fileId: string,
    segmentId: string,
    params: {
      status?: string;
      response_format?: 'json' | 'markdown';
      include_data?: boolean;
      limit?: number;
      offset?: number;
    } = {},
  ) {
    return this.api.listFileSegmentDescribes({
      params: { file_id: fileId, segment_id: segmentId },
      queries: params,
    });
  }

  /**
   * Get a specific describe output for a file segment by job ID
   * @param fileId - The ID of the file
   * @param segmentId - The ID of the segment
   * @param jobId - The ID of the describe job
   * @param params - Optional parameters
   * @returns The describe output for the segment
   */
  async getFileSegmentDescribe(
    fileId: string,
    segmentId: string,
    jobId: string,
    params: {
      response_format?: 'json' | 'markdown';
    } = {},
  ) {
    return this.api.getFileSegmentDescribe({
      params: { file_id: fileId, segment_id: segmentId, job_id: jobId },
      queries: params,
    });
  }

  /**
   * Waits for a file to finish processing by polling the getFile endpoint until the file
   * reaches a terminal state (completed, failed, or not_applicable) or until maxAttempts is reached.
   *
   * @param fileId - The ID of the file to wait for
   * @param options - Optional configuration for polling behavior
   * @returns The final file object
   * @throws {CloudglueError} If the file fails to process or maxAttempts is reached
   */
  async waitForReady(fileId: string, options: WaitForReadyOptions = {}) {
    const { pollingInterval = 5000, maxAttempts = 36 } = options;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const file = await this.getFile(fileId);

      // If we've reached a terminal state, return the file
      if (['completed', 'failed', 'not_applicable'].includes(file.status)) {
        if (file.status === 'failed') {
          throw new CloudglueError(`File processing failed: ${fileId}`);
        }
        return file;
      }

      // Wait for the polling interval before trying again
      await new Promise((resolve) => setTimeout(resolve, pollingInterval));
      attempts++;
    }

    throw new CloudglueError(
      `Timeout waiting for file ${fileId} to process after ${maxAttempts} attempts`,
    );
  }
}
