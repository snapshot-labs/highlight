import { Contract, providers, utils } from 'ethers';
import snapshot from '@snapshot-labs/snapshot.js';

export async function verifyDefault(address: string, sig: string, hash: string, provider: providers.Provider) {
  let returnValue;
  const magicValue = '0x1626ba7e';
  const abi =
    'function isValidSignature(bytes32 _hash, bytes memory _signature) public view returns (bytes4 magicValue)';
  try {
    returnValue = await new Contract(address, [abi], provider).isValidSignature(utils.arrayify(hash), sig);
  } catch (e) {
    console.log(e);
    return false;
  }
  return returnValue.toLowerCase() === magicValue.toLowerCase();
}

export async function verifyOldVersion(address: string, sig: string, hash: string, provider: providers.Provider) {
  let returnValue;
  const magicValue = '0x20c13b0b';
  const abi = 'function isValidSignature(bytes _hash, bytes memory _signature) public view returns (bytes4 magicValue)';
  try {
    returnValue = await new Contract(address, [abi], provider).isValidSignature(utils.arrayify(hash), sig);
  } catch (e) {
    console.log(e);
    return false;
  }
  return returnValue.toLowerCase() === magicValue.toLowerCase();
}

export async function verify(address, sig, hash) {
  const provider = snapshot.utils.getProvider('1');
  if (await verifyDefault(address, sig, hash, provider)) return true;
  return await verifyOldVersion(address, sig, hash, provider);
}
