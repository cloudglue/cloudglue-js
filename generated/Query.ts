import { makeApi, Zodios, type ZodiosOptions } from '@zodios/core';
import { z } from 'zod';

type QueryResult = Partial<{
  id: string;
  object: 'query_result';
  status: 'completed' | 'failed' | 'in_progress' | 'cancelled';
  created_at: number;
  collections: Array<string>;
  sql: string | null;
  columns: Array<
    Partial<{
      name: string;
      type: string;
    }>
  > | null;
  rows: Array<{}> | null;
  row_count: number;
  truncated: boolean;
  dry_run: boolean;
  usage: QueryUsage;
  error: Partial<{
    code: string;
    message: string;
  }> | null;
  format: 'json' | 'csv' | 'jsonl' | null;
  download_url: string | null;
  download_expires_at: number | null;
  output_bytes: number | null;
}>;
type QueryUsage = Partial<{
  files_scanned: number;
  entity_rows: number;
  segment_entity_rows: number;
  engine_ms: number;
  total_ms: number;
}>;
type QueryListResponse = Partial<{
  object: 'list';
  data: Array<QueryListItem>;
  total: number;
  limit: number;
  offset: number;
}>;
type QueryListItem = Partial<{
  id: string;
  object: 'query_result';
  status: 'completed' | 'failed' | 'in_progress' | 'cancelled';
  created_at: number;
  collections: Array<string>;
  sql: string | null;
  row_count: number;
  truncated: boolean;
  usage: QueryUsage;
  error: Partial<{
    code: string;
    message: string;
  }> | null;
}>;
type QuerySchema = Partial<{
  object: 'query_schema';
  tables: Array<QuerySchemaTable>;
  collections: Array<QuerySchemaCollection>;
}>;
type QuerySchemaTable = Partial<{
  name: string;
  description: string;
  columns: Array<
    Partial<{
      name: string;
      type: string;
      description: string;
    }>
  >;
}>;
type QuerySchemaCollection = Partial<{
  collection_id: string;
  fields: Array<
    Partial<{
      name: string;
      type: string;
      level: 'file' | 'segment';
    }>
  >;
  extract_schema: {} | null;
  prompt: string | null;
}>;

const QueryUsage: z.ZodType<QueryUsage> = z
  .object({
    files_scanned: z.number().int(),
    entity_rows: z.number().int(),
    segment_entity_rows: z.number().int(),
    engine_ms: z.number(),
    total_ms: z.number(),
  })
  .partial()
  .strict()
  .passthrough();
const QueryResult: z.ZodType<QueryResult> = z
  .object({
    id: z.string().uuid(),
    object: z.literal('query_result'),
    status: z.enum(['completed', 'failed', 'in_progress', 'cancelled']),
    created_at: z.number(),
    collections: z.array(z.string().uuid()),
    sql: z.string().nullable(),
    columns: z
      .array(
        z
          .object({ name: z.string(), type: z.string() })
          .partial()
          .strict()
          .passthrough()
      )
      .nullable(),
    rows: z.array(z.object({}).partial().strict().passthrough()).nullable(),
    row_count: z.number().int(),
    truncated: z.boolean(),
    dry_run: z.boolean(),
    usage: QueryUsage,
    error: z
      .object({ code: z.string(), message: z.string() })
      .partial()
      .strict()
      .passthrough()
      .nullable(),
    format: z.enum(['json', 'csv', 'jsonl']).nullable(),
    download_url: z.string().nullable(),
    download_expires_at: z.number().nullable(),
    output_bytes: z.number().int().nullable(),
  })
  .partial()
  .strict()
  .passthrough();
const QueryListItem: z.ZodType<QueryListItem> = z
  .object({
    id: z.string().uuid(),
    object: z.literal('query_result'),
    status: z.enum(['completed', 'failed', 'in_progress', 'cancelled']),
    created_at: z.number(),
    collections: z.array(z.string().uuid()),
    sql: z.string().nullable(),
    row_count: z.number().int(),
    truncated: z.boolean(),
    usage: QueryUsage,
    error: z
      .object({ code: z.string(), message: z.string() })
      .partial()
      .strict()
      .passthrough()
      .nullable(),
  })
  .partial()
  .strict()
  .passthrough();
const QueryListResponse: z.ZodType<QueryListResponse> = z
  .object({
    object: z.literal('list'),
    data: z.array(QueryListItem),
    total: z.number().int(),
    limit: z.number().int(),
    offset: z.number().int(),
  })
  .partial()
  .strict()
  .passthrough();
const QuerySchemaTable: z.ZodType<QuerySchemaTable> = z
  .object({
    name: z.string(),
    description: z.string(),
    columns: z.array(
      z
        .object({ name: z.string(), type: z.string(), description: z.string() })
        .partial()
        .strict()
        .passthrough()
    ),
  })
  .partial()
  .strict()
  .passthrough();
const QuerySchemaCollection: z.ZodType<QuerySchemaCollection> = z
  .object({
    collection_id: z.string().uuid(),
    fields: z.array(
      z
        .object({
          name: z.string(),
          type: z.string(),
          level: z.enum(['file', 'segment']),
        })
        .partial()
        .strict()
        .passthrough()
    ),
    extract_schema: z.object({}).partial().strict().passthrough().nullable(),
    prompt: z.string().nullable(),
  })
  .partial()
  .strict()
  .passthrough();
const QuerySchema: z.ZodType<QuerySchema> = z
  .object({
    object: z.literal('query_schema'),
    tables: z.array(QuerySchemaTable),
    collections: z.array(QuerySchemaCollection),
  })
  .partial()
  .strict()
  .passthrough();
const RunQueryRequest = z
  .object({
    collections: z.array(z.string().uuid()).min(1).max(20),
    sql: z.string().min(1).max(20000).optional(),
    query: z.string().min(1).max(2000).optional(),
    format: z.enum(['json', 'csv', 'jsonl']).optional(),
    max_rows: z.number().int().gte(1).lte(10000).optional(),
    background: z.boolean().optional(),
    dry_run: z.boolean().optional(),
  })
  .strict()
  .passthrough();

export const schemas = {
  QueryUsage,
  QueryResult,
  QueryListItem,
  QueryListResponse,
  QuerySchemaTable,
  QuerySchemaCollection,
  QuerySchema,
  RunQueryRequest,
};

const endpoints = makeApi([
  {
    method: 'post',
    path: '/query',
    alias: 'runQuery',
    description: `Run a synchronous read-only SQL query over the structured data extracted from one or more collections. Queries execute against three virtual tables — files, entities, and segment_entities — built from each file&#x27;s most recent completed extraction.

Each query costs 2 credits. Results are returned inline and stored, so completed runs can be re-fetched via GET /query/{id}. Use GET /query/schema to discover the queryable tables and per-collection fields.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `Query execution parameters`,
        type: 'Body',
        schema: RunQueryRequest,
      },
    ],
    response: QueryResult,
    errors: [
      {
        status: 400,
        description: `Invalid request parameters or rejected SQL (multiple statements, a non-SELECT statement, SQL that could not be parsed, or a face-analysis collection in scope)`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 402,
        description: `Insufficient credit balance`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 404,
        description: `One or more collections not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 408,
        description: `Query exceeded the execution time limit`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 409,
        description: `The selected collections exceed the maximum queryable dataset size`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 422,
        description: `A natural-language query could not be compiled into valid SQL — refine the question or send sql directly`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 429,
        description: `Too many concurrent queries, or the per-minute rate limit was exceeded`,
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
    path: '/query',
    alias: 'listQueries',
    description: `List all query runs with pagination and filtering options. List items omit the columns and rows payloads — fetch an individual run via GET /query/{id} for the full result.`,
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
          .enum(['completed', 'failed', 'in_progress', 'cancelled'])
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
    response: QueryListResponse,
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
    path: '/query/schema',
    alias: 'getQuerySchema',
    description: `Introspect the virtual tables and per-collection extracted fields available to SQL queries over the given collections. Use this to discover column names, entity field names, types, and levels, plus each collection&#x27;s verbatim extract schema and prompt, before writing a query.

Fields with level &#x27;file&#x27; appear as rows in the entities table; fields with level &#x27;segment&#x27; live inside the segment_entities.entities JSON column.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'collections',
        type: 'Query',
        schema: z.string(),
      },
    ],
    response: QuerySchema,
    errors: [
      {
        status: 400,
        description: `Invalid request parameters`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 404,
        description: `One or more collections not found`,
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
    path: '/query/:id',
    alias: 'getQuery',
    description: `Retrieve a stored query run by its ID, including its result rows. Results larger than the inline storage cap are replayed truncated (truncated: true).`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'id',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: QueryResult,
    errors: [
      {
        status: 404,
        description: `Query result not found`,
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
    path: '/query/:id/cancel',
    alias: 'cancelQueryExport',
    description: `Cancel an in-progress background export. The run is marked cancelled synchronously, the export stream is aborted mid-flight (the partial upload is discarded), and the reserved credits are refunded. A run that has already completed or failed is returned unchanged.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'id',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: QueryResult,
    errors: [
      {
        status: 404,
        description: `Query result not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
]);

export const QueryApi = new Zodios('https://api.cloudglue.dev/v1', endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
