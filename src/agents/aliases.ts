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
  async setAlias(from: string, alias: string, salt: bigint, signature: string) {
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

    const saltAlreadyUsed = await this.has(`salts:${salt}`);
    this.assert(saltAlreadyUsed === false, 'Salt already used');

    this.write(`salts:${salt}`, true);
    this.emit('setAlias', [from, alias, `0x${salt.toString(16)}`]);
  }
}
