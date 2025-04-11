import { BaseWriterParams } from '@snapshot-labs/checkpoint';
import { Unit } from '../../highlight/types';

export type Writer = (
  args: {
    unit: Unit;
    payload: any;
  } & BaseWriterParams
) => Promise<void>;
