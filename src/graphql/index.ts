import path from 'path';
import fs from 'fs';
import { ApolloServer } from 'apollo-server-express';
import { logs } from '../utils';
import highlight from '../instance';

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
      if (highlight.libp2p) {
        await highlight.sendToPeers({
          ts: parseInt((Date.now() / 1e3).toFixed()),
          msg: msg || '👋'
        });
      }
      return msg;
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  tracing: true,
  playground: {
    // @ts-ignore
    shareEnabled: true
  }
});

export default server;
