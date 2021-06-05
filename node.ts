import Libp2p from 'libp2p';
import WebSockets from 'libp2p-websockets';
import WebRtcStar from 'libp2p-webrtc-star';
import { NOISE } from 'libp2p-noise';
import Mplex from 'libp2p-mplex';
import wrtc from 'wrtc';
import { PROTOCOL, handler, send } from './protocol';

(async () => {
	const transportKey = WebRtcStar.prototype[Symbol.toStringTag];

	const node = await Libp2p.create({
		modules: {
			transport: [WebSockets, WebRtcStar],
			connEncryption: [NOISE],
			streamMuxer: [Mplex]
		},
		addresses: {
			listen: [
				'/ip4/127.0.0.1/tcp/8000/ws',
				'/dns4/p2p-webrtc-star.herokuapp.com/tcp/443/wss/p2p-webrtc-star/'
			]
		},
		config: {
			transport: {
				[transportKey]: {
					wrtc
				}
			}
		}
	});

  node.handle(PROTOCOL, handler);

	// start libp2p
	await node.start();

	const advertiseAddrs = node.multiaddrs;
	console.log('libp2p is advertising the following addresses: ', advertiseAddrs);

	const message = 'Hi!';

  // Send message to other peers (connected) using the protocol
  node.peerStore.peers.forEach(async (peer) => {
    if (!peer.protocols.includes(PROTOCOL)) return
    const connection = node.connectionManager.get(peer.id)
    if (!connection) return

    try {
      const { stream } = await connection.newStream([PROTOCOL])
      await send(message, stream)
    } catch (err) {
      console.error('Could not negotiate kickoff protocol stream with peer', err)
    }
  })

	// stop libp2p
	// await node.stop();
})();
