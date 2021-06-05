import pipe from 'it-pipe';
import pkg from './package.json';

// The codec of our protocol
export const PROTOCOL = `/libp2p/${pkg.name}/${pkg.version}`;

/**
 * A simple handler to print incoming messages to the console
 * @param {Object} params
 * @param {Connection} params.connection The connection the stream belongs to
 * @param {Stream} params.stream stream to the peer
 */
export async function handler ({ connection, stream }) {
  try {
    await pipe(
      stream,
      async function (source) {
        for await (const message of source) {
          console.info(`${connection.remotePeer.toB58String().slice(0, 8)}: ${message}`)
        }
      }
    )
    // Replies are done on new streams, so let's close this stream so we don't leak it
    await pipe([], stream)
  } catch (err) {
    console.error(err)
  }
}

/**
 * Writes a given `message` over the given `stream`.
 * @param {String} message The message to send over `stream`
 * @param {Stream} stream A stream over the muxed Connection to our peer
 */
export async function send (message, stream) {
  try {
    await pipe(
      [message],
      stream,
      async function (source) {
        for await (const message of source) {
          console.info(`Me: ${message}`)
        }
      }
    )
  } catch (err) {
    console.error(err)
  }
}
