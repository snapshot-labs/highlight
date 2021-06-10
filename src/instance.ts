import PeerId from 'peer-id';
import Highlight from './highlight';

const LIBP2P_PEER_ID_PRIV_KEY = process.env.LIBP2P_PEER_ID_PRIV_KEY || '';
let highlight: Highlight;

(async () => {
  let peerId: PeerId | undefined = undefined;
  if (LIBP2P_PEER_ID_PRIV_KEY) peerId = await PeerId.createFromPrivKey(LIBP2P_PEER_ID_PRIV_KEY);
  highlight = new Highlight(peerId);
  await highlight.init();
  await highlight.start();
})();

// @ts-ignore
export default highlight;
