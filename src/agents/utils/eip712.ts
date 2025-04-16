import {
  TypedDataDomain,
  TypedDataField
} from '@ethersproject/abstract-signer';
import { verifyTypedData, Wallet } from '@ethersproject/wallet';

const baseDomain: TypedDataDomain = {
  name: 'highlight',
  version: '0.1.0'
};

export async function signMessage(
  wallet: Wallet,
  chainId: Required<TypedDataDomain['chainId']>,
  salt: string,
  types: Record<string, TypedDataField[]>,
  message: Record<string, any>
): Promise<string> {
  const domain = {
    ...baseDomain,
    chainId,
    salt
  };

  return wallet._signTypedData(domain, types, message);
}

export async function verifySignature(
  chainId: Required<TypedDataDomain['chainId']>,
  salt: string,
  types: Record<string, TypedDataField[]>,
  message: Record<string, any>,
  signature: string
) {
  const domain = {
    ...baseDomain,
    chainId,
    salt
  };

  return verifyTypedData(domain, types, message, signature);
}
