import { TypedDataField } from '@ethersproject/abstract-signer';
import Process from './process';
import { PostMessageRequest } from './types';

export default class Agent {
  public id: string;
  public process: Process;
  public entrypoints: Record<
    string,
    Record<string, TypedDataField[]> | undefined
  > = {};

  constructor(id: string, process: Process) {
    this.id = id;
    this.process = process;
  }

  addEntrypoint(name: string, types: Record<string, TypedDataField[]>) {
    this.entrypoints[name] = types;
  }

  async invoke(request: PostMessageRequest) {
    const { entrypoint, domain, message, signer } = request;

    const entrypointTypes = this.entrypoints[entrypoint];
    if (!entrypointTypes) {
      throw new Error(`Entrypoint not found: ${entrypoint}`);
    }

    const handler = (this as Record<string, any>)[entrypoint];
    if (typeof handler === 'function') {
      return handler.bind(this)(message, { domain, signer });
    }

    throw new Error(`Handler not found: ${entrypoint}`);
  }

  assert(condition: unknown, e: string) {
    if (!condition) throw new Error(e);
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
