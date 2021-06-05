import createLibP2P from './libp2p';
import { PROTOCOL, handler, send } from './protocol';

(async () => {
	const node = await createLibP2P();
  node.handle(PROTOCOL, handler);
	await node.start();

  setInterval(async () => {
    const msg = JSON.stringify({
      id: (Math.random() * 1e5).toFixed(),
      timestamp: (Date.now() / 1e3).toFixed()
    });
    await sendMsgToPeers(node, node.peerStore.peers, msg);
  }, 30e3);
})();

async function sendMsg(node, peer, msg) {
  console.log(`Send: ${msg}, to ${peer.id.toString().slice(0, 24)}`);
  const connection = node.connectionManager.get(peer.id);
  if (connection && peer.protocols.includes(PROTOCOL)) {
    const { stream } = await connection.newStream([PROTOCOL]);
    await send(msg, stream);
  }
}

async function sendMsgToPeers(node, peers, msg) {
  const peersArr: any = [];
  for (const [, peer] of peers.entries()) peersArr.push(peer);
  await Promise.all(peersArr.map((peer) => sendMsg(node, peer, msg)));
}
