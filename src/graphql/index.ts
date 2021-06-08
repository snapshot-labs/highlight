import path from 'path';
import fs from 'fs';
import { ApolloServer } from 'apollo-server-express';
import { logs, sendToPeers } from '../utils';
import getInstance from '../network';

export const schemaFile = path.join(__dirname, './schema.gql');
export const typeDefs = fs.readFileSync(schemaFile, 'utf8');

export const resolvers = {
  Query: {
    logs: () => {
      return logs;
    }
  },
  Mutation: {
    send: async (parent, { msg }) => {
      const node = getInstance();
      if (node) {
        await sendToPeers(node, node.peerStore.peers, {
          ts: parseInt((Date.now() / 1e3).toFixed()),
          msg: msg || '👋'
        });
      }
      return msg;
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers, tracing: true });

export default server;
