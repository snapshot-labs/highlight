import { BaseWriterParams } from '@snapshot-labs/checkpoint';

export type Writer = (
  args: {
    payload: any;
  } & BaseWriterParams
) => Promise<void>;
