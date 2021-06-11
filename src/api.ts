import express from 'express';
import highlight from './instance';
import { isValid } from './highlight/validate';

const router = express.Router();

router.post('/message', async (req, res) => {
  const body = req.body;
  console.log('Message', body);

  if (!highlight.running) {
    console.log('not running');
    return res.status(500).json({
      error: 'unauthorized',
      error_description: 'ops!'
    });
  }

  // @TODO check format

  if (!(await isValid(body.address, body.sig, body.data))) {
    console.log('wrong signature');
    return Promise.reject();
  }

  await highlight.sendAll(body);

  return res.json({ success: true });
});

export default router;
