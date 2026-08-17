import { Data_ConnectorsApi } from '../../generated';
import { CloudglueError } from '../error';
import {
  CONNECTOR_SYNC_URI_GRAMMAR,
  NormalizedVideoUrl,
  normalizeVideoUrl,
} from '../url-utils';

/** URL sources that can be synced through a data connector */
const CONNECTOR_SOURCES = new Set(Object.keys(CONNECTOR_SYNC_URI_GRAMMAR));

export interface ListDataConnectorFilesParams {
  /** Maximum number of files to return (1-100) */
  limit?: number;
  /**
   * Pagination token for fetching the next page. Tokens are only valid with
   * the same filter parameters they were issued under.
   */
  page_token?: string;
  /**
   * Start date filter (YYYY-MM-DD, inclusive UTC day bound). Supported by
   * Grain, Zoom, Recall, Google Drive, Dropbox, Gong, and Iconik (Zoom and
   * Gong default to a 6-month lookback when omitted); ignored for S3/GCS.
   */
  from?: string;
  /** End date filter (YYYY-MM-DD). Same per-connector support as `from`. */
  to?: string;
  /** Filter by folder ID (Google Drive) */
  folder_id?: string;
  /** Folder path to list contents of, default root (Dropbox) */
  path?: string;
  /**
   * Dropbox only: `'true'` lists the whole subtree under `path` (or the whole
   * account when no `path` is given) instead of its direct children. Ignored
   * by every other connector. Built for bulk metadata imports; interactive
   * browsing should stay non-recursive.
   */
  recursive?: 'true' | 'false';
  /** Filter by bucket name — required for S3 and GCS */
  bucket?: string;
  /** Filter by key prefix (S3, GCS) */
  prefix?: string;
  /**
   * Case-insensitive title filter. Supported by Grain, Zoom, Google Drive,
   * Dropbox, Gong, and Iconik (full-text title search); ignored for Recall
   * (no title available when listing) and S3/GCS.
   */
  title_search?: string;
  /** Filter by team (Grain) */
  team?: string;
  /** Filter by meeting type (Grain) */
  meeting_type?: string;
}

export class EnhancedDataConnectorsApi {
  constructor(private readonly api: typeof Data_ConnectorsApi) {}

  async list() {
    return this.api.listDataConnectors();
  }

  /**
   * Browse files available in a connected data source.
   * Returns URIs compatible with Cloudglue's file import system, plus
   * per-file provider metadata (the `metadata` field) so you can inspect
   * participants, hosts, durations, and AI summaries before importing.
   *
   * Supports pagination and filtering; parameters a connector can't honor
   * are silently ignored. When filters are applied, a page may contain fewer
   * than `limit` items — even zero — while `has_more` is still true: keep
   * paginating until `next_page_token` is null rather than stopping at the
   * first short or empty page.
   *
   * @param connectorId - The ID of the data connector
   * @param params - Optional filtering and pagination parameters
   * @returns Paginated list of files in the data source
   */
  async listFiles(
    connectorId: string,
    params: ListDataConnectorFilesParams = {},
  ) {
    return this.api.listDataConnectorFiles({
      params: { id: connectorId },
      queries: params,
    });
  }

  /**
   * Fetch source metadata for a connector URI directly from the upstream
   * source, without creating a Cloudglue file. Supported for Grain, Zoom,
   * Recall, Google Drive, Dropbox, Gong, and Iconik; S3/GCS return 501
   * (plain object stores have no richer metadata). Returns 502 when the
   * upstream provider's response can't be validated.
   *
   * @param connectorId - The ID of the data connector
   * @param url - Connector URI to look up (must match the connector's type)
   * @returns The source metadata for the URI
   */
  async getSourceMetadata(connectorId: string, url: string) {
    return this.api.getDataConnectorSourceMetadata({
      params: { id: connectorId },
      queries: { url: normalizeVideoUrl(url).url },
    });
  }

  /**
   * Materialize a connector URI (e.g. `grain://recording/<id>`) into a
   * Cloudglue file without starting a downstream job. Idempotent: syncing the
   * same URI returns the existing file. For Grain, Zoom, Recall, Google
   * Drive, Dropbox, Gong, and Iconik the file's `source_metadata` is
   * populated from the provider.
   *
   * Known https share links are rewritten client-side into connector URIs
   * (e.g. `drive.google.com/file/d/<id>` → `gdrive://file/<id>`), and some
   * pass through for server-side resolution via the connector's OAuth:
   * Dropbox file share links (`dropbox.com/scl/fi/...`, `/s/...` — works for
   * login-gated files) and Zoom `rec/share` links (best-effort: Zoom often
   * mints a new share token per copy; `zoom.us/recording/detail?meeting_id=`
   * links are the reliable form). URLs that cannot map to any connector type
   * are rejected before the request is sent.
   *
   * @param connectorId - The ID of the data connector
   * @param url - Connector URI to sync (must match the connector's type)
   * @returns The resulting Cloudglue file
   */
  async syncFile(connectorId: string, url: string) {
    const normalized = this.normalizeForSync(url);
    return this.api.syncDataConnectorFile(
      { url: normalized.url },
      { params: { id: connectorId } },
    );
  }

  /**
   * Sync a URL without specifying a connector. The URL is normalized and
   * classified client-side (known https share links are rewritten, e.g.
   * `drive.google.com/file/d/<id>` → `gdrive://file/<id>`), then synced
   * through the account's oldest data connector of the matching type.
   *
   * @param url - Connector URI or rewritable share link to sync
   * @returns The resulting Cloudglue file
   * @throws {CloudglueError} If the URL cannot map to a connector type, or no
   *   connector of the matching type exists on the account
   */
  async syncUrl(url: string) {
    const normalized = this.normalizeForSync(url);
    const connectors = await this.list();
    const matching = connectors.data.filter(
      (connector) => connector.type === normalized.source,
    );
    if (matching.length === 0) {
      throw new CloudglueError(
        `No '${normalized.source}' data connector found on this account for URL '${url}'. Connect one, or use dataConnectors.syncFile(connectorId, url) with an explicit connector.`,
        404,
      );
    }
    const oldest = matching.reduce((a, b) =>
      b.created_at < a.created_at ? b : a,
    );
    return this.api.syncDataConnectorFile(
      { url: normalized.url },
      { params: { id: oldest.id } },
    );
  }

  /**
   * Normalize a URL for the sync endpoint, rejecting URLs that cannot map to
   * any connector type before a request is sent.
   */
  private normalizeForSync(url: string): NormalizedVideoUrl {
    const normalized = normalizeVideoUrl(url);
    if (!normalized.source || !CONNECTOR_SOURCES.has(normalized.source)) {
      const grammar = Object.entries(CONNECTOR_SYNC_URI_GRAMMAR)
        .map(([type, form]) => `  ${type}: ${form}`)
        .join('\n');
      const hint =
        normalized.source === 'youtube'
          ? 'YouTube URLs can only be added to a collection — use collections.addMediaByUrl().'
          : 'Publicly accessible URLs (direct media URLs, public Dropbox share links, TikTok, Loom) can be synced into a file without a connector via files.syncFromUrl().';
      throw new CloudglueError(
        `URL '${url}' cannot be synced through a data connector` +
          (normalized.source ? ` (classified as '${normalized.source}')` : '') +
          '. Use the URI returned by dataConnectors.listFiles(), or one of these forms per connector type:\n' +
          grammar +
          '\n' +
          hint +
          (normalized.warnings.length
            ? '\n' + normalized.warnings.join('\n')
            : ''),
        400,
      );
    }
    return normalized;
  }
}
