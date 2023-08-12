import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rpc from './rpc';
import path from 'path';
import fs from 'fs';
import Checkpoint, { LogLevel } from '@snapshot-labs/checkpoint';
import { HighlightProvider } from './api/provider';
import config from './config.json';
import * as writer from './api/writer';
import relayer from './api/relayer';

const app = express();
const PORT = process.env.PORT || 3000;

const dir = __dirname.endsWith('dist/src') ? '../' : '';
const schemaFile = path.join(__dirname, `${dir}../src/schema.gql`);
const schema = fs.readFileSync(schemaFile, 'utf8');

const checkpoint = new Checkpoint(config, writer, schema, {
  logLevel: LogLevel.Info,
  prettifyLogs: process.env.NODE_ENV !== 'production',
  NetworkProvider: HighlightProvider,
  fetchInterval: 5e2,
  dbConnection: process.env.API_DATABASE_URL
});

async function start() {
  await checkpoint.reset();
  // await checkpoint.resetMetadata();
  await checkpoint.start();
}

start();

app.use(express.json({ limit: '4mb' }));
app.use(express.urlencoded({ limit: '4mb', extended: false }));
app.use(cors({ maxAge: 86400 }));
app.use('/highlight', rpc);
app.use('/relayer', relayer);
app.use('/', checkpoint.graphql);

app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}`));
