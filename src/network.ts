import Libp2p from 'libp2p';
import PeerId from 'peer-id';
import createLibP2P from './libp2p';
import { PROTOCOL, handler } from './highlight';

let libp2p: Libp2p;
const peerIdPrivKey = process.env.PEER_ID_PRIV_KEY || '';

(async () => {
  let peerId: PeerId | undefined = undefined;
  if (peerIdPrivKey) peerId = await PeerId.createFromPrivKey(peerIdPrivKey);

  libp2p = await createLibP2P({ peerId });
  libp2p.handle(PROTOCOL, handler);

  libp2p.on('peer:discovery', peerId => {
    console.log(`Found peer ${peerId.toB58String()}`);
  });

  // Listen for new connections to peers
  libp2p.connectionManager.on('peer:connect', connection => {
    console.log(`Connected to ${connection.remotePeer.toB58String()}`);
  });

  // Listen for peers disconnecting
  libp2p.connectionManager.on('peer:disconnect', connection => {
    console.log(`Disconnected from ${connection.remotePeer.toB58String()}`);
  });

  await libp2p.start();
})();

export default function getInstance() {
  return libp2p;
}
