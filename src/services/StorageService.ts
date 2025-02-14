import { Storage } from '@ionic/storage';

class StorageService {
  private storage: Storage | null = null;

  async initialize() {
    this.storage = new Storage();
    await this.storage.create();
  }

  async getData(key: string): Promise<any> {
    return this.storage ? await this.storage.get(key) : null;
  }

  async setData(key: string, data: any): Promise<void> {
    if (this.storage) {
      await this.storage.set(key, data);
    }
  }
}

export default new StorageService();
