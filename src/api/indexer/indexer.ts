import { BaseIndexer, Instance } from '@snapshot-labs/checkpoint';
import { Logger as PinoLogger } from 'pino';
import { HighlightProvider } from './provider';
import { Writer } from './types';

type Logger = Omit<PinoLogger, 'trace'>;

export class HighlightIndexer extends BaseIndexer {
  private writers: Record<string, Writer>;

  constructor(writers: Record<string, Writer>) {
    super();
    this.writers = writers;
  }

  init({
    instance,
    log,
    abis
  }: {
    instance: Instance;
    log: Logger;
    abis?: Record<string, any>;
  }) {
    this.provider = new HighlightProvider({
      instance,
      log,
      abis,
      writers: this.writers
    });
  }

  public getHandlers(): string[] {
    return Object.keys(this.writers);
  }
}
