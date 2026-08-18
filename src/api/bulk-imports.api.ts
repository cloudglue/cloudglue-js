import { Bulk_ImportsApi } from '../../generated';
import { schemas } from '../../generated/Bulk_Imports';
import z from 'zod';

/**
 * Bulk imports: batch-import a data connector's source files into a
 * collection from a saved definition.
 *
 * What a run ingests follows the collection's type, reported as
 * `import_type` on the definition and on every run:
 *
 * - `metadata` (metadata collections) — each file's source metadata is
 *   imported as a collection file. No media is downloaded or processed and
 *   runs consume no credits.
 * - `media` (every other collection type) — each matching file is ingested
 *   and processed exactly like a manual add, so it is billed per file and
 *   counts against the account's file usage limits.
 */
export class EnhancedBulkImportsApi {
  constructor(private readonly api: typeof Bulk_ImportsApi) {}

  /**
   * Create a bulk import. `import_type` is inferred from the collection's
   * type at creation and fixed for the import's lifetime — definitions are
   * immutable, so delete and recreate to change one.
   *
   * By default the first run starts immediately (`start: false` saves the
   * definition only). The response's `latest_run` is the triggered run; it
   * is null when `start` is false or when another run is already active in
   * the collection, and has status `failed` when the run could not be
   * started. Runs page the connector — and, for media imports, add each
   * file — with the account's default active API key, and fail with a clear
   * error when the account has none.
   *
   * Filters are listing passes — `from`/`to` date window (YYYY-MM-DD, UTC),
   * `title_search`, `folder_id` (Google Drive only), `path` and `recursive`
   * (Dropbox only — `path` lists direct children, `recursive: 'true'` lists
   * the whole subtree under it), `team`/`meeting_type` (Grain only). Empty or
   * omitted means one unfiltered pass; overlapping passes are deduplicated.
   * `max_files` caps each run (a capped run never runs the delete-missing
   * sweep); media imports are additionally capped at 10,000 files per run
   * whatever `max_files` says. `rate_limit` overrides the per-connector safe
   * listing rate and is clamped to a per-connector ceiling at run time.
   *
   * `include_thumbnails` and `enrich_metadata` are metadata-import only —
   * setting either on a media import fails with a 400, because imported
   * media gets real thumbnails from the processing pipeline and a media run
   * has no metadata-only record to enrich. `enrich_metadata` (off by
   * default) backfills source-metadata fields the connector's list endpoint
   * omits, after each index batch settles: Gong parties + Call Spotlight
   * content (batched — enriched docs are re-embedded so the content is
   * searchable) and Dropbox `media_info` duration and dimensions (per-file).
   * It is a no-op for other connectors, and costs upstream API budget plus,
   * for Gong, embedding work.
   *
   * @param collectionId - The ID of the collection to import into
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
   * List a collection's bulk imports, newest first, each with its latest
   * run inline.
   *
   * @param collectionId - The ID of the collection
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
   * Get a bulk import definition with one page of its run history (newest
   * first).
   *
   * @param collectionId - The ID of the collection
   * @param importId - The ID of the import
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
   * Delete a bulk import definition and its run history. Any active run is
   * cancelled first. Files the import brought into the collection are not
   * removed.
   *
   * @param collectionId - The ID of the collection
   * @param importId - The ID of the import
   */
  async deleteMetadataImport(collectionId: string, importId: string) {
    return this.api.deleteMetadataImport(undefined, {
      params: { collection_id: collectionId, import_id: importId },
    });
  }

  /**
   * Trigger a new run of a saved import. `mode` and `delete_missing`
   * default to the definition's saved values; `max_files`,
   * `include_thumbnails`, and `enrich_metadata` can be overridden per run
   * (the latter two on metadata imports only — a 400 otherwise).
   *
   * Only one run may be active per collection at a time — triggering while
   * any run in the collection is active fails with a 409. Rerunning is also
   * how a media import resumes after it stopped on exhausted credits or a
   * usage limit: an `append` run skips files it already imported and retries
   * the rest. For media imports `refresh` re-syncs the source metadata of
   * already-imported files — media bytes are never re-downloaded.
   *
   * @param collectionId - The ID of the collection
   * @param importId - The ID of the import
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
   * Cancel an in-flight run. Files already imported by the run stay in the
   * collection; the run is settled and marked cancelled. Cancelling an
   * already-finished run is a no-op that returns the current state.
   *
   * @param collectionId - The ID of the collection
   * @param importId - The ID of the import
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

/**
 * @deprecated Renamed to `EnhancedBulkImportsApi` in spec v0.7.21, when
 * bulk imports grew beyond metadata collections. This alias still works and
 * refers to the same class.
 */
export const EnhancedMetadataImportsApi = EnhancedBulkImportsApi;

/**
 * @deprecated Renamed to `EnhancedBulkImportsApi` in spec v0.7.21.
 */
export type EnhancedMetadataImportsApi = EnhancedBulkImportsApi;
