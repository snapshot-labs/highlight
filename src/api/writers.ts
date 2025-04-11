import { z } from 'zod';
import { Writer } from './indexer/types';
import { Alias } from '../../.checkpoint/models';

const SetAliasEventData = z.tuple([
  z.string(), // from
  z.string(), // to
  z.string() // salt
]);

export function createWriters(indexerName: string) {
  const handleSetAlias: Writer = async ({ unit, payload }) => {
    const [from, to] = SetAliasEventData.parse(payload.data);

    const alias = new Alias(`${from}:${to}`, indexerName);
    alias.address = from;
    alias.alias = to;
    alias.created = unit.timestamp;

    await alias.save();
  };

  return { handleSetAlias };
}
