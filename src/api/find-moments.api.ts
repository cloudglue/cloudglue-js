import { Find_MomentsApi } from '../../generated';
import { schemas } from '../../generated/Find_Moments';
import { CloudglueError } from '../error';
import { WaitForReadyOptions } from '../types';
import z from 'zod';

/** Derived from the generated schema so it cannot drift from the spec. */
export type FindMomentsStatus = z.infer<typeof schemas.FindMoments>['status'];

export interface ListFindMomentsParams {
  limit?: number;
  /** Opaque cursor from a previous page. Pagination is over runs, never over joined moment rows. */
  cursor?: string;
  status?: FindMomentsStatus;
  created_before?: string;
  created_after?: string;
  /** Only runs for this source url */
  url?: string;
}

export interface GetFindMomentsParams {
  /** Maximum moments to return. Read-time only — `total_moments` still reports the full accepted count. */
  limit?: number;
  /** Drop moments whose criterion score is below this value */
  min_score?: number;
  /** Ordering of the returned moments (API default `rank_score`) */
  sort?: 'rank_score' | 'start_time';
}

/**
 * Find Moments: exhaustive, rubric-driven discovery of moments inside a
 * single video.
 *
 * A run takes a source `url` and an inline `criterion` — a rubric plus
 * optional typed output declarations (`moment_schema`, `finding_schema`,
 * `anchors`, and exactly one `scoring` key). The criterion is snapshotted
 * and hashed onto the run as `criterion_hash`.
 *
 * Runs reuse a compatible describe or create one internally, so a missing
 * describe is never an error; `describe_job_id` pins a specific one.
 *
 * Every accepted moment is persisted. `limit`, `min_score`, and `sort` are
 * read-time parameters on {@link getFindMoments} — selection never destroys
 * accepted results, and `total_moments` always reports the full accepted
 * count.
 */
export class EnhancedFindMomentsApi {
  constructor(private readonly api: typeof Find_MomentsApi) {}

  /**
   * Run exhaustive moment discovery for one criterion over one video.
   *
   * @param params - Source `url` and the inline `criterion`, plus optional
   *   `signals_required`, `boundary_policy` (`sentence` | `tight` |
   *   `loose`), `speaker_filter`, duration bounds, and `cache_policy`
   *   (`reuse` | `refresh`)
   * @returns The run; poll {@link getFindMoments} until it settles
   */
  async createFindMoments(params: z.infer<typeof schemas.NewFindMoments>) {
    return this.api.createFindMoments(params);
  }

  /**
   * List find-moments runs, newest first, with cursor pagination.
   *
   * @param params - Pagination and filters (`status`, `url`, created window)
   */
  async listFindMoments(params: ListFindMomentsParams = {}) {
    return this.api.listFindMoments({ queries: params });
  }

  /**
   * Get a run. When completed it includes `moments` and `findings`, shaped
   * by the read parameters.
   *
   * @param jobId - The run id
   * @param params - Read-time shaping (`limit`, `min_score`, `sort`)
   */
  async getFindMoments(jobId: string, params: GetFindMomentsParams = {}) {
    return this.api.getFindMoments({
      params: { job_id: jobId },
      queries: params,
    });
  }

  /**
   * Delete a run along with its moments and findings. An in-flight run is
   * cancelled and refunded; a completed run is not refunded.
   *
   * @param jobId - The run id
   */
  async deleteFindMoments(jobId: string) {
    return this.api.deleteFindMoments(undefined, {
      params: { job_id: jobId },
    });
  }

  /**
   * Poll a run until it reaches a terminal state.
   *
   * Read-time shaping (`limit`, `min_score`, `sort`) is merged into the
   * options object alongside the polling controls, matching the
   * `waitForReady(id, options)` shape used by every other enhanced API.
   *
   * Note the attempt cap defaults to 60 rather than the SDK-wide 36:
   * moment discovery reads the whole video and routinely runs past three
   * minutes.
   *
   * @param jobId - The run id
   * @param options - Polling controls plus read-time shaping for each fetch
   * @returns The completed run
   * @throws CloudglueError if the run fails or the timeout is reached
   */
  async waitForReady(
    jobId: string,
    options: WaitForReadyOptions & GetFindMomentsParams = {},
  ) {
    const {
      pollingInterval = 5000,
      maxAttempts = 60,
      ...readParams
    } = options;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const run = await this.getFindMoments(jobId, readParams);

      if (['completed', 'failed', 'cancelled'].includes(run.status)) {
        if (run.status === 'failed') {
          throw new CloudglueError(
            `Find-moments run failed: ${jobId}${run.error ? ` — ${run.error}` : ''}`,
          );
        }
        return run;
      }

      await new Promise((resolve) => setTimeout(resolve, pollingInterval));
      attempts++;
    }

    throw new CloudglueError(
      `Timeout waiting for find-moments run ${jobId} after ${maxAttempts} attempts`,
    );
  }
}
