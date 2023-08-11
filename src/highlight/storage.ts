import db from './helpers/mysql';
import Process from './process';

export default class Storage {
  public agent: string;
  public process: Process;

  constructor(agent: string, process: Process) {
    this.agent = agent;
    this.process = process;
  }

  async has(key: string) {
    return await this.process.hasStorage(this.agent, key);
  }

  async read(key: string): Promise<string | boolean | number> {
    return await this.process.readStorage(this.agent, key);
  }

  write(key: string, type: string, value: string) {
    this.process.writeStorage({
      agent: this.agent,
      key,
      type,
      value
    });

    return true;
  }

  async remove(key: string) {
    const query = 'DELETE FROM storages WHERE agent = ? AND `key` = ? LIMIT 1';

    await db.queryAsync(query, [this.agent, key]);

    return true;
  }
}
