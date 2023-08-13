import express from 'express';
import Highlight from './highlight/highlight';
import agents from './agents';
import { rpcSuccess, rpcError, sleep } from './utils';
import { lastIndexedMci } from './api/provider';

export const highlight = new Highlight({ agents });
// highlight.reset();

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

  const result = await highlight.postJoint({
    unit: {
      version: '0x1',
      messages: body.params.messages,
      timestamp: ~~(Date.now() / 1e3),
      signature: ''
    }
  });

  while ((result as number) > lastIndexedMci) {
    await sleep(1e2);
  }

  return rpcSuccess(res, result, body.id);
});

export default router;
