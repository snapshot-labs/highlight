import express from 'express';
import { lastIndexedMci } from './api/indexer/provider';
import Highlight from './highlight/highlight';
import { rpcError, rpcSuccess, sleep } from './utils';

export default function createRpc(highlight: Highlight) {
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

      case 'hl_getUnitReceipt': {
        try {
          const result = await highlight.getUnitReceipt(params);

          return rpcSuccess(res, result, id);
        } catch (e) {
          console.log('e', e);
          return rpcError(res, 500, -32000, e, id);
        }
      }

      case 'hl_postMessage': {
        try {
          const result = await highlight.postMessage(params);

          while (result.unit_id > lastIndexedMci) {
            await sleep(1e2);
          }

          return rpcSuccess(res, result, id);
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

  return router;
}
