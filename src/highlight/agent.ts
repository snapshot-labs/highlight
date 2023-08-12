import Storage from './storage';
import Event from './event';
import Process from './process';

export default class Agent {
  public id: string;
  public process: Process;
  public storage: Storage;
  public event: Event;

  constructor(id: string, process: Process) {
    this.id = id;
    this.process = process;
    this.storage = new Storage(id, process);
    this.event = new Event(id, process);
  }
}
