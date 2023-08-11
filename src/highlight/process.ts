import db from './helpers/mysql';

export default class Process {
  public events: Record<string, string>[] = [];
  public storageWrites: Record<string, string>[] = [];
  public storageState: Record<string, Record<string, string>> = {};

  emitEvent(event: Record<string, string>) {
    this.events.push(event);
  }

  async getStorage(agent: string, key: string) {
    let storage = this.storageState[`${agent}/${key}`];

    if (!storage) {
      const query = 'SELECT `value`, `type` FROM storages WHERE agent = ? AND `key` = ?';

      [storage] = await db.queryAsync(query, [agent, key]);
    }

    return storage;
  }

  async hasStorage(agent: string, key: string) {
    return !!(await this.getStorage(agent, key));
  }

  async readStorage(agent: string, key: string) {
    const storage = await this.getStorage(agent, key);

    if (storage.type === 'number') return parseInt(storage.value);
    if (storage.type === 'bool') return !!parseInt(storage.value);

    return storage.value;
  }

  writeStorage(storage: Record<string, string>) {
    this.storageWrites.push(storage);
    this.storageState[`${storage.agent}/${storage.key}`] = {
      type: storage.type,
      value: storage.value
    };
  }

  async execute() {
    // @TODO change to single MySQL transaction

    let query = '';
    const params: any[] = [];

    const connection = await db.getConnectionAsync();
    await connection.beginTransactionAsync();

    if (this.storageWrites.length > 0) {
      for (const write of this.storageWrites) {
        query += 'INSERT INTO storages SET ? ON DUPLICATE KEY UPDATE value = ?;';
        params.push(write, write.value);
      }
    }

    if (this.events.length > 0) {
      for (const event of this.events) {
        query += 'INSERT INTO events SET ?;';
        params.push(event);
      }
    }

    await db.queryAsync(query, params);
  }
}
