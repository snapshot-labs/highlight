import { verifyTypedData } from '@ethersproject/wallet';
import { _TypedDataEncoder } from '@ethersproject/hash';

export function getHash(data) {
  const { domain, types, message } = data;
  const hash = _TypedDataEncoder.hash(domain, types, message);
  console.log('Hash', hash);
  return hash;
}

export function verify(address, sig, data) {
  const { domain, types, message } = data;
  const recoverAddress = verifyTypedData(domain, types, message, sig);
  console.log('Address', address);
  console.log('Recover address', recoverAddress);
  return address === recoverAddress;
}
