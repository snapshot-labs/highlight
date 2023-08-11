export interface PostJointRequest {
  unit: Unit;
}

export interface Unit {
  version: string;
  messages: Message[];
  timestamp: number;
  parent_units: string[];
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

export interface EventRow {
  id: number;
  agent: string;
  key: string;
  events: string;
}
