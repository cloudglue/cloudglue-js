import { makeApi, Zodios, type ZodiosOptions } from '@zodios/core';
import { z } from 'zod';

import { File } from './common';
import { SourceMetadata } from './common';
import { GrainSourceMetadata } from './common';

type DataConnectorList = {
  object: 'list';
  data: Array<DataConnector>;
  total: number;
  limit: number;
  offset: number;
};
type DataConnector = {
  id: string;
  object: 'data_connector';
  type:
    | 's3'
    | 'dropbox'
    | 'google-drive'
    | 'zoom'
    | 'gong'
    | 'recall'
    | 'gcs'
    | 'grain';
  created_at: number;
  updated_at: number;
  metadata: {};
};
type DataConnectorFileList = {
  object: 'list';
  data: Array<DataConnectorFile>;
  has_more: boolean;
  next_page_token: string | null;
};
type DataConnectorFile = {
  object: 'data_connector_file';
  type: 'file' | 'folder';
  uri: string | null;
  name: string;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: number | null;
  metadata: Partial<
    {
      folder_id: string;
      path: string;
      prefix: string;
    } & {
      [key: string]: any;
    }
  >;
};
type SourceMetadataResponse = {
  object: 'source_metadata';
  source_metadata: SourceMetadata;
};

const DataConnector: z.ZodType<DataConnector> = z
  .object({
    id: z.string(),
    object: z.literal('data_connector'),
    type: z.enum([
      's3',
      'dropbox',
      'google-drive',
      'zoom',
      'gong',
      'recall',
      'gcs',
      'grain',
    ]),
    created_at: z.number().int(),
    updated_at: z.number().int(),
    metadata: z.object({}).partial().strict().passthrough(),
  })
  .strict()
  .passthrough();
const DataConnectorList: z.ZodType<DataConnectorList> = z
  .object({
    object: z.literal('list'),
    data: z.array(DataConnector),
    total: z.number().int(),
    limit: z.number().int(),
    offset: z.number().int(),
  })
  .strict()
  .passthrough();
const DataConnectorFile: z.ZodType<DataConnectorFile> = z
  .object({
    object: z.literal('data_connector_file'),
    type: z.enum(['file', 'folder']),
    uri: z.string().nullable(),
    name: z.string(),
    mime_type: z.string().nullable(),
    size_bytes: z.number().int().nullable(),
    created_at: z.number().int().nullable(),
    metadata: z
      .object({ folder_id: z.string(), path: z.string(), prefix: z.string() })
      .partial()
      .strict()
      .passthrough(),
  })
  .strict()
  .passthrough();
const DataConnectorFileList: z.ZodType<DataConnectorFileList> = z
  .object({
    object: z.literal('list'),
    data: z.array(DataConnectorFile),
    has_more: z.boolean(),
    next_page_token: z.string().nullable(),
  })
  .strict()
  .passthrough();
const SourceMetadataResponse: z.ZodType<SourceMetadataResponse> = z
  .object({
    object: z.literal('source_metadata'),
    source_metadata: SourceMetadata,
  })
  .strict()
  .passthrough();

export const schemas = {
  DataConnector,
  DataConnectorList,
  DataConnectorFile,
  DataConnectorFileList,
  SourceMetadataResponse,
};

const endpoints = makeApi([
  {
    method: 'get',
    path: '/data-connectors',
    alias: 'listDataConnectors',
    description: `List all active data connectors configured for your account`,
    requestFormat: 'json',
    response: DataConnectorList,
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
    path: '/data-connectors/:id/files',
    alias: 'listDataConnectorFiles',
    description: `Browse files available in a connected data source. Returns URIs compatible with Cloudglue&#x27;s file import system. Supports pagination and provider-specific filtering.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'id',
        type: 'Path',
        schema: z.string().uuid(),
      },
      {
        name: 'limit',
        type: 'Query',
        schema: z.number().int().gte(1).lte(100).optional(),
      },
      {
        name: 'page_token',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'from',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'to',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'folder_id',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'path',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'bucket',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'prefix',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'title_search',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'team',
        type: 'Query',
        schema: z.string().optional(),
      },
      {
        name: 'meeting_type',
        type: 'Query',
        schema: z.string().optional(),
      },
    ],
    response: DataConnectorFileList,
    errors: [
      {
        status: 400,
        description: `Bad request (e.g. missing required bucket parameter, unsupported connector type)`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 404,
        description: `Data connector not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 500,
        description: `An unexpected error occurred on the server`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 502,
        description: `Error communicating with the external service`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'post',
    path: '/data-connectors/:id/sync',
    alias: 'syncDataConnectorFile',
    description: `Materialize a connector URI (e.g. &#x60;grain://recording/&lt;id&gt;&#x60;) into a Cloudglue file without starting a downstream job. Idempotent: syncing the same URI returns the existing file. For Grain, the file&#x27;s &#x60;source_metadata&#x60; is populated from the recording. Plain http(s), TikTok, and Loom URLs are not connector-syncable; ingest those via POST /files/sync instead. YouTube URLs can only be added to a collection via the add-media endpoint.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: z.object({ url: z.string() }).strict().passthrough(),
      },
      {
        name: 'id',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: File,
    errors: [
      {
        status: 400,
        description: `Bad request (e.g. URL source does not match the connector type, or the link points to a folder)`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 403,
        description: `The source file is not accessible (e.g. a login-gated, expired, or restricted Dropbox share link)`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 404,
        description: `Data connector not found, or the referenced file/recording was not found at the source`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 429,
        description: `The external service rate-limited the request (e.g. Dropbox or Zoom); retry shortly`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 500,
        description: `An unexpected error occurred on the server`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 502,
        description: `Error communicating with the external service`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/data-connectors/:id/source-metadata',
    alias: 'getDataConnectorSourceMetadata',
    description: `Fetch source metadata for a connector URI directly from the upstream source, without creating a Cloudglue file. Currently supported for Grain; other connector types return 501.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'id',
        type: 'Path',
        schema: z.string().uuid(),
      },
      {
        name: 'url',
        type: 'Query',
        schema: z.string(),
      },
    ],
    response: SourceMetadataResponse,
    errors: [
      {
        status: 400,
        description: `Bad request (e.g. URL source does not match the connector type)`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 404,
        description: `Data connector not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 501,
        description: `Source metadata lookup is not implemented for this connector type`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 502,
        description: `Error communicating with the external service`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
]);

export const Data_ConnectorsApi = new Zodios(
  'https://api.cloudglue.dev/v1',
  endpoints
);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
