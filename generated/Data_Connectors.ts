import { makeApi, Zodios, type ZodiosOptions } from '@zodios/core';
import { z } from 'zod';

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
  type: 's3' | 'dropbox' | 'google-drive' | 'zoom' | 'gong' | 'recall' | 'gcs';
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

export const schemas = {
  DataConnector,
  DataConnectorList,
  DataConnectorFile,
  DataConnectorFileList,
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
]);

export const Data_ConnectorsApi = new Zodios(
  'https://api.cloudglue.dev/v1',
  endpoints
);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
