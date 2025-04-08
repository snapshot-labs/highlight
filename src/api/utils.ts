import { BigNumber } from '@ethersproject/bignumber';
import { concat, hexlify, hexZeroPad } from '@ethersproject/bytes';
import { keccak256 } from '@ethersproject/keccak256';
import { StaticJsonRpcProvider } from '@ethersproject/providers';

export async function getStorage(contract, index, blockNum, chainId, address) {
  const concated = concat([
    hexZeroPad(address, 32),
    hexZeroPad(BigNumber.from(index).toHexString(), 32)
  ]);
  const key = keccak256(hexlify(concated));
  const provider = new StaticJsonRpcProvider(
    `https://rpc.brovider.xyz/${chainId}`,
    chainId
  );

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
