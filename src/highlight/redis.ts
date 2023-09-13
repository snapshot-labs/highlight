import { createClient } from 'redis';

const url = process.env.DATABASE_URL;

const client = createClient({ url });
client.on('connect', () => console.log('Redis connect'));
client.on('ready', () => console.log('Redis ready'));
client.on('reconnecting', e => console.log('Redis reconnecting', e));
client.on('error', e => console.log('Redis error', e));
client.on('end', e => console.log('Redis end', e));
client.connect().then(() => console.log('Redis connected'));

setInterval(() => {
  client
    .set('heartbeat', ~~(Date.now() / 1e3))
    .catch(e => console.log('Redis heartbeat failed', e));
}, 10e3);

export default client;
