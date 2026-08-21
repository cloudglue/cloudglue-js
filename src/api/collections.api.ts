import { CollectionsApi } from '../../generated';
import { Filter, Modalities, SegmentationConfig } from '../types';
import { ThumbnailsConfig } from '../../generated/common';
import { CloudglueError } from '../error';
import { WaitForReadyOptions } from '../types';
import { schemas as collectionsSchemas } from '../../generated/Collections';
import z from 'zod';

type PaginationParams = {
  limit?: number;
  offset?: number;
};

type OrderParams = {
  order?: 'added_at' | 'filename';
  sort?: 'asc' | 'desc';
};

type AddedFilterParams = {
  added_before?: string;
  added_after?: string;
};

type ListCollectionEntitiesParams = AddedFilterParams &
  OrderParams &
  PaginationParams;

type ListCollectionMediaDescriptionsParams = {
  response_format?: 'json' | 'markdown';
  modalities?: Modalities[];
  /** Include each file's `metadata` and `source_metadata` on the `file` object */
  include_metadata?: boolean;
} & AddedFilterParams &
  OrderParams &
  PaginationParams;

type ListCollectionParams = {
  collection_type?:
    | 'entities'
    | 'rich-transcripts'
    | 'media-descriptions'
    | 'face-analysis'
    | 'metadata'
    | 'moments';
  order?: 'name' | 'created_at';
} & PaginationParams;

type ListCollectionMomentsParams = {
  /** Narrow to one criterion by name */
  criterion_name?: string;
  /** Narrow to one criterion attachment */
  attachment_id?: string;
  /** Narrow to one file */
  file_id?: string;
  /** Drop moments whose criterion score is below this value */
  min_score?: number;
  /**
   * `position` (the API default) sorts by `file_id`, then `start_time`.
   * `criterion_score` and `rank_score` require a single-criterion filter
   * (`criterion_name` or `attachment_id`).
   */
  sort?: 'position' | 'criterion_score' | 'rank_score';
  limit?: number;
  cursor?: string;
};

type ListCollectionMomentFindingsParams = {
  criterion_name?: string;
  file_id?: string;
  /** Narrow to one finding kind */
  kind?: 'absence' | 'observation';
  limit?: number;
  cursor?: string;
};

type ListCollectionVideosParams = {
  status?: 'pending' | 'processing' | 'completed' | 'failed' | 'not_applicable';
  filter?: Filter;
} & OrderParams &
  PaginationParams &
  AddedFilterParams;

export class EnhancedCollectionsApi {
  constructor(private readonly api: typeof CollectionsApi) {}

  async listCollections(params: ListCollectionParams) {
    return this.api.listCollections({ queries: params });
  }

  async createCollection(
    params: z.infer<typeof collectionsSchemas.NewCollection>,
  ) {
    return this.api.createCollection(params);
  }

  async getCollection(collectionId: string) {
    return this.api.getCollection({
      params: { collection_id: collectionId },
    });
  }

  async deleteCollection(collectionId: string) {
    return this.api.deleteCollection(undefined, {
      params: { collection_id: collectionId },
    });
  }

  async updateCollection(
    collectionId: string,
    params: {
      name?: string;
      description?: string;
    },
  ) {
    return this.api.updateCollection(params, {
      params: { collection_id: collectionId },
    });
  }

  /**
   * 
   * @deprecated Use addMediaByUrl instead
   */
  async addVideoByUrl({
    collectionId,
    url,
    params,
  }: {
    collectionId: string;
    url: string;
    params: z.infer<typeof collectionsSchemas.AddCollectionFile>;
  }) {
    return this.api.addMedia(
      { url, ...params },
      { params: { collection_id: collectionId, ...params } },
    );
  }

  async addMediaByUrl({
    collectionId,
    url,
    params,
  }: {
    collectionId: string;
    url: string;
    params: z.infer<typeof collectionsSchemas.AddCollectionFile>;
  }) {
    return this.api.addMedia(
      { url, ...params },
      { params: { collection_id: collectionId, ...params } },
    );
  }

  /**
   * @deprecated Use addMedia instead
   */
  async addVideo(
    collectionId: string,
    fileId: string,
    params: z.infer<typeof collectionsSchemas.AddCollectionFile>,
  ) {
    return this.api.addMedia(
      { file_id: fileId, ...params },
      { params: { collection_id: collectionId, ...params } },
    );
  }

  async addMedia(
    collectionId: string,
    fileId: string,
    params: z.infer<typeof collectionsSchemas.AddCollectionFile>,
  ) {
    return this.api.addMedia(
      { file_id: fileId, ...params },
      { params: { collection_id: collectionId, ...params } },
    );
  }


  async listVideos(
    collectionId: string,
    params: ListCollectionVideosParams = {},
  ) {
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

    return this.api.listVideos({
      params: { collection_id: collectionId },
      queries,
    });
  }

  async getVideo(collectionId: string, fileId: string) {
    return this.api.getVideo({
      params: { collection_id: collectionId, file_id: fileId },
    });
  }

  async deleteVideo(collectionId: string, fileId: string) {
    return this.api.deleteVideo(undefined, {
      params: { collection_id: collectionId, file_id: fileId },
    });
  }

  async getEntities(
    collectionId: string,
    fileId: string,
    params: { limit?: number; offset?: number; include_thumbnails?: boolean; include_chapters?: boolean; include_shots?: boolean } = {},
  ) {
    return this.api.getEntities({
      params: { collection_id: collectionId, file_id: fileId },
      queries: params,
    });
  }

  async getTranscripts(
    collectionId: string,
    fileId: string,
    options: {
      limit?: number;
      offset?: number;
      response_format?: 'markdown' | 'json';
      start_time_seconds?: number;
      end_time_seconds?: number;
      modalities?: Modalities[];
      include_word_timestamps?: boolean;
      /** Include the file's `metadata` and `source_metadata` on the `file` object */
      include_metadata?: boolean;
    } = {},
  ) {
    return this.api.getTranscripts({
      params: { collection_id: collectionId, file_id: fileId },
      queries: { ...options },
    } as any);
  }

  async listEntities(
    collectionId: string,
    params: ListCollectionEntitiesParams = {},
  ) {
    return this.api.listCollectionEntities({
      params: { collection_id: collectionId },
      queries: params,
    });
  }

  async listRichTranscripts(
    collectionId: string,
    params: ListCollectionMediaDescriptionsParams = {},
  ) {
    return this.api.listCollectionRichTranscripts({
      params: { collection_id: collectionId },
      queries: params,
    });
  }

  async getMediaDescriptions(
    collectionId: string,
    fileId: string,
    options: {
      response_format?: 'markdown' | 'json';
      start_time_seconds?: number;
      end_time_seconds?: number;
      include_thumbnails?: boolean;
      include_word_timestamps?: boolean;
      include_chapters?: boolean;
      include_shots?: boolean;
      /** Include the file's `metadata` and `source_metadata` on the `file` object */
      include_metadata?: boolean;
    } = {},
  ) {
    return this.api.getMediaDescriptions({
      params: { collection_id: collectionId, file_id: fileId },
      queries: { ...options },
    } as any);
  }

  async getFaceDetections(
    collectionId: string,
    fileId: string,
    params: { limit?: number; offset?: number } = {},
  ) {
    return this.api.getFaceDetections({
      params: { collection_id: collectionId, file_id: fileId },
      queries: params,
    });
  }

  async listMediaDescriptions(
    collectionId: string,
    params: ListCollectionMediaDescriptionsParams = {},
  ) {
    return this.api.listCollectionMediaDescriptions({
      params: { collection_id: collectionId },
      queries: params,
    });
  }

  /**
   * Waits for a video in a collection to be ready by polling the getVideo endpoint until
   * the video reaches a terminal state (completed, failed, or not_applicable) or until maxAttempts is reached.
   *
   * @param collectionId - The ID of the collection containing the video
   * @param fileId - The ID of the video file to wait for
   * @param options - Optional configuration for polling behavior
   * @returns The final collection file object
   * @throws {CloudglueError} If the video fails to process or maxAttempts is reached
   */
  async waitForReady(
    collectionId: string,
    fileId: string,
    options: WaitForReadyOptions = {},
  ) {
    const { pollingInterval = 5000, maxAttempts = 36 } = options;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const video = await this.getVideo(collectionId, fileId);

      // If we've reached a terminal state, return the video
      if (['completed', 'failed', 'not_applicable'].includes(video.status)) {
        if (video.status === 'failed') {
          throw new CloudglueError(
            `Video processing failed: ${fileId} in collection ${collectionId}`,
          );
        }
        return video;
      }

      // Wait for the polling interval before trying again
      await new Promise((resolve) => setTimeout(resolve, pollingInterval));
      attempts++;
    }

    throw new CloudglueError(
      `Timeout waiting for video ${fileId} in collection ${collectionId} to process after ${maxAttempts} attempts`,
    );
  }

  /**
   * List moments across a moments collection's current members, with an
   * exact total.
   *
   * Removing a file from the collection drops its moments from this
   * enumeration; the underlying find-moments runs persist as job history.
   *
   * @param collectionId - The ID of the moments collection
   * @param params - Filters, sort, and cursor pagination
   */
  async listCollectionMoments(
    collectionId: string,
    params: ListCollectionMomentsParams = {},
  ) {
    return this.api.listCollectionMoments({
      params: { collection_id: collectionId },
      queries: params,
    });
  }

  /**
   * List findings (the non-temporal counterpart to moments) across a
   * moments collection's current members.
   *
   * @param collectionId - The ID of the moments collection
   * @param params - Filters and cursor pagination
   */
  async listCollectionMomentFindings(
    collectionId: string,
    params: ListCollectionMomentFindingsParams = {},
  ) {
    return this.api.listCollectionMomentFindings({
      params: { collection_id: collectionId },
      queries: params,
    });
  }

  /**
   * Attach a criterion to a moments collection and backfill existing
   * members.
   *
   * The attach response charges nothing (cost header 0); per-file runs
   * charge as they execute, and a matching prior run satisfies a pair at no
   * extra execution. Track progress with the attachment's `backfill_status`
   * and `files_total` / `files_completed` / `files_failed` counters, read
   * back from `getCollection`'s `moments_config`.
   *
   * @param collectionId - The ID of the moments collection
   * @param params - The criterion plus optional per-attachment run options
   * @returns The criterion attachment
   */
  async createCollectionMomentCriterion(
    collectionId: string,
    params: z.infer<typeof collectionsSchemas.NewMomentCriterionAttachment>,
  ) {
    return this.api.createCollectionMomentCriterion(params, {
      params: { collection_id: collectionId },
    });
  }

  /**
   * Detach a criterion from a moments collection. Its moments and findings
   * leave collection enumeration; the underlying runs persist as job
   * history.
   *
   * @param collectionId - The ID of the moments collection
   * @param attachmentId - The ID of the criterion attachment
   */
  async deleteCollectionMomentCriterion(
    collectionId: string,
    attachmentId: string,
  ) {
    return this.api.deleteCollectionMomentCriterion(undefined, {
      params: { collection_id: collectionId, attachment_id: attachmentId },
    });
  }
}
