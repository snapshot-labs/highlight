import Agent from '../highlight/agent';
import Process from '../highlight/process';
import { Domain } from '../highlight/types';

export const SET_ALIAS_TYPES = {
  Alias: [
    { name: 'from', type: 'address' },
    { name: 'alias', type: 'address' }
  ]
};

export default class Aliases extends Agent {
  constructor(id: string, process: Process) {
    super(id, process);

    this.addEntrypoint('setAlias', SET_ALIAS_TYPES);
  }

  async setAlias(
    message: { from: string; alias: string },
    meta: { domain: Domain }
  ) {
    const { salt } = meta.domain;
    const { from, alias } = message;

    const aliasAlreadyExists = await this.has(`aliases:${from}-${alias}`);
    this.assert(aliasAlreadyExists === false, 'Alias already exists');

    this.write(`salts:${salt}`, true);
    this.write(`aliases:${from}-${alias}`, true);
    this.emit('setAlias', [from, alias, salt]);
  }
}
