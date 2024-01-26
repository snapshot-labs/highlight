import { Interface } from '@ethersproject/abi';
import * as changeCase from 'change-case';
import Process from './process';

export default class Agent {
  public id: string;
  public process: Process;
  public iface: Interface;

  constructor(id: string, process: Process, fragments: ConstructorParameters<typeof Interface>[0]) {
    this.id = id;
    this.process = process;
    this.iface = new Interface(fragments);
  }

  invoke(data: string) {
    const parsed = this.iface.parseTransaction({ data });

    const handlerName = changeCase.snakeCase(parsed.name);
    const parsedArgs = parsed.args.map(arg => {
      if (arg._isBigNumber) {
        return arg.toNumber();
      }

      return arg;
    });

    return this[handlerName](...parsedArgs);
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

  createEntity(type: string, id: string | number) {
    this.write(`owner.${type}.${id}`, this.process.from);
    this.emit(type, [id.toString(), this.process.from]);
  }

  async hasPermissionOnEntity(type: string, id: string | number) {
    const owner = await this.get(`owner.${type}.${id}`);
    return owner === this.process.from;
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
