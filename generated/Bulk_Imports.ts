import { makeApi, Zodios, type ZodiosOptions } from '@zodios/core';
import { z } from 'zod';

type MetadataImport = Partial<{
  object: 'metadata_import';
  id: string;
  collection_id: string;
  connector_id: string;
  import_type: 'metadata' | 'media';
  name: string;
  filters: Array<MetadataImportFilterSet>;
  default_mode: 'append' | 'refresh';
  delete_missing: boolean;
  rate_limit: number | null;
  created_at: number;
  latest_run: MetadataImportRun | null;
  max_files: number | null;
  include_thumbnails: boolean;
  enrich_metadata: boolean;
}>;
type CreateMetadataImportRequest = {
  name: string;
  connector_id: string;
  filters?: Array<MetadataImportFilterSet> | undefined;
  default_mode?: ('append' | 'refresh') | undefined;
  delete_missing?: boolean | undefined;
  rate_limit?: number | undefined;
  start?: boolean | undefined;
  max_files?: number | undefined;
  include_thumbnails?: boolean | undefined;
  enrich_metadata?: boolean | undefined;
};
type MetadataImportFilterSet = Partial<{
  from: string;
  to: string;
  folder_id: string;
  path: string;
  title_search: string;
  team: string;
  meeting_type: string;
  recursive: 'true' | 'false';
}>;
type MetadataImportRun = Partial<{
  object: 'metadata_import_run';
  id: string;
  import_id: string;
  import_type: 'metadata' | 'media';
  mode: 'append' | 'refresh';
  delete_missing: boolean;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: MetadataImportRunProgress;
  error: string | null;
  started_at: number | null;
  completed_at: number | null;
  created_at: number;
  max_files: number | null;
  include_thumbnails: boolean;
  enrich_metadata: boolean;
}>;
type MetadataImportRunProgress = Partial<{
  pages_listed: number;
  files_listed: number;
  files_created: number;
  files_updated: number;
  files_skipped: number;
  files_failed: number;
  files_queued: number;
  files_indexed: number;
  files_imported: number;
  files_removed: number;
  files_enriched: number;
}>;
type MetadataImportList = Partial<{
  object: 'list';
  data: Array<MetadataImport>;
  total: number;
  limit: number;
  offset: number;
}>;
type MetadataImportDetail = Partial<{
  object: 'metadata_import';
  id: string;
  collection_id: string;
  connector_id: string;
  import_type: 'metadata' | 'media';
  name: string;
  filters: Array<MetadataImportFilterSet>;
  default_mode: 'append' | 'refresh';
  delete_missing: boolean;
  rate_limit: number | null;
  created_at: number;
  runs: Array<MetadataImportRun>;
  total_runs: number;
  limit: number;
  offset: number;
  max_files: number | null;
  include_thumbnails: boolean;
  enrich_metadata: boolean;
}>;

const MetadataImportRunProgress: z.ZodType<MetadataImportRunProgress> = z
  .object({
    pages_listed: z.number().int(),
    files_listed: z.number().int(),
    files_created: z.number().int(),
    files_updated: z.number().int(),
    files_skipped: z.number().int(),
    files_failed: z.number().int(),
    files_queued: z.number().int(),
    files_indexed: z.number().int(),
    files_imported: z.number().int(),
    files_removed: z.number().int(),
    files_enriched: z.number().int(),
  })
  .partial()
  .strict()
  .passthrough();
const MetadataImportRun: z.ZodType<MetadataImportRun> = z
  .object({
    object: z.literal('metadata_import_run'),
    id: z.string().uuid(),
    import_id: z.string().uuid(),
    import_type: z.enum(['metadata', 'media']),
    mode: z.enum(['append', 'refresh']),
    delete_missing: z.boolean(),
    status: z.enum([
      'pending',
      'processing',
      'completed',
      'failed',
      'cancelled',
    ]),
    progress: MetadataImportRunProgress,
    error: z.string().nullable(),
    started_at: z.number().nullable(),
    completed_at: z.number().nullable(),
    created_at: z.number(),
    max_files: z.number().int().nullable(),
    include_thumbnails: z.boolean(),
    enrich_metadata: z.boolean(),
  })
  .partial()
  .strict()
  .passthrough();
const MetadataImportFilterSet: z.ZodType<MetadataImportFilterSet> = z
  .object({
    from: z.string(),
    to: z.string(),
    folder_id: z.string(),
    path: z.string(),
    title_search: z.string(),
    team: z.string(),
    meeting_type: z.string(),
    recursive: z.enum(['true', 'false']),
  })
  .partial()
  .strict();
const MetadataImport: z.ZodType<MetadataImport> = z
  .object({
    object: z.literal('metadata_import'),
    id: z.string().uuid(),
    collection_id: z.string().uuid(),
    connector_id: z.string().uuid(),
    import_type: z.enum(['metadata', 'media']),
    name: z.string(),
    filters: z.array(MetadataImportFilterSet),
    default_mode: z.enum(['append', 'refresh']),
    delete_missing: z.boolean(),
    rate_limit: z.number().int().nullable(),
    created_at: z.number(),
    latest_run: MetadataImportRun.nullable(),
    max_files: z.number().int().nullable(),
    include_thumbnails: z.boolean(),
    enrich_metadata: z.boolean(),
  })
  .partial()
  .strict()
  .passthrough();
const MetadataImportDetail: z.ZodType<MetadataImportDetail> = z
  .object({
    object: z.literal('metadata_import'),
    id: z.string().uuid(),
    collection_id: z.string().uuid(),
    connector_id: z.string().uuid(),
    import_type: z.enum(['metadata', 'media']),
    name: z.string(),
    filters: z.array(MetadataImportFilterSet),
    default_mode: z.enum(['append', 'refresh']),
    delete_missing: z.boolean(),
    rate_limit: z.number().int().nullable(),
    created_at: z.number(),
    runs: z.array(MetadataImportRun),
    total_runs: z.number().int(),
    limit: z.number().int(),
    offset: z.number().int(),
    max_files: z.number().int().nullable(),
    include_thumbnails: z.boolean(),
    enrich_metadata: z.boolean(),
  })
  .partial()
  .strict()
  .passthrough();
const MetadataImportList: z.ZodType<MetadataImportList> = z
  .object({
    object: z.literal('list'),
    data: z.array(MetadataImport),
    total: z.number().int(),
    limit: z.number().int(),
    offset: z.number().int(),
  })
  .partial()
  .strict()
  .passthrough();
const CreateMetadataImportRequest: z.ZodType<CreateMetadataImportRequest> = z
  .object({
    name: z.string().min(1).max(255),
    connector_id: z.string().uuid(),
    filters: z.array(MetadataImportFilterSet).max(20).optional(),
    default_mode: z.enum(['append', 'refresh']).optional(),
    delete_missing: z.boolean().optional(),
    rate_limit: z.number().int().gte(1).lte(50).optional(),
    start: z.boolean().optional(),
    max_files: z.number().int().gte(1).lte(1000000).optional(),
    include_thumbnails: z.boolean().optional(),
    enrich_metadata: z.boolean().optional(),
  })
  .strict()
  .passthrough();
const MetadataImportDelete = z
  .object({
    object: z.literal('metadata_import'),
    id: z.string().uuid(),
    deleted: z.literal(true),
  })
  .partial()
  .strict()
  .passthrough();
const CreateMetadataImportRunRequest = z
  .object({
    mode: z.enum(['append', 'refresh']),
    delete_missing: z.boolean(),
    max_files: z.number().int().gte(1).lte(1000000),
    include_thumbnails: z.boolean(),
    enrich_metadata: z.boolean(),
  })
  .partial()
  .strict()
  .passthrough();

export const schemas = {
  MetadataImportRunProgress,
  MetadataImportRun,
  MetadataImportFilterSet,
  MetadataImport,
  MetadataImportDetail,
  MetadataImportList,
  CreateMetadataImportRequest,
  MetadataImportDelete,
  CreateMetadataImportRunRequest,
};

const endpoints = makeApi([
  {
    method: 'post',
    path: '/collections/:collection_id/imports',
    alias: 'createMetadataImport',
    description: `Create a bulk import: a saved definition that lists a data connector&#x27;s source files and brings each match into the collection. What a run ingests follows the collection&#x27;s type (see &#x60;import_type&#x60; on the response). For a **metadata collection** it imports each file&#x27;s source metadata as a collection file, with no media download or processing, and runs consume no credits. For **any other collection type** it imports the media itself: each matching file is ingested and processed exactly like a manual add, so it is **billed per file** and counts against the account&#x27;s file usage limits. A media run that exhausts credits or a usage limit stops with a user-facing error and keeps everything it already imported — rerun in &#x60;append&#x60; mode to resume. By default the first run starts immediately (&#x60;start: false&#x60; saves the definition only). The response&#x27;s &#x60;latest_run&#x60; is the triggered run; it is null when &#x60;start&#x60; is false or when another run is already active in the collection (the definition is saved, and can be run once that one finishes), and it is returned with status &#x60;failed&#x60; when the run could not be started (trigger a new run to retry). Runs page the connector — and, for media imports, add each file — with the account&#x27;s default active API key, and fail with a clear error when the account has none.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: CreateMetadataImportRequest,
      },
      {
        name: 'collection_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: MetadataImport,
    errors: [
      {
        status: 400,
        description: `Invalid request — the connector does not exist, the connector type does not support imports, a filter key is not supported by the connector type, or &#x60;include_thumbnails&#x60; or &#x60;enrich_metadata&#x60; was set on a media import (imported media gets real thumbnails from the processing pipeline, and a media run has no metadata-only record to enrich)`,
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
    path: '/collections/:collection_id/imports',
    alias: 'listMetadataImports',
    description: `List a collection&#x27;s metadata imports, newest first, each with its latest run inline.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'collection_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
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
    ],
    response: MetadataImportList,
    errors: [
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
    path: '/collections/:collection_id/imports/:import_id',
    alias: 'getMetadataImport',
    description: `Get a metadata import definition with one page of its run history (newest first).`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'collection_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
      {
        name: 'import_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
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
    ],
    response: MetadataImportDetail,
    errors: [
      {
        status: 404,
        description: `Collection or import not found`,
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
    path: '/collections/:collection_id/imports/:import_id',
    alias: 'deleteMetadataImport',
    description: `Delete an import definition and its run history. Any active run is cancelled first. Imported files and collection memberships are never deleted by this operation.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'collection_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
      {
        name: 'import_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: MetadataImportDelete,
    errors: [
      {
        status: 404,
        description: `Collection or import not found`,
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
    method: 'post',
    path: '/collections/:collection_id/imports/:import_id/runs',
    alias: 'createMetadataImportRun',
    description: `Trigger a new run of a saved import. &#x60;mode&#x60; and &#x60;delete_missing&#x60; default to the definition&#x27;s saved values. Only one run may be active per collection at a time, so triggering while any run in the collection is active returns a 409. Rerunning is also how a media import resumes after it stopped on exhausted credits or a usage limit: an &#x60;append&#x60; run skips files it already imported and retries the rest.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: CreateMetadataImportRunRequest.optional(),
      },
      {
        name: 'collection_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
      {
        name: 'import_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: MetadataImportRun,
    errors: [
      {
        status: 400,
        description: `Invalid request — &#x60;include_thumbnails&#x60; or &#x60;enrich_metadata&#x60; was set on a media import (imported media gets real thumbnails from the processing pipeline, and a media run has no metadata-only record to enrich)`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 404,
        description: `Collection or import not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 409,
        description: `A run of this import is already active, or another import in this collection has an active run`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 500,
        description: `The run could not be enqueued and was marked failed — trigger a new run to retry`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'post',
    path: '/collections/:collection_id/imports/:import_id/runs/:run_id/cancel',
    alias: 'cancelMetadataImportRun',
    description: `Cancel an in-flight run. Files already imported by the run are kept. Cancelling an already-finished run is a no-op that returns the current state.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'collection_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
      {
        name: 'import_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
      {
        name: 'run_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: MetadataImportRun,
    errors: [
      {
        status: 404,
        description: `Collection, import, or run not found`,
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

export const Bulk_ImportsApi = new Zodios(
  'https://api.cloudglue.dev/v1',
  endpoints
);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
