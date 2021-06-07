import Libp2p from 'libp2p';
import { Peer } from 'libp2p/src/peer-store';
import { PROTOCOL, send } from './highlight';

export async function sendToPeer(node, peer: Peer, msg) {
  const connection = node.connectionManager.get(peer.id);
  if (connection && peer.protocols.includes(PROTOCOL)) {
    try {
      const { stream } = await connection.newStream([PROTOCOL]);
      await send(msg, stream, peer);
    } catch (e) {
      console.error(e);
    }
  }
}

export async function sendToPeers(node: Libp2p, peers: Map<string, Peer>, msg) {
  const peersArr: Peer[] = [];
  for (const [, peer] of peers.entries()) {
    peersArr.push(peer);
  }
  await Promise.all(peersArr.map(peer => sendToPeer(node, peer, msg)));
}
