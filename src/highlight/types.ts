export interface PostJointRequest {
  unit: Unit;
}

export interface Unit {
  unit_hash: string;
  version: string;
  sender_address: string;
  messages: Message[];
  timestamp: number;
}

export interface Message {
  to: string;
  data: string;
}

export interface GetEventsRequest {
  start: number;
  end: number;
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
