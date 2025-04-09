import {
  TypedDataDomain,
  TypedDataField
} from '@ethersproject/abstract-signer';
import { verifyTypedData, Wallet } from '@ethersproject/wallet';

export const domain: TypedDataDomain = {
  name: 'highlight',
  version: '0.1.0'
};

export async function signMessage(
  wallet: Wallet,
  types: Record<string, TypedDataField[]>,
  message: Record<string, any>
): Promise<string> {
  return wallet._signTypedData(domain, types, message);
}

export async function verifySignature(
  types: Record<string, TypedDataField[]>,
  message: Record<string, any>,
  signature: string
) {
  return verifyTypedData(domain, types, message, signature);
}
