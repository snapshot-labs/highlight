import { Interface } from '@ethersproject/abi';
import { expect, it } from 'vitest';
import { MemoryAdapter } from '../../src/highlight/adapter/memory';
import Agent from '../../src/highlight/agent';
import Highlight from '../../src/highlight/highlight';
import Process from '../../src/highlight/process';
import { PendingUnit } from '../../src/highlight/types';

const PROFILES_ABI = [
  'function setProfile(string user, string metadataURI)',
  'function setStatement(string user, string org, string metadataURI)'
];

const SENDER_ADDRESS = '0x1111111111111111111111111111111111111111';
const PROFILES_ADDRESS = '0x0000000000000000000000000000000000000001';

export const AGENTS_MAP = {
  [PROFILES_ADDRESS]: (process: Process) => {
    return new Profiles('profiles', process, PROFILES_ABI);
  }
};

const profilesInterface = new Interface(PROFILES_ABI);

export default class Profiles extends Agent {
  async set_profile(user: string, metadataURI: string) {
    this.emit('set_profile', [user, metadataURI]);
  }

  async set_statement(user: string, org: string, metadataURI: string) {
    this.emit('set_statement', [user, org, metadataURI]);
  }
}

const adapter = new MemoryAdapter();
const highlight = new Highlight({ adapter, agents: AGENTS_MAP });

it('should handle setProfile', async () => {
  const data = profilesInterface.encodeFunctionData('setProfile', [
    'sekhmet',
    'https://example.com/metadata.json'
  ]);

  const unit: PendingUnit = {
    version: '0x1',
    timestamp: 1744125549,
    senderAddress: SENDER_ADDRESS,
    toAddress: PROFILES_ADDRESS,
    data
  };

  const res = await highlight.postJoint({
    unit
  });

  expect(res).toEqual({
    joint: {
      unit: {
        ...unit,
        id: 0
      }
    },
    events: [
      {
        agent: 'profiles',
        data: ['sekhmet', 'https://example.com/metadata.json'],
        key: 'set_profile'
      }
    ],
    steps: 1,
    unit_id: 1
  });
});

it('should handle setStatement', async () => {
  const data = profilesInterface.encodeFunctionData('setStatement', [
    'sekhmet',
    'snapshot',
    'https://example.com/metadata.json'
  ]);

  const unit: PendingUnit = {
    version: '0x1',
    timestamp: 1744125549,
    senderAddress: SENDER_ADDRESS,
    toAddress: PROFILES_ADDRESS,
    data
  };

  const res = await highlight.postJoint({
    unit
  });

  expect(res).toEqual({
    joint: {
      unit: {
        ...unit,
        id: 1
      }
    },
    events: [
      {
        agent: 'profiles',
        data: ['sekhmet', 'snapshot', 'https://example.com/metadata.json'],
        key: 'set_statement'
      }
    ],
    steps: 1,
    unit_id: 2
  });
});

it('should retrieve unit receipt', async () => {
  const receipt = await highlight.getUnitReceipt({
    id: 1
  });

  expect(receipt).toEqual({
    events: [
      {
        agent: 'profiles',
        data: ['sekhmet', 'https://example.com/metadata.json'],
        key: 'set_profile'
      }
    ],
    unit: {
      data: '0x719e37ae00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000773656b686d657400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002168747470733a2f2f6578616d706c652e636f6d2f6d657461646174612e6a736f6e00000000000000000000000000000000000000000000000000000000000000',
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

  expect(mci).toEqual(2);
});
