# Sites API

Per-route unfurl previews for published Cloudglue sites. Every page of a published site (e.g. a clip page like `#/clip/intro`) can register its own preview: a card (title, description, image), a **hero share** that the Cloudglue Slack app plays when a link to that page is unfurled, and an optional **clip window** so the unfurled player plays exactly that clip. Links to routes with no registered preview fall back to the site-level preview fields.

> The sites API beyond route previews (creating and publishing sites) is not yet part of the public SDK surface.

## Replace the Set

`replaceSiteRoutePreviews` replaces the site's **complete** set — it's derived from site content, so the pipeline that publishes the site typically just PUTs the current set. An empty array clears all route previews.

```typescript
const { previews } = await client.sites.replaceSiteRoutePreviews(siteId, [
  {
    route: '#/clip/intro-to-x/',        // stored canonically as 'clip/intro-to-x'
    previewShareId: shareId,            // the route's hero: a same-account video share
    previewTitle: 'Intro to X',
    previewDescription: 'The two-minute version',
    startSeconds: 12.5,                 // optional clip window (both-or-neither,
    endSeconds: 47,                     //  end > start; fractional allowed)
  },
  { route: '/clip/deep-dive', previewShareId: otherShareId },
]);
```

Routes are stored and matched in **canonical form**: hash-router prefixes (`#/`), query strings, and surrounding slashes are stripped, so `/clip/intro`, `clip/intro/`, and `#/clip/intro` all name the same route. A route that is empty after canonicalization (the site root) is rejected — the root unfurls with the site-level preview fields.

Validation (400/404):

- Duplicate canonical routes in one call
- `previewShareId` not a video share in this account (404, names the route)
- A private hero on a **public** site (public sites require public heroes)
- `startSeconds` without `endSeconds`, or a backwards window

Card fields fall back per-field to the hero share's own title (then filename), description, and thumbnail when unset. `previewImageUrl` must be a publicly fetchable URL (e.g. a share's `preview_url`) — site asset URLs sit behind the private-site gate and won't render in unfurls.

## Clip Window Precision

The window is served with Mux instant clipping, which trims at the asset's HLS segment boundaries — start rounds down, end rounds up, so the served stream can be up to one segment wider per side than `[startSeconds, endSeconds]`. The poster still shows the exact `startSeconds` frame.

## List and Delete

```typescript
const { previews } = await client.sites.listSiteRoutePreviews(siteId);
// ordered by route; each carries id, canonical route, card fields (null when
// unset), previewShareId, startSeconds/endSeconds, createdAt/updatedAt

const deleted = await client.sites.deleteSiteRoutePreview(siteId, previewId);
// links to that route fall back to the site-level preview at their next unfurl
```

Deleting the hero **share** itself also reverts its routes to the site-level unfurl (the preview rows are removed with it).
