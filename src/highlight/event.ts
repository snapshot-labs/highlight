import Process from './process';

export default class Event {
  public agent: string;
  public process: Process;

  constructor(agent: string, process: Process) {
    this.agent = agent;
    this.process = process;
  }

  emit(key: string, data: any[]) {
    this.process.emit({
      agent: this.agent,
      key,
      data
    });
  }
}
