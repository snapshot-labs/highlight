import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import bodyParser from 'body-parser';
import { logs, sendToPeers } from './utils';
import getInstance from './network';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: '8mb' }));
app.use(bodyParser.urlencoded({ limit: '8mb', extended: false }));
app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}`));

app.get('/send', async (req, res) => {
  const node = getInstance();
  if (!node) return res.json({ error: true });

  const msg = {
    ts: parseInt((Date.now() / 1e3).toFixed()),
    msg: req.query.msg || '👋'
  };

  try {
    await sendToPeers(node, node.peerStore.peers, msg);
  } catch (e) {
    console.error('send failed', e);
  }
  return res.json(msg);
});

app.all('/*', (req, res) => {
  res.json(logs);
});
