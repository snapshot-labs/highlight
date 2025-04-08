import { BaseProvider, BlockNotFoundError } from '@snapshot-labs/checkpoint';
import { Writer } from './types';
import { Event } from '../../highlight/types';
import { highlight } from '../../rpc';

export let lastIndexedMci = 0;

export class HighlightProvider extends BaseProvider {
  private readonly writers: Record<string, Writer>;

  constructor({
    instance,
    log,
    abis,
    writers
  }: ConstructorParameters<typeof BaseProvider>[0] & {
    writers: Record<string, Writer>;
  }) {
    super({ instance, log, abis });

    this.writers = writers;
  }

  async getNetworkIdentifier() {
    return 'highlight';
  }

  async init() {
    return;
  }

  async getLatestBlockNumber() {
    return highlight.getMci();
  }

  formatAddresses(addresses: string[]): string[] {
    return addresses;
  }

  async processBlock(blockNumber: number) {
    let events: Event[];
    let lastMci: number;
    try {
      const endBlockNum = blockNumber + 10;
      events = await highlight.getEvents({
        start: blockNumber,
        end: endBlockNum
      });

      lastMci = events[events.length - 1].id;
    } catch {
      throw new BlockNotFoundError();
    }

    try {
      await this.handleBlock(blockNumber, events);
      await this.instance.setLastIndexedBlock(lastMci);
    } catch (e) {
      console.log('error when handling block', e);
      throw e;
    }

    lastIndexedMci = lastMci;

    return lastMci + 1;
  }

  private async handleBlock(blockNumber: number, events: Event[]) {
    this.log.info({ blockNumber }, 'handling block');

    for (const event of events) {
      await this.handleEvent(blockNumber, event);
    }

    this.log.debug({ blockNumber }, 'handling block done');
  }

  private async handleEvent(blockNumber: number, event: Event) {
    this.log.debug({ msgIndex: event.id }, 'handling event');

    const helpers = this.instance.getWriterHelpers();

    for (const source of this.instance.config.sources || []) {
      for (const sourceEvent of source.events) {
        if (source.contract === event.agent && sourceEvent.name === event.key) {
          this.log.info(
            {
              contract: source.contract,
              event: sourceEvent.name,
              handlerFn: sourceEvent.fn
            },
            'found event'
          );

          await this.writers[sourceEvent.fn]({
            source,
            blockNumber,
            payload: event,
            helpers
          });
        }
      }
    }

    this.log.debug({ msgIndex: event.id }, 'handling event done');
  }
}
