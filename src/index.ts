import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import bodyParser from 'body-parser';
import { logs, sendToPeers } from './utils';
import getInstance from './network';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: '8mb' }));
app.use(bodyParser.urlencoded({ limit: '8mb', extended: false }));

const resolvers = {
  Query: {
    hello: () => logs
  }
};
const schemaFile = path.join(__dirname, './graphql/schema.gql');
const typeDefs = fs.readFileSync(schemaFile, 'utf8');

const server = new ApolloServer({ typeDefs, resolvers, tracing: true });
server.applyMiddleware({ app });

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

app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}`));
