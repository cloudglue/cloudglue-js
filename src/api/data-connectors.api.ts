import { Data_ConnectorsApi } from '../../generated';

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
      queries: { url },
    });
  }

  /**
   * Materialize a connector URI (e.g. `grain://recording/<id>`) into a
   * Cloudglue file without starting a downstream job. Idempotent: syncing the
   * same URI returns the existing file. For Grain, the file's `source_metadata`
   * is populated from the recording.
   *
   * @param connectorId - The ID of the data connector
   * @param url - Connector URI to sync (must match the connector's type)
   * @returns The resulting Cloudglue file
   */
  async syncFile(connectorId: string, url: string) {
    return this.api.syncDataConnectorFile(
      { url },
      { params: { id: connectorId } },
    );
  }
}
