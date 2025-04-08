import { BaseWriterParams } from '@snapshot-labs/checkpoint';

export type Writer = (
  args: {
    block: any;
    payload: any;
  } & Omit<BaseWriterParams, 'blockNumber'>
) => Promise<void>;
