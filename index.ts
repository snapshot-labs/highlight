import Libp2p from 'libp2p';
import WebSockets from 'libp2p-websockets';
import WebRtcStar from 'libp2p-webrtc-star';
import { NOISE } from 'libp2p-noise';
import MPLEX from 'libp2p-mplex';
import wrtc from 'wrtc';

(async () => {
	const transportKey = WebRtcStar.prototype[Symbol.toStringTag];

	const node = await Libp2p.create({
		modules: {
			transport: [WebSockets, WebRtcStar],
			connEncryption: [NOISE],
			streamMuxer: [MPLEX]
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

	// start libp2p
	await node.start();

	const advertiseAddrs = node.multiaddrs;
	console.log('libp2p is advertising the following addresses: ', advertiseAddrs);

	// stop libp2p
	await node.stop();
})();
