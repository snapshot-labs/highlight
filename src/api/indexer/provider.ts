import { BaseProvider } from '@snapshot-labs/checkpoint/dist/src/providers';
import { Writer } from './types';
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

  async processBlock(blockNum: number) {
    let block, lastMci;
    try {
      const endBlockNum = blockNum + 10;
      block = await highlight.getEvents({ start: blockNum, end: endBlockNum });
      lastMci = block.slice(-1)[0].id;
    } catch {
      this.log.error(
        { blockNumber: blockNum, err: 'empty block' },
        'getting block failed... retrying'
      );

      throw 'empty block';
    }

    try {
      await this.handleBlock(block);
      await this.instance.setLastIndexedBlock(lastMci);
    } catch (e) {
      console.log('error when handling block', e);
      throw e;
    }

    lastIndexedMci = lastMci;

    return lastMci + 1;
  }

  private async handleBlock(block) {
    this.log.info({ blockNumber: block.number }, 'handling block');

    for (const [, event] of block.entries()) {
      await this.handleEvent(block, event);
    }

    this.log.debug({ blockNumber: block.number }, 'handling block done');
  }

  private async handleEvent(block, event) {
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
            block,
            payload: event,
            helpers
          });
        }
      }
    }

    this.log.debug({ msgIndex: event.id }, 'handling event done');
  }
}
