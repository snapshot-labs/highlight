import express from 'express';
import highlight from './instance';
import ingestor from './highlight/ingestor';

const router = express.Router();

router.post('/message', async (req, res) => {
  if (!highlight.running) return res.status(500);

  const body = req.body;
  console.log('Received from API', body);

  try {
    await ingestor(body);
  } catch (e) {
    return res.status(500);
  }

  // Gossip to peers
  await highlight.sendAll(body);

  return res.json({ success: true });
});

export default router;
