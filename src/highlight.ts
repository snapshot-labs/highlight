import pipe from 'it-pipe';
import { Peer } from 'libp2p/src/peer-store';
import pkg from '../package.json';

export const PROTOCOL = `/${pkg.name}/${pkg.version}`;

export async function handler({ stream, connection }) {
  try {
    await pipe(stream, async function(source) {
      for await (const msg of source) {
        console.info(`Received: ${connection.remotePeer.toB58String().slice(0, 8)}: ${msg}`);
      }
    });
    await pipe([], stream);
  } catch (err) {
    console.error(err);
  }
}

export async function send(msg, stream, peer: Peer) {
  try {
    await pipe([msg], stream);
    console.log(`Sent: ${peer.id.toB58String().slice(0, 8)} ${msg}`);
  } catch (err) {
    console.error(err);
  }
}
