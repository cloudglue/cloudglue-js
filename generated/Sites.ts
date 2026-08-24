import { makeApi, Zodios, type ZodiosOptions } from '@zodios/core';
import { z } from 'zod';

type SiteRoutePreviewList = {
  previews: Array<SiteRoutePreview>;
};
type SiteRoutePreview = {
  id: string;
  route: string;
  previewTitle?: (string | null) | undefined;
  previewDescription?: (string | null) | undefined;
  previewImageUrl?: (string | null) | undefined;
  previewShareId: string;
  startSeconds?: (number | null) | undefined;
  endSeconds?: (number | null) | undefined;
  createdAt: string;
  updatedAt: string;
};
type ReplaceSiteRoutePreviewsRequest = {
  previews: Array<SiteRoutePreviewInput>;
};
type SiteRoutePreviewInput = {
  route: string;
  previewTitle?: string | undefined;
  previewDescription?: string | undefined;
  previewImageUrl?: string | undefined;
  previewShareId: string;
  startSeconds?: number | undefined;
  endSeconds?: number | undefined;
};

const SiteRoutePreview: z.ZodType<SiteRoutePreview> = z
  .object({
    id: z.string().uuid(),
    route: z.string().max(512),
    previewTitle: z.string().nullish(),
    previewDescription: z.string().max(1000).nullish(),
    previewImageUrl: z.string().url().nullish(),
    previewShareId: z.string().uuid(),
    startSeconds: z.number().gte(0).nullish(),
    endSeconds: z.number().nullish(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .strict()
  .passthrough();
const SiteRoutePreviewList: z.ZodType<SiteRoutePreviewList> = z
  .object({ previews: z.array(SiteRoutePreview) })
  .strict()
  .passthrough();
const SiteRoutePreviewInput: z.ZodType<SiteRoutePreviewInput> = z
  .object({
    route: z.string().max(512),
    previewTitle: z.string().optional(),
    previewDescription: z.string().max(1000).optional(),
    previewImageUrl: z.string().url().optional(),
    previewShareId: z.string().uuid(),
    startSeconds: z.number().gte(0).optional(),
    endSeconds: z.number().optional(),
  })
  .strict()
  .passthrough();
const ReplaceSiteRoutePreviewsRequest: z.ZodType<ReplaceSiteRoutePreviewsRequest> =
  z
    .object({ previews: z.array(SiteRoutePreviewInput).max(1000) })
    .strict()
    .passthrough();

export const schemas = {
  SiteRoutePreview,
  SiteRoutePreviewList,
  SiteRoutePreviewInput,
  ReplaceSiteRoutePreviewsRequest,
};

const endpoints = makeApi([
  {
    method: 'get',
    path: '/sites/:site_id/route-previews',
    alias: 'listSiteRoutePreviews',
    description: `List the site&#x27;s per-route unfurl previews, ordered by route.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'site_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: SiteRoutePreviewList,
    errors: [
      {
        status: 404,
        description: `Site not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'put',
    path: '/sites/:site_id/route-previews',
    alias: 'replaceSiteRoutePreviews',
    description: `Replace the site&#x27;s complete set of per-route unfurl previews. Each entry maps a route within the site (e.g. a clip page) to its own preview card and hero share, so links to that page unfurl distinctly in Slack instead of with the site-wide hero. An optional startSeconds/endSeconds window makes the unfurled player serve only that segment of the hero (trimmed at the asset’s HLS segment boundaries — see the field descriptions). The set is replaced wholesale — typically written by the same pipeline that publishes the site — and an empty array clears all route previews. Routes are stored in canonical form: hash-router prefixes (&#x27;#/&#x27;), query strings, and surrounding slashes are stripped, so &#x27;/clip/intro&#x27;, &#x27;clip/intro/&#x27;, and &#x27;#/clip/intro&#x27; all name the same route. Links to routes with no registered preview fall back to the site-level preview fields.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `The site&#x27;s complete set of route previews`,
        type: 'Body',
        schema: ReplaceSiteRoutePreviewsRequest,
      },
      {
        name: 'site_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: SiteRoutePreviewList,
    errors: [
      {
        status: 400,
        description: `Invalid route previews (empty or duplicate canonical routes, non-video heroes, private heroes on a public site, or an invalid clip window)`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
      {
        status: 404,
        description: `Site not found, or a previewShareId does not reference a share in this account`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
  {
    method: 'delete',
    path: '/sites/:site_id/route-previews/:preview_id',
    alias: 'deleteSiteRoutePreview',
    description: `Delete one route preview. Links to that route fall back to the site-level preview fields at their next unfurl.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'site_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
      {
        name: 'preview_id',
        type: 'Path',
        schema: z.string().uuid(),
      },
    ],
    response: SiteRoutePreview,
    errors: [
      {
        status: 404,
        description: `Site or route preview not found`,
        schema: z.object({ error: z.string() }).strict().passthrough(),
      },
    ],
  },
]);

export const SitesApi = new Zodios('https://api.cloudglue.dev/v1', endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
