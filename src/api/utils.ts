import fetch from 'node-fetch';

export const IPFS_GATEWAY = process.env.IPFS_GATEWAY || 'snapshot.4everland.link';

export function getUrl(uri, gateway = IPFS_GATEWAY) {
  const ipfsGateway = `https://${gateway}`;
  if (!uri) return null;
  if (
    !uri.startsWith('ipfs://') &&
    !uri.startsWith('ipns://') &&
    !uri.startsWith('https://') &&
    !uri.startsWith('http://')
  )
    return `${ipfsGateway}/ipfs/${uri}`;
  const uriScheme = uri.split('://')[0];
  if (uriScheme === 'ipfs') return uri.replace('ipfs://', `${ipfsGateway}/ipfs/`);
  if (uriScheme === 'ipns') return uri.replace('ipns://', `${ipfsGateway}/ipns/`);
  return uri;
}

export async function getJSON(uri) {
  const url = getUrl(uri);
  return fetch(url).then(res => res.json());
}
