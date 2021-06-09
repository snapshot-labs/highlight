import Libp2p from 'libp2p';
import PeerId from 'peer-id';
import pipe from 'it-pipe';
import { Peer } from 'libp2p/src/peer-store';
import createLibP2P from '../utils/libp2p';
import { log } from '../utils';
import pkg from '../../package.json';

export default class Index {
  public procotol = `/${pkg.name}/${pkg.version}`;
  public libp2p?: Libp2p;
  public peerId: PeerId;
  public running = false;

  constructor(peerId) {
    this.peerId = peerId;
  }

  async init() {
    this.libp2p = await createLibP2P({ peerId: this.peerId });
    this.libp2p.handle(this.procotol, this.handler);
    this.libp2p.on('peer:discovery', this.onPeerDiscovery);
    this.libp2p.connectionManager.on('peer:connect', this.onPeerConnect);
    this.libp2p.connectionManager.on('peer:disconnect', this.onPeerDisconnect);
  }

  async handler({ stream, connection }) {
    try {
      await pipe(stream, async function(source) {
        for await (const msg of source) {
          const str = Buffer.from(msg.toString(), 'base64').toString('utf8');
          log(`Received: ${connection.remotePeer.toB58String().slice(0, 8)}: ${str}`);
        }
      });
      await pipe([], stream);
    } catch (err) {
      console.error(err);
    }
  }

  async send(msg, stream, peer: Peer) {
    try {
      const msgStr = JSON.stringify(msg);
      await pipe([Buffer.from(msgStr).toString('base64')], stream);
      log(`Sent: ${peer.id.toB58String().slice(0, 8)} ${msgStr}`);
    } catch (err) {
      console.error(err);
    }
  }

  onPeerDiscovery(peerId) {
    log(`Found peer ${peerId.toB58String()}`);
  }

  onPeerConnect(connection) {
    log(`Connected to ${connection.remotePeer.toB58String()}`);
  }

  onPeerDisconnect(connection) {
    log(`Disconnected from ${connection.remotePeer.toB58String()}`);
  }

  async start() {
    console.log('Start network');
    await this.libp2p?.start();
    this.running = true;
  }

  async stop() {
    console.log('Stop network');
    await this.libp2p?.stop();
    this.running = false;
  }

  async sendToPeer(peer: Peer, msg) {
    const connection = this.libp2p?.connectionManager.get(peer.id);
    if (!connection || !peer.protocols.includes(this.procotol)) return;
    try {
      const { stream } = await connection.newStream([this.procotol]);
      await this.send(msg, stream, peer);
    } catch (e) {
      console.error(e);
    }
  }

  async sendToPeers(msg) {
    const peers = [...(this.libp2p?.peerStore?.peers?.values() || [])];
    await Promise.all(peers.map(peer => this.sendToPeer(peer, msg)));
  }
}
