import { SitesApi } from '../../generated';
import { schemas } from '../../generated/Sites';
import z from 'zod';

/** One registered (site, route) unfurl preview, as stored. */
export type SiteRoutePreview = z.infer<typeof schemas.SiteRoutePreview>;

/** One entry of a replace call: a route plus its preview card and hero. */
export type SiteRoutePreviewInput = z.infer<
  typeof schemas.SiteRoutePreviewInput
>;

/**
 * Sites: per-route unfurl previews for published sites.
 *
 * Every page of a published site (e.g. a clip page like `#/clip/intro`) can
 * register its own preview: card overrides (`previewTitle`,
 * `previewDescription`, `previewImageUrl`), a hero share (`previewShareId` —
 * what the Cloudglue Slack app plays when a link to that page is unfurled),
 * and an optional `startSeconds`/`endSeconds` window so the unfurled player
 * plays exactly that clip. Links to routes with no registered preview fall
 * back to the site-level preview fields.
 *
 * Routes are stored and matched in canonical form: hash-router prefixes
 * (`#/`), query strings, and surrounding slashes are stripped, so
 * `/clip/intro`, `clip/intro/`, and `#/clip/intro` all name the same route.
 *
 * The set is replaced wholesale by {@link replaceSiteRoutePreviews} —
 * typically written by the same pipeline that publishes the site.
 */
export class EnhancedSitesApi {
  constructor(private readonly api: typeof SitesApi) {}

  /** List the site's per-route unfurl previews, ordered by route. */
  async listSiteRoutePreviews(siteId: string) {
    return this.api.listSiteRoutePreviews({ params: { site_id: siteId } });
  }

  /**
   * Replace the site's complete set of per-route unfurl previews; an empty
   * array clears them all. Heroes must be same-account video shares (public
   * shares when the site is public); `startSeconds`/`endSeconds` come as a
   * pair with `endSeconds > startSeconds`.
   */
  async replaceSiteRoutePreviews(
    siteId: string,
    previews: SiteRoutePreviewInput[],
  ) {
    return this.api.replaceSiteRoutePreviews(
      { previews },
      { params: { site_id: siteId } },
    );
  }

  /**
   * Delete one route preview. Links to that route fall back to the
   * site-level preview fields.
   */
  async deleteSiteRoutePreview(siteId: string, previewId: string) {
    return this.api.deleteSiteRoutePreview(undefined, {
      params: { site_id: siteId, preview_id: previewId },
    });
  }
}
