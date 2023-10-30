import express from 'express';
import { keccak256 } from '@ethersproject/keccak256';
import { parse as parseTransaction, recoverAddress, serialize } from '@ethersproject/transactions';
import Highlight from './highlight/highlight';
import { RedisAdapter } from './highlight/adapter/redis';
import { AGENTS_MAP } from './agents';
import { lastIndexedMci } from './api/provider';
import { rpcSuccess, rpcError, sleep, computeUnitHash } from './utils';

const DATABASE_URL = process.env.DATABASE_URL || '';

const LAST_BLOCK_NUMBER = '0x1';

const adapter = new RedisAdapter({ url: DATABASE_URL });
export const highlight = new Highlight({ adapter, agents: AGENTS_MAP });
// highlight.reset().then(() => console.log('Highlight reset complete'));

const router = express.Router();

router.post('/', async (req, res) => {
  const { id, params, method } = req.body;

  switch (method) {
    case 'post_joint': {
      console.log('New joint');

      try {
        const result = await highlight.postJoint(params);

        return rpcSuccess(res, result, id);
      } catch (e) {
        console.log(e);
        return rpcError(res, 500, -32000, e, id);
      }
    }

    case 'get_mci': {
      try {
        const result = await highlight.getMci();

        return rpcSuccess(res, result, id);
      } catch (e) {
        return rpcError(res, 500, -32000, e, id);
      }
    }

    case 'get_events': {
      try {
        const result = await highlight.getEvents(params);

        return rpcSuccess(res, result, id);
      } catch (e) {
        return rpcError(res, 500, -32000, e, id);
      }
    }

    case 'get_unit_receipt': {
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
          parentHash: '0xc7ffa60cafcdc0ddda8022fbda89675097fc0ede9af1bb12448efe756dd035ff',
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
      return rpcSuccess(res, '0x0', id);
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
      const recoveredAddress = recoverAddress(keccak256(serializedTx), signature);

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
