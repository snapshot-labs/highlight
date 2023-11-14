import { BigNumberish } from '@ethersproject/bignumber';
import { SignatureLike } from '@ethersproject/bytes';

export interface PostJointRequest {
  unit: Unit;
}

export interface TxData {
  type?: number | null;
  chainId: number;
  nonce: number;
  maxPriorityFeePerGas?: BigNumberish;
  maxFeePerGas?: BigNumberish;
  gasLimit: BigNumberish;
  to?: string;
  value: BigNumberish;
  data: string;
}

export interface Unit {
  unit_hash: string;
  version: string;
  sender_address: string;
  timestamp: number;
  txData: TxData;
  signature: SignatureLike;
}

export interface GetEventsRequest {
  start: number;
  end: number;
}

export interface GetUnitReceiptRequest {
  hash: string;
}

export interface Storage {
  agent: string;
  key: string;
  value?: any;
}

export interface DeleteStorage {
  agent: string;
  key: string;
}

export interface Event {
  id?: number;
  agent: string;
  key: string;
  data: any[];
}
