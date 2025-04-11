export interface PostJointRequest {
  unit: PendingUnit;
}

export type Unit = {
  id: number;
  version: string;
  timestamp: number;
  senderAddress: string;
  toAddress: string;
  data: string;
};

export type PendingUnit = Omit<Unit, 'id'>;

export interface GetUnitReceiptRequest {
  id: number;
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

export type Event = {
  agent: string;
  key: string;
  data: any[];
};
