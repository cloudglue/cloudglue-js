import { Data_ConnectorsApi } from '../../generated';

export class EnhancedDataConnectorsApi {
  constructor(private readonly api: typeof Data_ConnectorsApi) {}

  async list() {
    return this.api.listDataConnectors();
  }
}
