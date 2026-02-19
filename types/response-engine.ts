import {
  AgentTemplateType,
  LanguageCode,
  PiiCategory,
  PiiMode,
  S2SModel,
  StartSpeaker,
  VoicemailActionType,
} from './enums';
import { PostCallField } from './analysis';

export interface ResponseEngineRefDto {
  engineId?: string;
  type?: string;
  llmId?: string;
  conversationFlowId?: string;
}

export interface ConversationFlowRefDto extends ResponseEngineRefDto {
  conversationFlowId?: string;
}

export interface ReacherrLlmRefDto extends ResponseEngineRefDto {
  llmId?: string;
  engineId?: string;
}

export type ResponseEngineRef = ConversationFlowRefDto | ReacherrLlmRefDto;

export interface PiiConfig {
  mode: PiiMode;
  categories: PiiCategory[];
}

export interface SttConfig {
  provider: string;
  model: string;
  settings?: Record<string, unknown>;
}

export interface TtsConfig {
  provider: string;
  model: string;
  voiceId: string;
  avatarUrl?: string;
  settings?: Record<string, unknown>;
}

export interface UserDtmfOptions {
  digit_limit?: number;
  termination_key?: string;
  timeout_ms?: number;
  digitLimit?: number;
  terminationKey?: string;
  timeoutMs?: number;
}

export interface Action {
  type: string;
}

export interface HungupVoiceMailAction extends Action {
  type: VoicemailActionType;
}

export interface PromptVoicemailAction extends Action {
  type: VoicemailActionType;
  prompt?: string;
}

export interface StaticTextVoicemailAction extends Action {
  type: VoicemailActionType;
  text?: string;
}

export interface VoiceMailOption {
  voiceMailOptionType: VoicemailActionType;
  text?: string;
}

export interface LegacyVoicemailOption {
  action?: HungupVoiceMailAction | PromptVoicemailAction | StaticTextVoicemailAction;
}

export interface SnakeCaseVoicemailOption {
  action?: {
    type?: VoicemailActionType;
    text?: string;
    prompt?: string;
  };
}

export interface IvrOption {
  action: {
    type: 'hangup';
  };
}

export interface VoiceAgentDto {
  agentId?: string;
  version?: number;
  lastUpdatedTimestamp?: number;
  responseEngine: ResponseEngineRef;
  agentName: string;
  isPublished?: boolean;
  voiceId?: string;
  voiceModel?: string;
  responsiveness?: number;
  interruptionSensitivity?: number;
  reminderTriggerTimeoutMs?: number;
  reminderMaxCount?: number;
  ambientSound?: string;
  ambientSoundVolume?: number;
  sttProvider?: string;
  boostedKeyWords?: string[];
  ttsConfig?: TtsConfig;
  sttConfig?: SttConfig;
  language?: LanguageCode;
  languageEnum?: LanguageCode;
  webhookUrl?: string;
  webhookTimeoutMs?: number;
  maxCallDurationMs?: number;
  ringTimeOutMs?: number;
  endCallAfterSilenceMs?: number;
  enableVoiceMailDetection?: boolean;
  enableVoicemailDetection?: boolean;
  enable_voicemail_detection?: boolean;
  voiceMailDetectionTimeOutMs?: number;
  voiceMailMessage?: string;
  voiceMailDetection?: LegacyVoicemailOption;
  voicemailOption?: VoiceMailOption;
  voiceMailOption?: VoiceMailOption;
  voicemail_option?: SnakeCaseVoicemailOption | null;
  ivrOption?: IvrOption | null;
  ivr_option?: IvrOption | null;
  analysisSuccessfulPrompt?: string;
  analysisSummaryPrompt?: string;
  postCallAnalysisData?: PostCallField[] | { data?: PostCallField[] };
  postCallAnalysisModel?: string;
  versionDescription?: string;
  piiConfig?: PiiConfig;
  allowUserDtmf?: boolean;
  userDtmfOption?: UserDtmfOptions;
  userDtmfOptions?: UserDtmfOptions;
}

export interface Tool {
  type: string;
}

export interface FlowTool {
  type: string;
}

export interface BookAppointmentCalTool extends Tool {
  type: string;
  calApiKey?: string;
  eventTypeId?: number;
  timezone?: string;
  name?: string;
  description?: string;
}

export interface CheckAvailabilityCalTool extends Tool, FlowTool {
  type: string;
  name?: string;
  description?: string;
  tool_id?: string;
  calApiKey?: string;
  eventTypeId?: number;
  timezone?: string;
}

export interface CustomTool extends Tool, FlowTool {
  type: string;
  name?: string;
  description?: string;
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  queryParams?: Record<string, unknown>;
  parameters?: Record<string, unknown>;
  responseVariables?: Record<string, string>;
  timeoutMs?: number;
  argsAtRoot?: boolean;
  tool_id?: string;
  speakDuringExecution?: boolean;
  speakAfterExecution?: boolean;
  executionMessageDescription?: string;
}

export interface EndCallTool extends Tool {
  type: string;
  name?: string;
  description?: string;
  speakDuringExecution?: boolean;
  executionMessageDescription?: string;
  executionMessageType?: 'prompt' | 'static_text';
}

export interface McpTool extends Tool {
  type: string;
  name?: string;
  description?: string;
  mcpId?: string;
  inputSchema?: Record<string, unknown>;
  responseVariables?: Record<string, string>;
  speakDuringExecution?: boolean;
  speakAfterExecution?: boolean;
  executionMessageDescription?: string;
}

export interface TransferCallTool extends Tool {
  type: string;
  name?: string;
  description?: string;
  transferDestination?: string;
  speakDuringExecution?: boolean;
  executionMessageDescription?: string;
}

export type GeneralTool =
  | BookAppointmentCalTool
  | CheckAvailabilityCalTool
  | CustomTool
  | EndCallTool
  | McpTool
  | TransferCallTool;

export interface KbConfig {
  topK?: number;
  filterScore?: number;
}

export interface Mcp {
  name?: string;
  url?: string;
  headers?: Record<string, string>;
  query_params?: Record<string, unknown>;
  timeout_ms?: number;
}

export interface State {
  name?: string;
  state_prompt?: string;
  edges?: StateEdge[];
  tools?: GeneralTool[];
}

export interface StateEdge {
  destination_state_name?: string;
  description?: string;
  parameters?: Record<string, unknown>;
}

export interface ReacherrLlmDto {
  llmId?: string;
  lastModificationTimestamp?: number;
  provider?: string;
  model?: string;
  s2sModel?: S2SModel;
  temperature?: number;
  maxTokens?: number;
  modelHighPriority?: boolean;
  toolCallStrictMode?: boolean;
  kbConfig?: KbConfig;
  knowledgeBaseIds?: string[];
  startSpeaker?: StartSpeaker;
  beginMessageDelay?: number;
  beginMessage?: string;
  generalPrompt?: string;
  generalTools?: GeneralTool[];
  states?: State[];
  startingState?: string;
  defaultDynamicVariables?: Record<string, string>;
  mcps?: Mcp[];
}

export interface ChatAgentDto {
  agentId?: string;
  agentName?: string;
  version?: number;
  lastUpdatedTimestamp?: number;
  isPublished?: boolean;
  responseEngine?: ResponseEngineRef;
  autoCloseMessage?: string;
  endChatAfterSilenceMs?: number;
  language?: LanguageCode;
  webhookUrl?: string;
  webhookTimeoutMs?: number;
  postChatAnalysisData?: PostCallField[];
  postChatAnalysisModel?: string;
  analysisSuccessfulPrompt?: string;
  analysisSummaryPrompt?: string;
  piiConfig?: PiiConfig;
}

export interface AgentDashBoardDto {
  agentId?: string;
  agentName?: string;
  agentVersion?: number;
  lastUpdatedAt?: number;
  phoneNumbers?: string[];
  agentType?: AgentTemplateType;
  responseEngineRefDto?: ResponseEngineRef;
  voiceAvatarUrl?: string;
}
