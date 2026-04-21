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
}
