export interface PostJointRequest {
  unit: Unit;
}

export interface Unit {
  version: string;
  messages: Message[];
  timestamp: number;
  signature: string;
}

export interface Message {
  type: 'INVOKE_FUNCTION' | 'DEPLOY';
  payload: InvokeRequest;
}

export interface InvokeRequest {
  agent: string;
  method: string;
  args: Array<any>;
}

export interface GetEventsRequest {
  start: number;
  end: number;
}

export interface Storage {
  agent: string;
  key: string;
  value: any;
}

export interface Event {
  id?: number;
  agent: string;
  key: string;
  data: any[];
}
