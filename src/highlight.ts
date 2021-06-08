import pipe from 'it-pipe';
import { Peer } from 'libp2p/src/peer-store';
import pkg from '../package.json';
import { log } from './utils';

export const PROTOCOL = `/${pkg.name}/${pkg.version}`;

export async function handler({ stream, connection }) {
  try {
    await pipe(stream, async function(source) {
      for await (const msg of source) {
        const str = Buffer.from(msg.toString(), 'base64').toString('utf8');
        console.info(`Received: ${connection.remotePeer.toB58String().slice(0, 8)}: ${str}`);
      }
    });
    await pipe([], stream);
  } catch (err) {
    console.error(err);
  }
}

export async function send(msg, stream, peer: Peer) {
  try {
    const msgStr = JSON.stringify(msg);
    await pipe([Buffer.from(msgStr).toString('base64')], stream);
    log(`Sent: ${peer.id.toB58String().slice(0, 8)} ${msgStr}`);
  } catch (err) {
    console.error(err);
  }
}
