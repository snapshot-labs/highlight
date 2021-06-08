import { ApolloServer } from 'apollo-server-express';
import { logs, sendToPeers } from '../utils';
import path from 'path';
import fs from 'fs';
import getInstance from '../network';

export const schemaFile = path.join(__dirname, './schema.gql');
export const typeDefs = fs.readFileSync(schemaFile, 'utf8');

export const resolvers = {
  Query: {
    hello: async () => {
      const node = getInstance();
      if (node) {
        const msg = {
          ts: parseInt((Date.now() / 1e3).toFixed()),
          msg: '👋'
        };

        try {
          await sendToPeers(node, node.peerStore.peers, msg);
        } catch (e) {
          console.error('send failed', e);
        }
      }
      return logs;
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers, tracing: true });

export default server;
