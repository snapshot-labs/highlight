import PeerId from 'peer-id';
import Highlight from './highlight';

const peerIdPrivKey = process.env.PEER_ID_PRIV_KEY || '';
let highlight;

(async () => {
  let peerId: PeerId | undefined = undefined;
  if (peerIdPrivKey) peerId = await PeerId.createFromPrivKey(peerIdPrivKey);
  highlight = new Highlight(peerId);
  await highlight.init();
  await highlight.start();
})();

export default highlight;
