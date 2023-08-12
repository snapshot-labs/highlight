import Process from './process';

export default class Storage {
  public agent: string;
  public process: Process;

  constructor(agent: string, process: Process) {
    this.agent = agent;
    this.process = process;
  }

  async has(key: string) {
    return await this.process.has(this.agent, key);
  }

  async get(key: string): Promise<any> {
    return await this.process.get(this.agent, key);
  }

  write(key: string, value: any) {
    this.process.write({
      agent: this.agent,
      key,
      value
    });
  }
}
