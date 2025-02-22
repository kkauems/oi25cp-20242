import { Storage } from '@ionic/storage';

export interface BDProps {
  accessCode: string;
  accountCode: string;
}

class StorageService {
  private storage: Storage | null = null;

  async initialize() {
    this.storage = new Storage();
    await this.storage.create();
  }

  async getData(key: string): Promise<BDProps[]> {
    return this.storage ? await this.storage.get(key) || [] : [];
  }

  async setData(key: string, data: BDProps[]): Promise<void> {
    if (this.storage) {
      await this.storage.set(key, data);
    }
  }
}

export default new StorageService();
