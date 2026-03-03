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

export const schemas = {
  DataConnector,
  DataConnectorList,
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
]);

export const Data_ConnectorsApi = new Zodios(
  'https://api.cloudglue.dev/v1',
  endpoints
);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
