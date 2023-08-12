import { createClient } from 'redis';

const url = process.env.DATABASE_URL;

const client = createClient({ url });
client.on('connect', () => console.log('redis connect'));
client.on('ready', () => console.log('redis ready'));
client.on('reconnecting', e => console.log('redis reconnecting', e));
client.on('error', e => console.log('redis error', e));
client.on('end', e => console.log('redis end', e));
client.connect().then(() => console.log('redis connected'));

setInterval(() => {
  client
    .set('heartbeat', ~~(Date.now() / 1e3))
    .catch(e => console.log('redis heartbeat failed', e));
}, 10e3);

export default client;
