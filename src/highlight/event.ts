import Process from './process';

export default class Event {
  public agent: string;
  public process: Process;

  constructor(agent: string, process: Process) {
    this.agent = agent;
    this.process = process;
  }

  emit(key: string, data: any[]) {
    this.process.emitEvent({
      agent: this.agent,
      key,
      events: JSON.stringify(data)
    });

    return true;
  }
}
