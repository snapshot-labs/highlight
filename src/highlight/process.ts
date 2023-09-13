import redis from './redis';
import { Storage, Event } from './types';

export default class Process {
  public events: Event[] = [];
  public writes: Storage[] = [];
  public state: Record<string, Record<string, string>> = {};
  public steps = 0;

  emit(event: Event) {
    this.events.push(event);
  }

  async get(agent: string, key: string) {
    const storage = this.state[`${agent}:${key}`];
    if (storage) return storage;

    this.steps++;
    const value = await redis.get(`state:${agent}:${key}`);

    return JSON.parse(value as string);
  }

  async has(agent: string, key: string) {
    this.steps++;
    return !!(await this.get(agent, key));
  }

  write(storage: Storage) {
    this.writes.push(storage);
    this.state[`${storage.agent}:${storage.key}`] = storage.value;
  }

  delete(storage: Storage) {
    this.writes.push(storage);
    delete this.state[`${storage.agent}:${storage.key}`];
  }

  async execute() {
    const multi = redis.multi();

    if (this.writes.length > 0) {
      for (const write of this.writes) {
        if (write.value === undefined) {
          multi.del(`state:${write.agent}:${write.key}`);
        } else {
          multi.set(`state:${write.agent}:${write.key}`, JSON.stringify(write.value));
        }
      }
    }

    let id = 0;
    if (this.events.length > 0) {
      this.steps++;
      id = parseInt((await redis.get('events:id')) || '0');

      for (const event of this.events) {
        id++;
        event.id = id;
        multi.set(`event:${id}`, JSON.stringify(event));
      }
      multi.set('events:id', id);
    }

    if (this.writes.length > 0 || this.events.length > 0) {
      this.steps++;
      await multi.exec();
    }

    return {
      last_event_id: id,
      events: this.events
    };
  }
}
