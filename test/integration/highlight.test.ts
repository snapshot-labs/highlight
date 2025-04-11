import { Interface } from '@ethersproject/abi';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';
import { describe, expect, it } from 'vitest';
import { AGENTS_MAP } from '../../src/agents';
import AliasesAbi from '../../src/agents/abis/aliases.json';
import { SET_ALIAS_TYPES } from '../../src/agents/aliases';
import { signMessage } from '../../src/agents/utils/eip712';
import { MemoryAdapter } from '../../src/highlight/adapter/memory';
import Highlight from '../../src/highlight/highlight';
import { PendingUnit } from '../../src/highlight/types';

const PRIVATE_KEY =
  '0x6e8d65443b59362a32762cf8409b5ba307f64ee9db4a3d0cff00fbdf49d0d2d6';
const SENDER_ADDRESS = '0x1111111111111111111111111111111111111111';
const ALIASES_ADDRESS = '0x0000000000000000000000000000000000000001';
const FAKE_SIGNATURE =
  '0x9a40ce5d706efe66cdc1b9075b866ba25385bf083bbc19b7e1ce315ac2a3957f3a6e075762f6f4723006889ed341ce740e023959f6c600e30586f005f5afa64a1c';

const provider = new StaticJsonRpcProvider('https://rpc.snapshot.org/11155111');
const adapter = new MemoryAdapter();
const highlight = new Highlight({ adapter, agents: AGENTS_MAP });
const wallet = new Wallet(PRIVATE_KEY, provider);
const aliasesInterface = new Interface(AliasesAbi);

async function getUnit(
  message: {
    from: string;
    alias: string;
    salt: string;
  },
  opts: { useFakeSignature?: boolean } = {}
): Promise<PendingUnit> {
  const signature = opts.useFakeSignature
    ? FAKE_SIGNATURE
    : await signMessage(wallet, SET_ALIAS_TYPES, message);

  const data = aliasesInterface.encodeFunctionData('setAlias', [
    message.from,
    message.alias,
    message.salt,
    signature
  ]);

  return {
    version: '0x1',
    timestamp: 1744125549,
    senderAddress: SENDER_ADDRESS,
    toAddress: ALIASES_ADDRESS,
    data
  };
}

describe('setAlias', () => {
  it('should emit event', async () => {
    const message = {
      from: await wallet.getAddress(),
      alias: '0x556B14CbdA79A36dC33FcD461a04A5BCb5dC2A70',
      salt: '0x0'
    };

    const unit = await getUnit(message);
    const res = await highlight.postJoint({ unit });

    expect(res).toEqual({
      joint: {
        unit: {
          ...unit,
          id: 0
        }
      },
      events: [
        {
          agent: 'aliases',
          data: [message.from, message.alias, message.salt],
          key: 'setAlias'
        }
      ],
      steps: 5,
      unit_id: 1
    });
  });

  it('should throw when salt is reused', async () => {
    const message = {
      from: await wallet.getAddress(),
      alias: '0x537f1896541d28F4c70116EEa602b1B34Da95163',
      salt: '0x0'
    };

    const unit = await getUnit(message);

    await expect(highlight.postJoint({ unit })).rejects.toThrow(
      'Salt already used'
    );
  });

  it('should throw when alias is reused', async () => {
    const message = {
      from: await wallet.getAddress(),
      alias: '0x556B14CbdA79A36dC33FcD461a04A5BCb5dC2A70',
      salt: '0x1'
    };

    const unit = await getUnit(message);

    await expect(highlight.postJoint({ unit })).rejects.toThrow(
      'Alias already exists'
    );
  });

  it('should throw when signature is invalid', async () => {
    const message = {
      from: await wallet.getAddress(),
      alias: '0x537f1896541d28F4c70116EEa602b1B34Da95163',
      salt: '0x1'
    };

    const unit = await getUnit(message, { useFakeSignature: true });

    await expect(highlight.postJoint({ unit })).rejects.toThrow(
      'Invalid signature'
    );
  });
});

it('should retrieve unit receipt', async () => {
  const receipt = await highlight.getUnitReceipt({
    id: 1
  });

  expect(receipt).toEqual({
    events: [
      {
        agent: 'aliases',
        data: [
          '0x15Bb65c57Fc440f3aC4FBeEC68137b084416474b',
          '0x556B14CbdA79A36dC33FcD461a04A5BCb5dC2A70',
          '0x0'
        ],
        key: 'setAlias'
      }
    ],
    unit: {
      data: '0xb0dd584800000000000000000000000015bb65c57fc440f3ac4fbeec68137b084416474b000000000000000000000000556b14cbda79a36dc33fcd461a04a5bcb5dc2a70000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000041f7379a6ec3a1dd0b99fd3caf0efb7187bb0a53b02951b660bf33ecbf857f73f62bb13ba5e8752cf1b7554d673e3b91e700d4d9637c605066f77eed46dd55698c1c00000000000000000000000000000000000000000000000000000000000000',
      id: 0,
      senderAddress: '0x1111111111111111111111111111111111111111',
      timestamp: 1744125549,
      toAddress: '0x0000000000000000000000000000000000000001',
      version: '0x1'
    }
  });
});

it('should retrieve MCI', async () => {
  const mci = await highlight.getMci();

  expect(mci).toEqual(1);
});
