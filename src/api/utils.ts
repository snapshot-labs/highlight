import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { hexZeroPad, concat, hexlify } from '@ethersproject/bytes';
import { BigNumber } from '@ethersproject/bignumber';
import { keccak256 } from '@ethersproject/keccak256';

export async function getStorage(contract, index, blockNum, chainId, address) {
  const concated = concat([
    hexZeroPad(address, 32),
    hexZeroPad(BigNumber.from(index).toHexString(), 32)
  ]);
  const key = keccak256(hexlify(concated));
  const provider = new StaticJsonRpcProvider(`https://rpc.brovider.xyz/${chainId}`, chainId);

  const result = await provider.getStorageAt(contract, key, blockNum);

  return BigNumber.from(result).toBigInt().toString();
}

export async function getEntity(entity, id) {
  let item = await entity.loadEntity(id);

  if (!item) {
    item = new entity(id);
  }

  return item;
}
