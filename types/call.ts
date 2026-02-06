import { CallStatus, CallType } from './enums';

export interface CreateWebCallRequest {
  agentId?: string;
}

export type CallCost = Record<string, unknown>;

export interface CreateWebCallResponse {
  callId?: string;
  callType?: CallType;
  agentId?: string;
  agentName?: string;
  callCost?: CallCost;
  accessToken?: string;
  callStatus?: CallStatus;
}
