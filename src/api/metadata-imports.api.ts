import { Metadata_ImportsApi } from '../../generated';
import { schemas } from '../../generated/Metadata_Imports';
import z from 'zod';

/**
 * Bulk metadata imports for metadata collections.
 *
 * A metadata import is a saved definition that lists a data connector's
 * source files and imports each one's source metadata into a metadata
 * collection as collection files — no media download or processing, and
 * runs consume no credits.
 */
export class EnhancedMetadataImportsApi {
  constructor(private readonly api: typeof Metadata_ImportsApi) {}

  /**
   * Create a bulk metadata import for a metadata collection.
   *
   * By default the first run starts immediately (`start: false` saves the
   * definition only). The response's `latest_run` is the triggered run; it
   * is null when `start` is false or when another import's run currently
   * holds the one-active-run-per-collection slot, and has status `failed`
   * when the run could not be enqueued. Runs page the connector with the
   * account's default active API key and fail with a clear error when the
   * account has none.
   *
   * Filters are listing passes — `from`/`to` date window (YYYY-MM-DD, UTC),
   * `title_search`, `folder_id` (Google Drive only), `path` and `recursive`
   * (Dropbox only — `path` lists direct children, `recursive: 'true'` lists
   * the whole subtree under it), `team`/`meeting_type` (Grain only). Empty or
   * omitted means one unfiltered pass; overlapping passes are deduplicated.
   * `max_files` caps each run (a capped run never runs the delete-missing
   * sweep); `rate_limit` overrides the per-connector safe listing rate and is
   * clamped to a per-connector ceiling at run time.
   *
   * `enrich_metadata` (off by default) backfills source-metadata fields the
   * connector's list endpoint omits, after each index batch settles: Gong
   * parties + Call Spotlight content (batched — enriched docs are re-embedded
   * so the content is searchable) and Dropbox `media_info` duration and
   * dimensions (per-file). It is a no-op for other connectors, and costs
   * upstream API budget plus, for Gong, embedding work.
   *
   * @param collectionId - The ID of the metadata collection
   * @param params - The import definition (name + connector_id required)
   * @returns The import definition with its latest run inline
   */
  async createMetadataImport(
    collectionId: string,
    params: z.infer<typeof schemas.CreateMetadataImportRequest>,
  ) {
    return this.api.createMetadataImport(params, {
      params: { collection_id: collectionId },
    });
  }

  /**
   * List a collection's metadata imports, newest first, each with its
   * latest run inline.
   *
   * @param collectionId - The ID of the metadata collection
   * @param params - Pagination (limit default 50, max 100; offset)
   */
  async listMetadataImports(
    collectionId: string,
    params: { limit?: number; offset?: number } = {},
  ) {
    return this.api.listMetadataImports({
      params: { collection_id: collectionId },
      queries: params,
    });
  }

  /**
   * Get a metadata import definition with one page of its run history
   * (newest first).
   *
   * @param collectionId - The ID of the metadata collection
   * @param importId - The ID of the metadata import
   * @param params - Run-history pagination (limit default 20; offset)
   */
  async getMetadataImport(
    collectionId: string,
    importId: string,
    params: { limit?: number; offset?: number } = {},
  ) {
    return this.api.getMetadataImport({
      params: { collection_id: collectionId, import_id: importId },
      queries: params,
    });
  }

  /**
   * Delete a metadata import definition. Files the import brought into the
   * collection are not removed.
   *
   * @param collectionId - The ID of the metadata collection
   * @param importId - The ID of the metadata import
   */
  async deleteMetadataImport(collectionId: string, importId: string) {
    return this.api.deleteMetadataImport(undefined, {
      params: { collection_id: collectionId, import_id: importId },
    });
  }

  /**
   * Trigger a new run of a saved import. `mode` and `delete_missing`
   * default to the definition's saved values; `max_files`,
   * `include_thumbnails`, and `enrich_metadata` can be overridden per run.
   * Only one run may be active per collection at a time — triggering while
   * any run in the collection is active fails with a 409.
   *
   * @param collectionId - The ID of the metadata collection
   * @param importId - The ID of the metadata import
   * @param params - Per-run overrides
   * @returns The created run
   */
  async createMetadataImportRun(
    collectionId: string,
    importId: string,
    params: z.infer<typeof schemas.CreateMetadataImportRunRequest> = {},
  ) {
    return this.api.createMetadataImportRun(params, {
      params: { collection_id: collectionId, import_id: importId },
    });
  }

  /**
   * Cancel an active metadata import run. Files already imported by the run
   * stay in the collection; the run is settled and marked cancelled.
   *
   * @param collectionId - The ID of the metadata collection
   * @param importId - The ID of the metadata import
   * @param runId - The ID of the run to cancel
   * @returns The run with its post-cancel status
   */
  async cancelMetadataImportRun(
    collectionId: string,
    importId: string,
    runId: string,
  ) {
    return this.api.cancelMetadataImportRun(undefined, {
      params: {
        collection_id: collectionId,
        import_id: importId,
        run_id: runId,
      },
    });
  }
}
