import path from 'path';
import fs from 'fs';
import Checkpoint, { LogLevel } from '@snapshot-labs/checkpoint';
import { HighlightProvider } from './provider';
import config from './config.json';
import * as writer from './writer';

const dir = __dirname.endsWith('dist/src/api') ? '../' : '';
const schemaFile = path.join(__dirname, `${dir}../api/schema.gql`);
const schema = fs.readFileSync(schemaFile, 'utf8');

export const checkpoint = new Checkpoint(config, writer, schema, {
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
