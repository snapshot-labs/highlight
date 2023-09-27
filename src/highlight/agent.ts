import Process from './process';

export default class Agent {
  public id: string;
  public process: Process;

  constructor(id: string, process: Process) {
    this.id = id;
    this.process = process;
  }

  assert(condition, e) {
    if (condition) throw new Error(e);
  }

  async has(key: string) {
    return await this.process.has(this.id, key);
  }

  async get(key: string): Promise<any> {
    return await this.process.get(this.id, key);
  }

  write(key: string, value: any) {
    this.process.write({
      agent: this.id,
      key,
      value
    });
  }

  delete(key: string) {
    this.process.delete({
      agent: this.id,
      key
    });
  }

  emit(key: string, data: any[]) {
    this.process.emit({
      agent: this.id,
      key,
      data
    });
  }
}
