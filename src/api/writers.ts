import { Writer } from './indexer/types';
import { Alias } from '../../.checkpoint/models';

export function createWriters(indexerName: string) {
  const handleSetAlias: Writer = async ({ payload }) => {
    const id = `${payload.data[0]}:${payload.data[1]}`;

    const alias = new Alias(id, indexerName);
    alias.address = payload.data[0];
    alias.alias = payload.data[1];

    await alias.save();
  };

  return { handleSetAlias };
}
