import { getAddress } from '@ethersproject/address';
import { keccak256 } from '@ethersproject/keccak256';
import {
  parse as parseTransaction,
  recoverAddress,
  serialize
} from '@ethersproject/transactions';
import express from 'express';
import { AGENTS_MAP } from './agents';
import { lastIndexedMci } from './api/indexer/provider';
import { RedisAdapter } from './highlight/adapter/redis';
import Highlight from './highlight/highlight';
import { computeUnitHash, rpcError, rpcSuccess, sleep } from './utils';

const DATABASE_URL = process.env.DATABASE_URL || '';

const LAST_BLOCK_NUMBER = '0x1';

const adapter = new RedisAdapter({ url: DATABASE_URL });
export const highlight = new Highlight({ adapter, agents: AGENTS_MAP });
highlight.reset().then(() => console.log('Highlight reset complete'));

const router = express.Router();

router.post('/', async (req, res) => {
  const { id, params, method } = req.body;

  switch (method) {
    case 'hl_getMci': {
      try {
        const result = await highlight.getMci();

        return rpcSuccess(res, result, id);
      } catch (e) {
        return rpcError(res, 500, -32000, e, id);
      }
    }

    case 'hl_getEvents': {
      try {
        const result = await highlight.getEvents(params);

        return rpcSuccess(res, result, id);
      } catch (e) {
        return rpcError(res, 500, -32000, e, id);
      }
    }

    case 'hl_getUnitReceipt': {
      try {
        const result = await highlight.getUnitReceipt(params);

        return rpcSuccess(res, result, id);
      } catch (e) {
        console.log('e', e);
        return rpcError(res, 500, -32000, e, id);
      }
    }

    // ETH RPC
    case 'eth_getBlockByNumber': {
      return rpcSuccess(
        res,
        {
          hash: '0xc7ffa60cafcdc0ddda8022fbda89675097fc0ede9af1bb12448efe756dd035ff',
          parentHash:
            '0xc7ffa60cafcdc0ddda8022fbda89675097fc0ede9af1bb12448efe756dd035ff',
          timestamp: '0x0',
          nonce: '0x0000000000000000',
          difficulty: '0x0',
          gasLimit: '0x0',
          gasUsed: '0x0',
          miner: '0xf8acdcb5fc3689e63c0d8033ebd986d9d3f29ed4',
          extraData: '0x',
          transactions: [],
          baseFeePerGas: '0x0',
          number: LAST_BLOCK_NUMBER
        },
        id
      );
    }

    case 'eth_getTransactionCount': {
      const address = getAddress(params[0]);
      const count = (await adapter.get(`sender_txs_count:${address}`)) || 0;

      return rpcSuccess(res, `0x${count.toString(16)}`, id);
    }

    case 'eth_gasPrice': {
      return rpcSuccess(res, '0x0', id);
    }

    case 'eth_estimateGas': {
      return rpcSuccess(res, '0x0', id);
    }

    case 'eth_blockNumber': {
      return rpcSuccess(res, LAST_BLOCK_NUMBER, id);
    }

    case 'eth_sendRawTransaction': {
      const [rawTransaction] = params;

      const tx = parseTransaction(rawTransaction);
      if (
        !tx.hash ||
        tx.to === undefined ||
        tx.r === undefined ||
        tx.s === undefined ||
        tx.v === undefined
      ) {
        return rpcError(res, 500, -32003, 'invalid transaction', id);
      }

      const count = (await adapter.get(`sender_txs_count:${tx.from}`)) || 0;
      if (tx.nonce !== count) {
        return rpcError(
          res,
          500,
          -32000,
          `the tx doesn't have the correct nonce. account has nonce of: ${count} tx has nonce of: ${tx.nonce}`,
          id
        );
      }

      const txData = {
        type: tx.type,
        chainId: tx.chainId,
        nonce: tx.nonce,
        maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
        maxFeePerGas: tx.maxFeePerGas,
        gasLimit: tx.gasLimit,
        to: tx.to,
        value: tx.value,
        data: tx.data
      };
      const signature = {
        r: tx.r,
        s: tx.s,
        v: tx.v
      };

      const serializedTx = serialize(txData);
      const recoveredAddress = recoverAddress(
        keccak256(serializedTx),
        signature
      );

      if (recoveredAddress !== tx.from) {
        return rpcError(res, 500, -32003, 'invalid transaction', id);
      }

      try {
        const unit = {
          unit_hash: '',
          version: '0x1',
          timestamp: ~~(Date.now() / 1e3),
          sender_address: tx.from,
          txData,
          signature
        };
        unit.unit_hash = computeUnitHash(unit);

        const result = await highlight.postJoint({ unit });

        while ((result?.last_event_id as number) > lastIndexedMci) {
          await sleep(1e2);
        }

        return rpcSuccess(res, result.joint.unit.unit_hash, id);
      } catch (e) {
        console.log(e);
        return rpcError(res, 500, -32000, e, id);
      }
    }

    default: {
      return rpcError(res, 404, -32601, 'requested method not found', id);
    }
  }
});

export default router;
