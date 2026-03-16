import { makeApi, Zodios, type ZodiosOptions } from '@zodios/core';
import { z } from 'zod';

import { SearchFilter } from './common';
import { SearchFilterCriteria } from './common';

type DeepSearch = Partial<{
  id: string;
  object: 'deep_search';
  status: 'in_progress' | 'completed' | 'failed' | 'cancelled';
  created_at: number;
  query: string;
  scope: 'segment' | 'file';
  text: string | null;
  results: Array<DeepSearchResult> | null;
  total: number;
  limit: number;
  search_queries: Array<DeepSearchSearchQueryPlan> | null;
  usage: DeepSearchUsage;
  error: Partial<{
    message: string;
    type: string;
    code: string;
  }> | null;
}>;
type CreateDeepSearchRequest = {
  knowledge_base:
    | DeepSearchKBCollections
    | DeepSearchKBFiles
    | DeepSearchKBDefault;
  query: string;
  scope?: ('segment' | 'file') | undefined;
  limit?: number | undefined;
  exclude_weak_results?: boolean | undefined;
  include?: Array<'search_queries'> | undefined;
  stream?: boolean | undefined;
  background?: boolean | undefined;
};
type DeepSearchResult = Partial<{
  type: 'segment' | 'file';
  id: string;
  file_id: string;
  collection_id: string;
  score: number;
  context: string;
  segment_id: string;
  start_time: number;
  end_time: number;
  title: string | null;
  filename: string | null;
  thumbnail_url: string | null;
  metadata: {} | null;
  summary: string | null;
  generated_title: string | null;
}>;
type DeepSearchSearchQueryPlan = Partial<{
  query: string;
  search_modalities: Array<string>;
  scope: string;
  filter: {} | null;
  result_count: number;
}>;
type DeepSearchUsage = Partial<{
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  search_calls: number;
}>;
type DeepSearchKBCollections = {
  source: 'collections';
  collections: Array<string>;
  filter?: (SearchFilter | null) | undefined;
};
type DeepSearchKBFiles = {
  source: 'files';
  files: Array<string>;
};
type DeepSearchKBDefault = {
  source: 'default';
};
type DeepSearchList = Partial<{
  object: 'list';
  data: Array<DeepSearchListItem>;
  total: number;
  limit: number;
  offset: number;
}>;
type DeepSearchListItem = Partial<{
  id: string;
  object: 'deep_search';
  status: 'in_progress' | 'completed' | 'failed' | 'cancelled';
  created_at: number;
  query: string;
  scope: 'segment' | 'file';
  total: number;
  usage: DeepSearchUsage;
}>;

const DeepSearchKBCollections: z.ZodType<DeepSearchKBCollections> = z
  .object({
    source: z.literal('collections'),
    collections: z.array(z.string().uuid()).min(1),
    filter: SearchFilter.optional(),
  })
  .strict()
  .passthrough();
const DeepSearchKBFiles: z.ZodType<DeepSearchKBFiles> = z
  .object({ source: z.literal('files'), files: z.array(z.string()).min(1) })
  .strict()
  .passthrough();
const DeepSearchKBDefault: z.ZodType<DeepSearchKBDefault> = z
  .object({ source: z.literal('default') })
  .strict()
  .passthrough();
const CreateDeepSearchRequest: z.ZodType<CreateDeepSearchRequest> = z
  .object({
    knowledge_base: z.union([
      DeepSearchKBCollections,
      DeepSearchKBFiles,
      DeepSearchKBDefault,
    ]),
    query: z.string().min(1),
    scope: z.enum(['segment', 'file']).optional(),
    limit: z.number().int().gte(1).lte(500).optional(),
    exclude_weak_results: z.boolean().optional(),
    include: z.array(z.literal('search_queries')).optional(),
    stream: z.boolean().optional(),
    background: z.boolean().optional(),
  })
  .strict()
  .passthrough();
const DeepSearchResult: z.ZodType<DeepSearchResult> = z
  .object({
    type: z.enum(['segment', 'file']),
    id: z.string().uuid(),
    file_id: z.string().uuid(),
    collection_id: z.string().uuid(),
    score: z.number(),
    context: z.string(),
    segment_id: z.string().uuid(),
    start_time: z.number(),
    end_time: z.number(),
    title: z.string().nullable(),
    filename: z.string().nullable(),
    thumbnail_url: z.string().nullable(),
    metadata: z.object({}).partial().strict().passthrough().nullable(),
    summary: z.string().nullable(),
    generated_title: z.string().nullable(),
  })
  .partial()
  .strict()
  .passthrough();
const DeepSearchSearchQueryPlan: z.ZodType<DeepSearchSearchQueryPlan> = z
  .object({
    query: z.string(),
    search_modalities: z.array(z.string()),
    scope: z.string(),
    filter: z.object({}).partial().strict().passthrough().nullable(),
    result_count: z.number().int(),
  })
  .partial()
  .strict()
  .passthrough();
const DeepSearchUsage: z.ZodType<DeepSearchUsage> = z
  .object({
    input_tokens: z.number().int(),
    output_tokens: z.number().int(),
    total_tokens: z.number().int(),
    search_calls: z.number().int(),
  })
  .partial()
  .strict()
  .passthrough();
const DeepSearch: z.ZodType<DeepSearch> = z
  .object({
    id: z.string().uuid(),
    object: z.literal('deep_search'),
    status: z.enum(['in_progress', 'completed', 'failed', 'cancelled']),
    created_at: z.number(),
    query: z.string(),
    scope: z.enum(['segment', 'file']),
    text: z.string().nullable(),
    results: z.array(DeepSearchResult).nullable(),
    total: z.number().int(),
    limit: z.number().int(),
    search_queries: z.array(DeepSearchSearchQueryPlan).nullable(),
    usage: DeepSearchUsage,
    error: z
      .object({ message: z.string(), type: z.string(), code: z.string() })
      .partial()
      .strict()
      .passthrough()
      .nullable(),
  })
  .partial()
  .strict()
  .passthrough();
const DeepSearchListItem: z.ZodType<DeepSearchListItem> = z
  .object({
    id: z.string().uuid(),
    object: z.literal('deep_search'),
    status: z.enum(['in_progress', 'completed', 'failed', 'cancelled']),
    created_at: z.number(),
    query: z.string(),
    scope: z.enum(['segment', 'file']),
    total: z.number().int(),
    usage: DeepSearchUsage,
  })
  .partial()
  .strict()
  .passthrough();
const DeepSearchList: z.ZodType<DeepSearchList> = z
  .object({
    object: z.literal('list'),
    data: z.array(DeepSearchListItem),
    total: z.number().int(),
    limit: z.number().int(),
    offset: z.number().int(),
  })
  .partial()
  .strict()
  .passthrough();
const DeleteDeepSearchResult = z
  .object({
    id: z.string().uuid(),
    object: z.literal('deep_search'),
    deleted: z.literal(true),
  })
  .partial()
  .strict()
  .passthrough();

export const schemas = {
  DeepSearchKBCollections,
  DeepSearchKBFiles,
  DeepSearchKBDefault,
  CreateDeepSearchRequest,
  DeepSearchResult,
  DeepSearchSearchQueryPlan,
  DeepSearchUsage,
  DeepSearch,
  DeepSearchListItem,
  DeepSearchList,
  DeleteDeepSearchResult,
};

const endpoints = makeApi([
  {
    method: 'post',
    path: '/deepSearch',
    alias: 'createDeepSearch',
    description: `Create a new deep search over one or more collections. Deep search uses agentic retrieval and LLM summarization to find specific moments across your video data.

The search can be processed synchronously (default), streamed via SSE, or run in the background.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Deep search creation parameters`,
        type: 'Body',
        schema: CreateDeepSearchRequest,
      },
    ],
    response: DeepSearch,
    errors: [
      {
        status: 400,
        description: `Invalid request parameters`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 404,
        description: `Collection not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 500,
        description: `An unexpected error occurred on the server`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/deepSearch',
    alias: 'listDeepSearches',
    description: `List all deep searches with pagination and filtering options.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'limit',
        type: 'Query',
        schema: z.number().int().gte(1).lte(100).optional(),
      },
      {
        name: 'offset',
        type: 'Query',
        schema: z.number().int().gte(0).optional(),
      },
      {
        name: 'status',
        type: 'Query',
        schema: z
          .enum(['in_progress', 'completed', 'failed', 'cancelled'])
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
    ],
    response: DeepSearchList,
    errors: [
      {
        status: 500,
        description: `An unexpected error occurred on the server`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/deepSearch/:id',
    alias: 'getDeepSearch',
    description: `Retrieve a specific deep search by its ID.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'id',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: DeepSearch,
    errors: [
      {
        status: 404,
        description: `Deep search not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 500,
        description: `An unexpected error occurred on the server`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'delete',
    path: '/deepSearch/:id',
    alias: 'deleteDeepSearch',
    description: `Delete a deep search by ID. This operation is idempotent - deleting a non-existent deep search returns success.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'id',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: DeleteDeepSearchResult,
    errors: [
      {
        status: 500,
        description: `An unexpected error occurred on the server`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'post',
    path: '/deepSearch/:id/cancel',
    alias: 'cancelDeepSearch',
    description: `Cancel a background deep search that is in progress. If the deep search is already completed, failed, or cancelled, this returns the deep search as-is.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'id',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: DeepSearch,
    errors: [
      {
        status: 404,
        description: `Deep search not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 500,
        description: `An unexpected error occurred on the server`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
]);

export const Deep_SearchApi = new Zodios(
  'https://api.cloudglue.dev/v1',
  endpoints
);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
