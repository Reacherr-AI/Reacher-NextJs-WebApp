import { AuthResult, LoginRequest, RefreshTokenRequest, SignUpRequest } from './auth';
import { CreateWebCallRequest, CreateWebCallResponse } from './call';
import { ConversationFlowRequest, ConversationFlowResponse } from './conversation-flow';
import { AgentConversationConfigResponse } from './conversation-config';
import { LivekitWebhookRequestBody, LivekitWebhookResponse } from './livekit';
import {
  AddPhoneRequest,
  AvailableNumberRequestDto,
  AvailableNumberResponse,
  Pageable,
  PhoneNumberRequestDto,
  PhoneNumberResposneDto,
} from './phone';
import { AgentDashBoardDto, ChatAgentDto, ReacherrLlmDto, VoiceAgentDto } from './response-engine';
import { TemplateDto } from './templates';
import { OtpVerificationRequest } from './auth';

export interface LivekitWebhookRequest {
  headers: {
    Authorization: string;
  };
  body: LivekitWebhookRequestBody;
}

export type LivekitWebhookResponseBody = LivekitWebhookResponse;

export interface VerifyPhoneRequest {
  body: OtpVerificationRequest;
}

export type VerifyPhoneResponse = AuthResult;

export interface VerifyEmailRequest {
  body: OtpVerificationRequest;
}

export type VerifyEmailResponse = AuthResult;

export interface UpdatePhoneNumberRequest {
  params: {
    phoneNumber: string;
  };
  body: PhoneNumberRequestDto;
}

export type UpdatePhoneNumberResponse = PhoneNumberResposneDto;

export interface AddPhoneRequestApi {
  body: AddPhoneRequest;
}

export type AddPhoneResponse = AuthResult;

export type ListPhoneNumberResponse = PhoneNumberResposneDto[];

export interface ListAvailableNumbersRequest {
  query: {
    pageable: Pageable;
  };
  body: AvailableNumberRequestDto;
}

export type ListAvailableNumbersResponse = AvailableNumberResponse;

export interface CreateWebCallRequestApi {
  body: CreateWebCallRequest;
}

export type CreateWebCallResponseBody = CreateWebCallResponse;

export interface CreateVoiceAgentRequest {
  body: VoiceAgentDto;
}

export type CreateVoiceAgentResponse = VoiceAgentDto;

export interface CreateReacherrLlmRequest {
  body: ReacherrLlmDto;
}

export type CreateReacherrLlmResponse = ReacherrLlmDto;

export interface CreatePhoneNumberRequest {
  body: PhoneNumberRequestDto;
}

export type CreatePhoneNumberResponse = PhoneNumberResposneDto;

export interface CreateConversationFlowRequest {
  body: ConversationFlowRequest;
}

export type CreateConversationFlowResponse = ConversationFlowResponse;

export interface CreateChatAgentRequest {
  body: ChatAgentDto;
}

export type CreateChatAgentResponse = ChatAgentDto;

export interface CreateAgentFromTemplateRequest {
  params: {
    templateId: string;
  };
}

export type CreateAgentFromTemplateResponse = VoiceAgentDto;

export interface ConnectPhoneNumberRequest {
  body: PhoneNumberRequestDto;
}

export type ConnectPhoneNumberResponse = PhoneNumberResposneDto;

export interface AuthSignupRequest {
  body: SignUpRequest;
}

export type AuthSignupResponse = AuthResult;

export type AuthSignoutResponse = Record<string, unknown>;

export interface AuthSigninRequest {
  body: LoginRequest;
}

export type AuthSigninResponse = AuthResult;

export interface AuthRefreshRequest {
  body: RefreshTokenRequest;
}

export type AuthRefreshResponse = AuthResult;

export interface DeleteUserRequest {
  params: {
    username: string;
  };
}

export type DeleteUserResponse = void;

export interface UpdateReacherrLlmRequest {
  params: {
    llmId: string;
  };
  body: ReacherrLlmDto;
}

export type UpdateReacherrLlmResponse = ReacherrLlmDto;

export interface PublishVoiceAgentRequest {
  params: {
    agentId: string;
  };
  body: VoiceAgentDto;
}

export type PublishVoiceAgentResponse = VoiceAgentDto;

export type TemplatesResponse = TemplateDto[];

export interface ListVoiceAgentRequest {
  query: {
    pageable: Pageable;
  };
}

export type ListVoiceAgentResponse = VoiceAgentDto[];

export type ListReacherrLlmResponse = ReacherrLlmDto[];

export interface ListAgentDashboardRequest {
  query: {
    pageable: Pageable;
  };
}

export type ListAgentDashboardResponse = AgentDashBoardDto[];

export interface GetVoiceAgentRequest {
  params: {
    agentId: string;
  };
}

export type GetVoiceAgentResponse = VoiceAgentDto;

export interface GetReacherrLlmRequest {
  params: {
    llmId: string;
  };
}

export type GetReacherrLlmResponse = ReacherrLlmDto;

export type AgentConversationConfigResponseBody = AgentConversationConfigResponse;

export interface DeleteVoiceAgentRequest {
  params: {
    agentId: string;
  };
}

export type DeleteVoiceAgentResponse = void;

export interface DeleteReacherrLlmRequest {
  params: {
    llmId: string;
  };
}

export type DeleteReacherrLlmResponse = void;
