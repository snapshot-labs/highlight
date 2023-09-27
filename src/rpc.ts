import express from 'express';
import { BigNumberish, ec, hash, selector } from 'starknet';
import * as weierstrass from '@noble/curves/abstract/weierstrass';
import Highlight from './highlight/highlight';
import { RedisAdapter } from './highlight/adapter/redis';
import agents from './agents';
import { lastIndexedMci } from './api/provider';
import { rpcSuccess, rpcError, sleep } from './utils';

const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY || '0x1234567890987654321';
const RELAYER_PUBLIC_KEY = process.env.RELAYER_PUBLIC_KEY || '0x1234567890987654321';
const DATABASE_URL = process.env.DATABASE_URL || '';

const adapter = new RedisAdapter({ url: DATABASE_URL });
export const highlight = new Highlight({ adapter, agents });
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

    case 'get_events': {
      try {
        const result = await highlight.getEvents(params);

        return rpcSuccess(res, result, id);
      } catch (e) {
        return rpcError(res, 500, -32000, e, id);
      }
    }

    default: {
      return rpcError(res, 404, -32601, 'requested method not found', id);
    }
  }
});

router.post('/relayer', async (req, res) => {
  const { body } = req;

  const joint = {
    unit: {
      unit_hash: '',
      version: '0x1',
      messages: body.params.messages,
      timestamp: ~~(Date.now() / 1e3),
      sender_address: RELAYER_PUBLIC_KEY,
      signature: ''
    }
  };
  const unitRaw: any = structuredClone(joint.unit);
  delete unitRaw.unit_hash;
  delete unitRaw.signature;

  const data: BigNumberish[] = [selector.starknetKeccak(JSON.stringify(unitRaw))];
  const unitHash = hash.computeHashOnElements(data);
  const signature: weierstrass.SignatureType = ec.starkCurve.sign(unitHash, RELAYER_PRIVATE_KEY);

  joint.unit.unit_hash = unitHash;
  joint.unit.signature = signature.toCompactHex();

  try {
    const result = await highlight.postJoint(joint);

    while ((result?.last_event_id as number) > lastIndexedMci) {
      await sleep(1e2);
    }

    return rpcSuccess(res, result, body.id);
  } catch (e) {
    return rpcError(res, 500, -32000, e, body.id);
  }
});

export default router;
