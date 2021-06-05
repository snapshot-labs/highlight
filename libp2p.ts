import Libp2p from 'libp2p';
import WebSockets from 'libp2p-websockets';
import WebRtcStar from 'libp2p-webrtc-star';
import { NOISE } from 'libp2p-noise';
import Mplex from 'libp2p-mplex';
import wrtc from 'wrtc';

export default () => {
  const transportKey = WebRtcStar.prototype[Symbol.toStringTag];
  return Libp2p.create({
    modules: {
      transport: [WebSockets, WebRtcStar],
      connEncryption: [NOISE],
      streamMuxer: [Mplex]
    },
    addresses: {
      listen: [
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
}
