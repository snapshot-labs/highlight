import Agent from '../highlight/agent';
import { verifySignature } from './utils/eip712';

export const SET_ALIAS_TYPES = {
  Alias: [
    { name: 'from', type: 'address' },
    { name: 'alias', type: 'address' },
    { name: 'salt', type: 'uint256' }
  ]
};
export default class Aliases extends Agent {
  async setAlias(from: string, alias: string, salt: string, signature: string) {
    const recoveredAddress = await verifySignature(
      SET_ALIAS_TYPES,
      {
        from,
        alias,
        salt
      },
      signature
    );

    this.assert(recoveredAddress === from, 'Invalid signature');

    this.emit('setAlias', []);
  }
}
