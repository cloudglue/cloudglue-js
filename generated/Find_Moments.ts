import { makeApi, Zodios, type ZodiosOptions } from '@zodios/core';
import { z } from 'zod';

import { Moment } from './common';
import { CriterionScore } from './common';
import { MomentFinding } from './common';
import { MomentCriterion } from './common';
import { MomentSchemaDefinition } from './common';

type FindMoments = {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: number;
  url: string;
  find_moments_config?: {} | undefined;
  moments?: Array<Moment> | undefined;
  findings?: Array<MomentFinding> | undefined;
  total_moments?: number | undefined;
  error?: string | undefined;
};
type NewFindMoments = {
  url: string;
  describe_job_id?: string | undefined;
  criterion: MomentCriterion;
  signals_required?:
    | Array<
        | 'speech'
        | 'visual_scene_description'
        | 'scene_text'
        | 'audio_description'
      >
    | undefined;
  boundary_policy?: ('sentence' | 'tight' | 'loose') | undefined;
  speaker_filter?:
    | Partial<{
        include: Array<string>;
        exclude: Array<string>;
        match: 'any' | 'all';
      }>
    | undefined;
  min_duration_seconds?: number | undefined;
  max_duration_seconds?: number | undefined;
  cache_policy?: ('reuse' | 'refresh') | undefined;
};
type FindMomentsList = {
  runs: Array<FindMoments>;
  total: number;
  next_cursor?: string | undefined;
};

const NewFindMoments: z.ZodType<NewFindMoments> = z
  .object({
    url: z.string(),
    describe_job_id: z.string().uuid().optional(),
    criterion: MomentCriterion,
    signals_required: z
      .array(
        z.enum([
          'speech',
          'visual_scene_description',
          'scene_text',
          'audio_description',
        ])
      )
      .min(1)
      .optional()
      .optional(),
    boundary_policy: z
      .enum(['sentence', 'tight', 'loose'])
      .optional()
      .optional(),
    speaker_filter: z
      .object({
        include: z.array(z.string()),
        exclude: z.array(z.string()),
        match: z.enum(['any', 'all']),
      })
      .partial()
      .strict()
      .passthrough()
      .optional(),
    min_duration_seconds: z.number().gt(0).optional(),
    max_duration_seconds: z.number().gt(0).optional(),
    cache_policy: z.enum(['reuse', 'refresh']).optional(),
  })
  .strict();
const FindMoments: z.ZodType<FindMoments> = z
  .object({
    job_id: z.string().uuid(),
    status: z.enum(['pending', 'processing', 'completed', 'failed']),
    created_at: z.number().int(),
    url: z.string(),
    find_moments_config: z
      .object({})
      .partial()
      .strict()
      .passthrough()
      .optional(),
    moments: z.array(Moment).optional(),
    findings: z.array(MomentFinding).optional(),
    total_moments: z.number().int().optional(),
    error: z.string().optional(),
  })
  .strict()
  .passthrough();
const FindMomentsList: z.ZodType<FindMomentsList> = z
  .object({
    runs: z.array(FindMoments),
    total: z.number().int(),
    next_cursor: z.string().optional(),
  })
  .strict()
  .passthrough();
const DeleteFindMomentsResult = z
  .object({
    job_id: z.string().uuid(),
    deleted: z.boolean(),
    refunded: z.boolean(),
  })
  .strict()
  .passthrough();

export const schemas = {
  NewFindMoments,
  FindMoments,
  FindMomentsList,
  DeleteFindMomentsResult,
};

const endpoints = makeApi([
  {
    method: 'post',
    path: '/find-moments',
    alias: 'createFindMoments',
    description: `Runs exhaustive moment discovery for one criterion over one video. Every accepted moment is persisted; ranking and truncation are read-time parameters on GET. Reuses a compatible describe or creates one internally - a missing describe is never an error.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Find-moments run parameters`,
        type: 'Body',
        schema: NewFindMoments,
      },
    ],
    response: FindMoments,
    errors: [
      {
        status: 400,
        description: `Invalid request. Criterion dialect violations carry a stable code and a field-addressable path; unknown execution fields (e.g. mode, max_moments) are rejected naming the field.`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 402,
        description: `Insufficient credit balance`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 404,
        description: `File not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 429,
        description: `Monthly find-moments runs limit reached`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/find-moments',
    alias: 'listFindMoments',
    description: `Lists runs, newest first, with cursor pagination. Pagination is over runs, never over joined moment rows.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'limit',
        type: 'Query',
        schema: z.number().int().gte(1).lte(100).optional(),
      },
      {
        name: 'cursor',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'status',
        type: 'Query',
        schema: z
          .enum(['pending', 'processing', 'completed', 'failed'])
          .optional(),
      },
      {
        name: 'created_before',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'created_after',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'url',
        type: 'Query',
        schema: z.string().optional(),
      },
    ],
    response: FindMomentsList,
    errors: [
      {
        status: 400,
        description: `Invalid request`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 429,
        description: `Rate limit exceeded`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/find-moments/:job_id',
    alias: 'getFindMoments',
    description: `Returns the run; when completed, includes moments and findings shaped by the read parameters. Selection never destroys accepted results: total_moments is always the full accepted count.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'job_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
      {
        name: 'limit',
        type: 'Query',
        schema: z.number().int().gte(1).optional(),
      },
      {
        name: 'min_score',
        type: 'Query',
        schema: z.number().optional(),
      },
      {
        name: 'sort',
        type: 'Query',
        schema: z
          .enum(['rank_score', 'start_time'])
          .optional()
          .optional(),
      },
    ],
    response: FindMoments,
    errors: [
      {
        status: 404,
        description: `Run not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'delete',
    path: '/find-moments/:job_id',
    alias: 'deleteFindMoments',
    description: `Deletes the run and its moments and findings. An in-flight run is cancelled and refunded; a completed run is not refunded.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'job_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: DeleteFindMomentsResult,
    errors: [
      {
        status: 404,
        description: `Run not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
]);

export const Find_MomentsApi = new Zodios(
  'https://api.cloudglue.dev/v1',
  endpoints
);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
