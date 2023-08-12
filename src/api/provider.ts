import { BaseProvider } from '@snapshot-labs/checkpoint/dist/src/providers';
import { highlight } from '../rpc';

export let lastIndexedMci = 0;

export class HighlightProvider extends BaseProvider {
  constructor({ instance, log, abis }: ConstructorParameters<typeof BaseProvider>[0]) {
    super({ instance, log, abis });
  }

  async getNetworkIdentifier() {
    return 'highlight';
  }

  async processBlock(blockNum: number) {
    let block, lastMci;
    try {
      const endBlockNum = blockNum + 10;
      block = await highlight.getEvents({ start: blockNum, end: endBlockNum });
      lastMci = block.slice(-1)[0].id;
    } catch (e) {
      this.log.error(
        { blockNumber: blockNum, err: 'empty block' },
        'getting block failed... retrying'
      );

      throw 'empty block';
    }

    await this.handleBlock(block);
    await this.instance.setLastIndexedBlock(lastMci);

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

    const writerParams = await this.instance.getWriterParams();

    for (const source of this.instance.config.sources || []) {
      for (const sourceEvent of source.events) {
        if (sourceEvent.name === event.key) {
          this.log.info(
            { contract: source.contract, event: sourceEvent.name, handlerFn: sourceEvent.fn },
            'found event'
          );

          await this.instance.writer[sourceEvent.fn]({
            source,
            block,
            // @ts-ignore
            payload: event,
            ...writerParams
          });
        }
      }
    }

    this.log.debug({ msgIndex: event.id }, 'handling event done');
  }
}
