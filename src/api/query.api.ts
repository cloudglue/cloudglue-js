import { QueryApi } from '../../generated';
import { schemas } from '../../generated/Query';
import { CloudglueError } from '../error';
import { WaitForReadyOptions } from '../types';
import z from 'zod';

export class EnhancedQueryApi {
  constructor(private readonly api: typeof QueryApi) {}

  /**
   * Run a read-only SQL query over the structured data extracted from one or
   * more collections. Queries execute against three virtual tables — `files`,
   * `entities`, and `segment_entities` — built from each file's most recent
   * completed extraction.
   *
   * Provide exactly one of `sql` (2 credits) or `query`, a natural-language
   * question that Cloudglue compiles to SQL against the same virtual schema
   * (4 credits; the compiled statement is returned in the result's `sql`
   * field). Use `dry_run` to validate/compile without executing, and
   * `background` with `format` for large exports retrievable via
   * `download_url`. Results are stored, so completed runs can be re-fetched
   * with `getQuery()`.
   *
   * @param params - Query execution parameters
   * @returns The query result (inline rows, or export state when background)
   */
  async runQuery(params: z.infer<typeof schemas.RunQueryRequest>) {
    return this.api.runQuery(params);
  }

  /**
   * Introspect the virtual tables and per-collection extracted fields
   * available to SQL queries over the given collections — column names,
   * entity field names, types, and levels, plus each collection's verbatim
   * extract schema and prompt. Use before writing a query.
   *
   * @param collectionIds - Collection IDs to introspect (1-20)
   * @returns The queryable schema for those collections
   */
  async getQuerySchema(collectionIds: string[]) {
    return this.api.getQuerySchema({
      queries: { collections: collectionIds.join(',') },
    });
  }

  /**
   * List query runs with pagination and filtering. List items omit the
   * `columns` and `rows` payloads — fetch an individual run via `getQuery()`
   * for the full result.
   */
  async listQueries(
    params: {
      limit?: number;
      offset?: number;
      status?: 'completed' | 'failed' | 'in_progress' | 'cancelled';
      created_before?: string;
      created_after?: string;
    } = {},
  ) {
    return this.api.listQueries({ queries: params });
  }

  /**
   * Retrieve a stored query run by ID, including its result rows. Results
   * larger than the inline storage cap are replayed truncated
   * (`truncated: true`).
   */
  async getQuery(queryId: string) {
    return this.api.getQuery({ params: { id: queryId } });
  }

  /**
   * Cancel an in-progress background export. The run is marked cancelled
   * synchronously, the export stream is aborted mid-flight (the partial
   * upload is discarded), and reserved credits are refunded. A run that has
   * already completed or failed is returned unchanged.
   */
  async cancelQueryExport(queryId: string) {
    return this.api.cancelQueryExport(undefined, { params: { id: queryId } });
  }

  /**
   * Waits for a background query export to reach a terminal state
   * (completed, failed, or cancelled) by polling `getQuery()`.
   *
   * @param queryId - The ID of the query run to wait for
   * @param options - Optional polling configuration
   * @returns The final query result
   * @throws {CloudglueError} If the run fails or maxAttempts is reached
   */
  async waitForReady(queryId: string, options: WaitForReadyOptions = {}) {
    const { pollingInterval = 5000, maxAttempts = 36 } = options;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const run = await this.getQuery(queryId);

      if (['completed', 'failed', 'cancelled'].includes(run.status ?? '')) {
        if (run.status === 'failed') {
          throw new CloudglueError(`Query run failed: ${queryId}`);
        }
        return run;
      }

      await new Promise((resolve) => setTimeout(resolve, pollingInterval));
      attempts++;
    }

    throw new CloudglueError(
      `Timeout waiting for query run ${queryId} to process after ${maxAttempts} attempts`,
    );
  }
}
