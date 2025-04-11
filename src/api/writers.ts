import { Writer } from './indexer/types';
import { Alias } from '../../.checkpoint/models';

export function createWriters(indexerName: string) {
  const handleSetAlias: Writer = async ({ unit, payload }) => {
    const [from, to] = payload.data;

    const alias = new Alias(`${from}:${to}`, indexerName);
    alias.address = from;
    alias.alias = to;
    alias.created = unit.timestamp;

    await alias.save();
  };

  return { handleSetAlias };
}
