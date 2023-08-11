import express from 'express';
import Highlight from './highlight/highlight';
import agents from './agents';
import { rpcSuccess, rpcError } from './utils';

const highlight = new Highlight({ agents });
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

export default router;
