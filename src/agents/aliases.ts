import Agent from '../highlight/agent';
import { verifySignature } from './utils/eip712';

export const SET_ALIAS_TYPES = {
  Alias: [
    { name: 'from', type: 'address' },
    { name: 'alias', type: 'address' }
  ]
};
export default class Aliases extends Agent {
  async setAlias(
    chainId: string,
    salt: string,
    from: string,
    alias: string,
    signature: string
  ) {
    const recoveredAddress = await verifySignature(
      chainId,
      salt,
      SET_ALIAS_TYPES,
      {
        from,
        alias
      },
      signature
    );
    this.assert(recoveredAddress === from, 'Invalid signature');

    const saltAlreadyUsed = await this.has(`salts:${salt}`);
    this.assert(saltAlreadyUsed === false, 'Salt already used');

    const aliasAlreadyExists = await this.has(`aliases:${from}-${alias}`);
    this.assert(aliasAlreadyExists === false, 'Alias already exists');

    this.write(`salts:${salt}`, true);
    this.write(`aliases:${from}-${alias}`, true);
    this.emit('setAlias', [from, alias, salt]);
  }
}
