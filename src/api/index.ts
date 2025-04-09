import fs from 'fs';
import path from 'path';
import Checkpoint, { LogLevel } from '@snapshot-labs/checkpoint';
import config from './config.json';
import { HighlightIndexer } from './indexer';
import overrides from './overrides.json';

const dir = __dirname.endsWith('dist/src/api') ? '../' : '';
const schemaFile = path.join(__dirname, `${dir}../../src/api/schema.gql`);
const schema = fs.readFileSync(schemaFile, 'utf8');

if (process.env.CA_CERT) {
  process.env.CA_CERT = process.env.CA_CERT.replace(/\\n/g, '\n');
}

export const checkpoint = new Checkpoint(schema, {
  logLevel: LogLevel.Fatal,
  prettifyLogs: process.env.NODE_ENV !== 'production',
  dbConnection: process.env.API_DATABASE_URL,
  overridesConfig: overrides
});

const highlightIndexer = new HighlightIndexer({});
checkpoint.addIndexer('highlight', config, highlightIndexer);

async function start() {
  await checkpoint.reset();
  await checkpoint.resetMetadata();
  console.log('Checkpoint ready');

  await checkpoint.start();
}

start();
