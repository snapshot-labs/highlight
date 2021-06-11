import { _TypedDataEncoder } from '@ethersproject/hash';
import { verifyTypedData } from '@ethersproject/wallet';

export function getHash(data) {
  const { domain, types, message } = data;
  const hash = _TypedDataEncoder.hash(domain, types, message);
  console.log('Hash', hash);
  return hash;
}

export async function isValid(address, sig, data) {
  const { domain, types, message } = data;
  const recoverAddress = verifyTypedData(domain, types, message, sig);
  console.log('Address', address);
  console.log('Recover address', recoverAddress);

  return address === recoverAddress;
}
