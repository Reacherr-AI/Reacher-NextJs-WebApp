export interface AgentConversationConfigResponse {
  llm?: LlmOptions;
  voice?: VoiceOptions;
}

export interface Language {
  code?: string;
  name?: string;
}

export interface Model {
  modality: string;
}

export interface LlmModel extends Model {
  name?: string;
  provider?: string;
  displayName?: string;
  modality: string;
  configs?: Record<string, unknown>;
}

export interface SttModel extends Model {
  name?: string;
  displayName?: string;
  modality: string;
  configs?: Record<string, unknown>;
  languages?: string[];
  supportsKeywords?: boolean;
}

export interface TTSVoice {
  voiceId?: string;
  displayName?: string;
  gender?: string;
  accent?: string;
  avatarUrl?: string;
}

export interface TtsModel extends Model {
  name?: string;
  displayName?: string;
  modality: string;
  configs?: Record<string, unknown>;
  languages?: string[];
  TTSVoices?: TTSVoice[];
}

export type ProviderModel = LlmModel | SttModel | TtsModel;

export interface Provider {
  name?: string;
  slug?: string;
  models?: ProviderModel[];
}

export interface LlmOptions {
  providers?: Provider[];
}

export interface VoiceOptions {
  languages?: Language[];
  providers?: Provider[];
}
