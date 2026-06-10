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
  /** Pagination token for fetching the next page */
  page_token?: string;
  /** Filter by date range start (ISO 8601) */
  from?: string;
  /** Filter by date range end (ISO 8601) */
  to?: string;
  /** Filter by folder ID (Google Drive, Dropbox) */
  folder_id?: string;
  /** Filter by path */
  path?: string;
  /** Filter by bucket name (S3, GCS) */
  bucket?: string;
  /** Filter by key prefix (S3, GCS) */
  prefix?: string;
  /** Filter by title (Grain) */
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
   * Returns URIs compatible with Cloudglue's file import system.
   * Supports pagination and provider-specific filtering.
   *
   * @param connectorId - The ID of the data connector
   * @param params - Optional filtering and pagination parameters
   * @returns Paginated list of files in the data source
   */
  async listFiles(connectorId: string, params: ListDataConnectorFilesParams = {}) {
    return this.api.listDataConnectorFiles({
      params: { id: connectorId },
      queries: params,
    });
  }

  /**
   * Fetch source metadata for a connector URI directly from the upstream
   * source, without creating a Cloudglue file. Currently supported for Grain;
   * other connector types return 501.
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
   * same URI returns the existing file. For Grain, the file's `source_metadata`
   * is populated from the recording.
   *
   * Known https share links are rewritten client-side into connector URIs
   * (e.g. `drive.google.com/file/d/<id>` → `gdrive://file/<id>`). URLs that
   * cannot map to any connector type are rejected before the request is sent.
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
      throw new CloudglueError(
        `URL '${url}' cannot be synced through a data connector` +
          (normalized.source ? ` (classified as '${normalized.source}')` : '') +
          '. Use the URI returned by dataConnectors.listFiles(), or one of these forms per connector type:\n' +
          grammar +
          (normalized.warnings.length
            ? '\n' + normalized.warnings.join('\n')
            : ''),
        400,
      );
    }
    return normalized;
  }
}
