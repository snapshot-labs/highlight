import { Adapter, Multi } from './adapter';

class MemoryMulti extends Multi {
  private adapter: Adapter;
  private actions: any[];

  constructor({ adapter }) {
    super();
    this.adapter = adapter;
    this.actions = [];
  }

  set(key: string, value: any) {
    this.actions.push(['set', key, value]);
  }

  del(key: string) {
    this.actions.push(['del', key]);
  }

  // @ts-ignore
  exec() {
    this.actions.forEach(action => {
      if (action[0] === 'set') {
        this.adapter.set(action[1], action[2]);
      } else if (action[0] === 'del') {
        this.adapter.del(action[1]);
      }
    });
    this.actions = [];
  }
}

export class MemoryAdapter extends Adapter {
  private state = {};

  // @ts-ignore
  set(key: string, value: any) {
    this.state[key] = value;
  }

  get(key: string) {
    return this.state[key] === undefined ? null : this.state[key];
  }

  // @ts-ignore
  mget(keys: string[]) {
    return keys.map(key => this.get(key));
  }

  // @ts-ignore
  del(key: string) {
    delete this.state[key];
  }

  // @ts-ignore
  reset() {
    this.state = {};
  }

  // @ts-ignore
  multi() {
    return new MemoryMulti({ adapter: this });
  }
}
