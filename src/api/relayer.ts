import express from 'express';
import { lastIndexedMci } from './provider';
import { rpcSuccess, sleep } from './utils';
import { highlight } from '../rpc';

const router = express.Router();

async function relay(messages) {
  return await highlight.postJoint({
    unit: {
      version: '0x1',
      messages,
      timestamp: ~~(Date.now() / 1e3),
      signature: ''
    }
  });
}

router.post('/', async (req, res) => {
  const { body } = req;

  const result = await relay(body.params.messages);

  while ((result as number) > lastIndexedMci) {
    await sleep(1e2);
  }

  return rpcSuccess(res, result, body.id);
});

export default router;
