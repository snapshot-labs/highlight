import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';
import { expect, it } from 'vitest';
import { MemoryAdapter } from '../highlight/adapter/memory';
import Process from '../highlight/process';
import AliasesAbi from './abis/aliases.json';
import Aliases, { SET_ALIAS_TYPES } from './aliases';
import { signMessage } from './utils/eip712';

const provider = new StaticJsonRpcProvider('https://rpc.snapshot.org/11155111');
const adapter = new MemoryAdapter();
const wallet = getWallet();

function getWallet() {
  const wallet = Wallet.createRandom({
    provider: provider
  });

  return new Wallet(wallet.privateKey, provider);
}

function getSalt() {
  const buffer = new Uint8Array(32);
  crypto.getRandomValues(buffer);

  return `0x${buffer.reduce((acc, val) => acc + val.toString(16).padStart(2, '0'), '')}`;
}

it('should allow alias if signature is valid', async () => {
  const process = new Process({ adapter });
  const aliases = new Aliases('aliases', process, AliasesAbi);

  const from = await wallet.getAddress();

  const message = {
    from,
    alias: '0x556B14CbdA79A36dC33FcD461a04A5BCb5dC2A70',
    salt: getSalt()
  };

  const signature = await signMessage(wallet, SET_ALIAS_TYPES, message);

  await expect(
    aliases.setAlias(from, message.alias, message.salt, signature)
  ).resolves.toBeUndefined();

  expect(process.events).toMatchInlineSnapshot([
    {
      agent: 'aliases',
      data: [
        '0x8E2E3A9077712A1Ce072F95f1DDe62210dd0A0EC',
        '0x556B14CbdA79A36dC33FcD461a04A5BCb5dC2A70'
      ],
      key: 'setAlias'
    }
  ]);
});

it('should throw if signature is invalid', async () => {
  const process = new Process({ adapter });
  const aliases = new Aliases('aliases', process, AliasesAbi);

  const from = await wallet.getAddress();

  const message = {
    from,
    alias: '0x556B14CbdA79A36dC33FcD461a04A5BCb5dC2A70',
    salt: getSalt()
  };

  const signature =
    '0x8b44096237326cc5e9c67f6c847a46f8715945d216269d63e6bc09712d91ba7b48e8ceef2d1c62b37debeda708e6bd1f0a5d5822cd88273830599e51d9d8b78c1b';

  await expect(
    aliases.setAlias(from, message.alias, message.salt, signature)
  ).rejects.toThrow('Invalid signature');

  expect(process.events).toHaveLength(0);
});

it('should throw if salt is reused', async () => {
  const process = new Process({ adapter });
  const aliases = new Aliases('aliases', process, AliasesAbi);

  const from = await wallet.getAddress();

  const message = {
    from,
    alias: '0x556B14CbdA79A36dC33FcD461a04A5BCb5dC2A70',
    salt: getSalt()
  };

  const signature = await signMessage(wallet, SET_ALIAS_TYPES, message);

  await expect(
    aliases.setAlias(from, message.alias, message.salt, signature)
  ).resolves.toBeUndefined();

  expect(process.events).toHaveLength(1);

  await expect(
    aliases.setAlias(from, message.alias, message.salt, signature)
  ).rejects.toThrow('Salt already used');

  expect(process.events).toHaveLength(1);
});
