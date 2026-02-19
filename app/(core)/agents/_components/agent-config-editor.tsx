'use client';

import * as React from 'react';
import type { KnowledgeBaseDto, ReacherrLlmDto, VoiceAgentDto } from '@/types';
import { BeginMessageSettings } from './begin-message-settings';
import { LlmModelSelect } from './llm-model-select';
import { LlmToolsSettings } from './llm-tools-settings';
import { SecuritySettings } from './security-settings';
import { LlmTemperatureSettings } from './llm-temperature-settings';
import { SpeechSettings } from './speech-settings';
import { VoicemailSettings } from './voicemail-settings';
import {
  CallTimingSettings,
  normalizeCallTimingMs,
} from './call-timing-settings';
import { WebhookSettings } from './webhook-settings';
import { PostCallSettings, type PostCallDraft } from './post-call-settings';
import { TtsModelSettings } from './tts-model-settings';
import {
  conversationConfigStoredResults,
  getLLMProviders,
} from '../_lib/conversation-config';
import { type PostCallField } from '@/types';
import {
  BookOpen,
  Boxes,
  ChevronRight,
  Code,
  ListChecks,
  PhoneCall,
  Pencil,
  Plus,
  Shield,
  Speech,
  Trash2,
  Webhook,
  Wrench,
} from 'lucide-react';

type VoiceMailActionType = NonNullable<
  NonNullable<VoiceAgentDto['voiceMailOption']>['voiceMailOptionType']
>;

type PiiModeType = NonNullable<NonNullable<VoiceAgentDto['piiConfig']>['mode']>;

type PiiCategoriesType = NonNullable<NonNullable<VoiceAgentDto['piiConfig']>['categories']>;
type PiiCategoryType = PiiCategoriesType[number];
type UiLanguageCode = NonNullable<VoiceAgentDto['languageEnum']>;
type EditorConfigDto = {
  llmModels?: Array<{ modelId?: string; provider?: string; displayName?: string }>;
  ttsModels?: Array<{ modelId?: string; provider?: string; displayName?: string }>;
  languages?: Array<{ code?: string; name?: string }>;
  voices?: Array<{
    voiceId?: string;
    voiceName?: string;
    provider?: string;
    gender?: string;
    accent?: string;
    age?: string;
    avatarUrl?: string | null;
    previewAudioUrl?: string | null;
    recommended?: boolean;
    supportedLanguages?: string[];
  }>;
  knowledgeBases?: KnowledgeBaseDto[];
};

const inferVoiceProviderFromVoiceId = (voiceId: string | undefined): string => {
  const normalized = (voiceId ?? '').trim().toLowerCase();
  if (!normalized) return '';
  if (normalized.startsWith('cartesia-') || normalized.startsWith('sonic-')) return 'cartesia';
  if (normalized.startsWith('eleven_') || normalized.startsWith('eleven-') || normalized.startsWith('11labs-')) return 'elevenlabs';
  if (normalized.startsWith('openai-') || normalized === 'alloy' || normalized.startsWith('tts-')) return 'openai';
  if (normalized.startsWith('minimax-')) return 'minimax';
  return '';
};

const inferVoiceProviderFromModel = (voiceModel: string | undefined): string => {
  const normalized = (voiceModel ?? '').trim().toLowerCase();
  if (!normalized) return '';
  if (normalized.startsWith('sonic')) return 'cartesia';
  if (normalized.startsWith('eleven')) return 'elevenlabs';
  if (normalized.startsWith('openai') || normalized.startsWith('tts-')) return 'openai';
  if (normalized.startsWith('minimax')) return 'minimax';
  return '';
};

const isPlaceholderVoiceId = (voiceId: string | undefined): boolean => {
  const normalized = (voiceId ?? '').trim().toLowerCase();
  if (!normalized) return false;
  return normalized.endsWith('-default') || normalized === 'alloy';
};

type SectionId =
  | 'call'
  | 'speech'
  | 'webhooks'
  | 'security'
  | 'postcall'
  | 'llm_kb'
  | 'llm_tools'
  | 'llm_mcps'
  | 'raw';

type SaveResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const dedupeByValue = <T extends { value: string }>(items: T[]) => {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    if (seen.has(item.value)) continue;
    seen.add(item.value);
    out.push(item);
  }
  return out;
};

const DEFAULT_LLM_MODEL_VALUE = 'gpt-4.1';
const DEFAULT_POST_CALL_ANALYSIS_MODEL = 'gpt-4.1';
const DTMF_TIMEOUT_MIN_MS = 1000;
const DTMF_TIMEOUT_MAX_MS = 10000;
const DTMF_TIMEOUT_DEFAULT_MS = 5500;
const DTMF_TIMEOUT_STEP_MS = 100;
const DTMF_TERMINATION_KEYS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '#', '*'] as const;

const resolveDefaultLlmModelValue = (options: Array<{ label: string; value: string }>): string => {
  const exact =
    options.find((opt) => opt.value.toLowerCase() === DEFAULT_LLM_MODEL_VALUE) ??
    options.find((opt) => opt.label.trim().toLowerCase() === 'gpt-4.1');
  if (exact) return exact.value;

  const firstGpt = options.find(
    (opt) => `${opt.value} ${opt.label}`.toLowerCase().includes('gpt')
  );
  if (firstGpt) return firstGpt.value;

  return options[0]?.value ?? '';
};

const ensureOption = <T extends { label: string; value: string }>(
  items: T[],
  value: string | undefined,
  labelPrefix: string
) => {
  if (!value) return items;
  if (items.some((i) => i.value === value)) return items;
  return dedupeByValue([{ label: `${labelPrefix}: ${value}`, value } as T, ...items]);
};

const norm = (v: string) => v.trim().toLowerCase();

const findByValueOrLabel = <T extends { label: string; value: string }>(
  items: T[],
  raw: string
): T | null => {
  const exact = items.find((i) => i.value === raw);
  if (exact) return exact;
  const n = norm(raw);
  return items.find((i) => norm(i.value) === n || norm(i.label) === n) ?? null;
};

const stringifyStable = (value: unknown): string => {
  const seen = new WeakSet<object>();

  const normalize = (v: unknown): unknown => {
    if (!v || typeof v !== 'object') return v;
    if (seen.has(v as object)) return '[Circular]';
    seen.add(v as object);

    if (Array.isArray(v)) return v.map(normalize);

    const obj = v as Record<string, unknown>;
    const keys = Object.keys(obj).sort();
    const out: Record<string, unknown> = {};
    for (const k of keys) out[k] = normalize(obj[k]);
    return out;
  };

  return JSON.stringify(normalize(value));
};

const cleanStringList = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  const next = value
    .map((v) => (typeof v === 'string' ? v.trim() : ''))
    .filter((v) => v.length > 0);
  return next.length > 0 ? next : undefined;
};

const sanitizePostCallFieldForPayload = (field: PostCallField): PostCallField | null => {
  const type = typeof field.type === 'string' ? field.type.trim().toLowerCase() : '';
  const name = typeof field.name === 'string' ? field.name.trim() : '';
  const description = typeof field.description === 'string' ? field.description.trim() : '';
  if (!name || !description) return null;

  if (type === 'string') {
    const examples = cleanStringList((field as { examples?: unknown }).examples);
    if (!examples) return null;
    return { type, name, description, examples };
  }
  if (type === 'enum') {
    const choices = cleanStringList((field as { choices?: unknown }).choices);
    if (!choices) return null;
    return { type, name, description, choices };
  }
  if (type === 'number' || type === 'boolean') {
    return { type, name, description };
  }
  return null;
};

const normalizeUserDtmfOption = (value: unknown): VoiceAgentDto['userDtmfOption'] => {
  if (!isRecord(value)) return undefined;
  const rawDigit =
    typeof value.digit_limit === 'number'
      ? value.digit_limit
      : typeof value.digitLimit === 'number'
        ? value.digitLimit
        : undefined;
  const rawTermination =
    typeof value.termination_key === 'string'
      ? value.termination_key
      : typeof value.terminationKey === 'string'
        ? value.terminationKey
        : undefined;
  const rawTimeout =
    typeof value.timeout_ms === 'number'
      ? value.timeout_ms
      : typeof value.timeoutMs === 'number'
        ? value.timeoutMs
        : undefined;

  const normalized = {
    digit_limit: rawDigit,
    termination_key: rawTermination,
    timeout_ms: rawTimeout,
  };

  return normalized.digit_limit !== undefined ||
    normalized.termination_key !== undefined ||
    normalized.timeout_ms !== undefined
    ? normalized
    : undefined;
};

const validateUserDtmfOption = (
  enabled: boolean | undefined,
  option: VoiceAgentDto['userDtmfOption']
): string | null => {
  if (!enabled || !option) return null;
  if (option.digit_limit !== undefined && (option.digit_limit < 1 || option.digit_limit > 50)) {
    return 'Digit Limit must be between 1 and 50.';
  }
  if (
    option.timeout_ms !== undefined &&
    (option.timeout_ms < DTMF_TIMEOUT_MIN_MS || option.timeout_ms > DTMF_TIMEOUT_MAX_MS)
  ) {
    return `Timeout (ms) must be between ${DTMF_TIMEOUT_MIN_MS} and ${DTMF_TIMEOUT_MAX_MS}.`;
  }
  if (
    option.termination_key !== undefined &&
    option.termination_key !== '' &&
    !/^[0-9#*]$/.test(option.termination_key)
  ) {
    return 'Termination Key must be a single character: 0-9, #, or *.';
  }
  return null;
};

const validateVoicemailOption = (
  enabled: boolean | undefined,
  option: VoiceAgentDto['voiceMailOption']
): string | null => {
  if (!enabled) return null;
  const type = option?.voiceMailOptionType;
  if (!type || (type !== 'hangup' && type !== 'prompt' && type !== 'static_text')) {
    return 'Voicemail Action Type is required when voicemail detection is enabled.';
  }
  if ((type === 'prompt' || type === 'static_text') && !option?.text?.trim()) {
    return 'Voicemail Text is required for prompt/static_text actions.';
  }
  return null;
};

const isVoiceLanguageMismatchError = (message: string): boolean => {
  const normalized = message.toLowerCase();
  return normalized.includes('only supports') && normalized.includes('cannot be used for');
};

const isVoiceProviderMismatchError = (message: string): boolean => {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('provider mismatch') ||
    (normalized.includes('voice') &&
      normalized.includes('model') &&
      normalized.includes('is from') &&
      normalized.includes('but'))
  );
};

const validateTtsProviderMatch = (
  voiceModel: string | undefined,
  voiceId: string | undefined
): string | null => {
  const model = (voiceModel ?? '').trim();
  const voice = (voiceId ?? '').trim();
  if (!model || !voice) return null;

  const modelProvider = inferVoiceProviderFromModel(model);
  const voiceProvider = inferVoiceProviderFromVoiceId(voice);
  if (!modelProvider || !voiceProvider || modelProvider === voiceProvider) return null;

  return `Selected Voice ID '${voice}' is from ${voiceProvider}, but TTS model '${model}' is from ${modelProvider}. Please select a voice and TTS model from the same provider.`;
};

const normalizeAgentSaveErrorMessage = (message: string): string => {
  if (isVoiceProviderMismatchError(message)) {
    return 'Selected Voice ID and TTS model are from different providers. Please choose a matching TTS model for the selected voice.';
  }
  if (isVoiceLanguageMismatchError(message)) return message;
  return message;
};

const sanitizeVoiceMailOption = (value: unknown): VoiceAgentDto['voiceMailOption'] => {
  if (!isRecord(value)) return undefined;
  const rawType = value.voiceMailOptionType;
  const voiceMailOptionType =
    rawType === 'hangup' || rawType === 'prompt' || rawType === 'static_text' ? rawType : undefined;
  if (!voiceMailOptionType) return undefined;
  const text = typeof value.text === 'string' ? value.text.trim() : undefined;
  return voiceMailOptionType === 'hangup'
    ? { voiceMailOptionType: 'hangup' }
    : {
      voiceMailOptionType,
      ...(text ? { text } : {}),
    };
};

const sanitizeVoiceMailOptionFromAction = (value: unknown): VoiceAgentDto['voiceMailOption'] => {
  if (!isRecord(value)) return undefined;
  const rawType = value.type;
  const voiceMailOptionType =
    rawType === 'hangup' || rawType === 'prompt' || rawType === 'static_text' ? rawType : undefined;
  if (!voiceMailOptionType) return undefined;
  const text =
    typeof value.text === 'string'
      ? value.text.trim()
      : typeof value.prompt === 'string'
        ? value.prompt.trim()
        : undefined;
  return voiceMailOptionType === 'hangup'
    ? { voiceMailOptionType: 'hangup' }
    : {
      voiceMailOptionType,
      ...(text ? { text } : {}),
    };
};

const sanitizeIvrOption = (value: unknown): VoiceAgentDto['ivrOption'] => {
  if (!isRecord(value) || !isRecord(value.action)) return undefined;
  if (value.action.type !== 'hangup') return undefined;
  return { action: { type: 'hangup' } };
};

const normalizeVoicemailOption = (agent: VoiceAgentDto): VoiceAgentDto => {
  const legacyAgent = agent as VoiceAgentDto & {
    enableVoiceMailDetection?: boolean;
    enable_voicemail_detection?: boolean;
    voicemailOption?: VoiceAgentDto['voiceMailOption'];
    voicemail_option?: VoiceAgentDto['voicemail_option'];
    voiceMailDetection?: { action?: { type?: string; text?: string; prompt?: string } };
    voiceMailMessage?: string;
  };
  const legacyAction = legacyAgent
    .voiceMailDetection?.action;
  const normalizedEnableVoicemailDetection =
    typeof agent.enableVoicemailDetection === 'boolean'
      ? agent.enableVoicemailDetection
      : typeof legacyAgent.enable_voicemail_detection === 'boolean'
        ? legacyAgent.enable_voicemail_detection
        : legacyAgent.enableVoiceMailDetection;
  const normalizedVoiceMailOption =
    sanitizeVoiceMailOption(agent.voiceMailOption) ??
    sanitizeVoiceMailOption(legacyAgent.voicemailOption) ??
    sanitizeVoiceMailOptionFromAction(legacyAgent.voicemail_option?.action);
  const legacyText = legacyAction?.text ?? legacyAction?.prompt ?? legacyAgent.voiceMailMessage;

  if (normalizedVoiceMailOption || !legacyAction?.type) {
    const withNormalizedText = normalizedVoiceMailOption
      ? {
        ...normalizedVoiceMailOption,
        text: normalizedVoiceMailOption.text ?? legacyText,
      }
      : normalizedVoiceMailOption;
    return {
      ...agent,
      enableVoicemailDetection: normalizedEnableVoicemailDetection,
      voiceMailOption: withNormalizedText,
    };
  }

  return {
    ...agent,
    enableVoicemailDetection: normalizedEnableVoicemailDetection,
    voiceMailOption: {
      voiceMailOptionType: legacyAction.type as VoiceMailActionType,
      text: legacyAction.text ?? legacyAction.prompt,
    },
  };
};

const normalizeAgentForEditor = (agent: VoiceAgentDto): VoiceAgentDto => {
  const withVoicemail = normalizeVoicemailOption(agent);
  const restWithVoicemail = { ...withVoicemail };
  delete restWithVoicemail.ivrOption;
  const normalizedIvrOption = sanitizeIvrOption(withVoicemail.ivrOption);
  const languageEnum = withVoicemail.languageEnum ?? withVoicemail.language;
  const userDtmfOption = normalizeUserDtmfOption(
    withVoicemail.userDtmfOption ?? withVoicemail.userDtmfOptions
  );
  const normalizedPiiMode =
    withVoicemail.piiConfig?.mode &&
      String(withVoicemail.piiConfig.mode).trim().toLowerCase() === 'post_call'
      ? ('POST_CALL' as PiiModeType)
      : withVoicemail.piiConfig?.mode;
  const postCallAnalysisModel =
    typeof withVoicemail.postCallAnalysisModel === 'string' &&
      withVoicemail.postCallAnalysisModel.trim().length > 0
      ? withVoicemail.postCallAnalysisModel.trim()
      : DEFAULT_POST_CALL_ANALYSIS_MODEL;
  const rawPostCall = withVoicemail.postCallAnalysisData as unknown;
  const normalizedPostCall = (Array.isArray(rawPostCall)
    ? rawPostCall
    : isRecord(rawPostCall) && Array.isArray(rawPostCall.data)
      ? rawPostCall.data
      : []) as PostCallField[];

  return {
    ...restWithVoicemail,
    ivrOption: normalizedIvrOption,
    languageEnum,
    language: languageEnum,
    userDtmfOption,
    userDtmfOptions: userDtmfOption,
    maxCallDurationMs: normalizeCallTimingMs(withVoicemail.maxCallDurationMs),
    ringTimeOutMs: normalizeCallTimingMs(withVoicemail.ringTimeOutMs),
    endCallAfterSilenceMs: normalizeCallTimingMs(withVoicemail.endCallAfterSilenceMs),
    piiConfig: withVoicemail.piiConfig
      ? {
        ...withVoicemail.piiConfig,
        mode: normalizedPiiMode as PiiModeType,
      }
      : undefined,
    postCallAnalysisModel,
    postCallAnalysisData: normalizedPostCall,
  };
};

const buildAgentPayload = (draft: VoiceAgentDto): VoiceAgentDto => {
  const payload = normalizeVoicemailOption(draft) as VoiceAgentDto & {
    userDtmfOptions?: unknown;
    language?: unknown;
    voiceMailDetection?: unknown;
    enableVoiceMailDetection?: boolean;
    enable_voicemail_detection?: boolean;
    voiceMailMessage?: string;
    voicemailOption?: VoiceAgentDto['voiceMailOption'];
    voicemail_option?: VoiceAgentDto['voicemail_option'];
    ivrOption?: VoiceAgentDto['ivrOption'];
    postCallAnalysisData?: unknown;
    postCallAnalysisModel?: unknown;
  };

  if (!payload.languageEnum && typeof payload.language === 'string') {
    payload.languageEnum = payload.language as VoiceAgentDto['languageEnum'];
  }

  if (!payload.userDtmfOption && payload.userDtmfOptions) {
    payload.userDtmfOption = payload.userDtmfOptions as VoiceAgentDto['userDtmfOption'];
  }
  payload.userDtmfOption = normalizeUserDtmfOption(payload.userDtmfOption);

  if (!payload.allowUserDtmf) {
    payload.userDtmfOption = undefined;
  } else if (payload.userDtmfOption) {
    payload.userDtmfOption = {
      digitLimit: payload.userDtmfOption.digit_limit,
      terminationKey: payload.userDtmfOption.termination_key,
      timeoutMs: payload.userDtmfOption.timeout_ms,
    };
  }

  if (isPlaceholderVoiceId(payload.voiceId)) {
    payload.voiceId = undefined;
  }
  (payload as unknown as Record<string, unknown>).ttsConfig = undefined;

  const normalizedEnableVoicemailDetection =
    typeof payload.enableVoicemailDetection === 'boolean'
      ? payload.enableVoicemailDetection
      : payload.enableVoiceMailDetection;
  if (typeof normalizedEnableVoicemailDetection === 'boolean') {
    payload.enableVoicemailDetection = normalizedEnableVoicemailDetection;
    payload.enableVoiceMailDetection = normalizedEnableVoicemailDetection;
    payload.enable_voicemail_detection = normalizedEnableVoicemailDetection;
  }

  if (!payload.voiceMailOption && payload.voicemailOption) {
    payload.voiceMailOption = payload.voicemailOption;
  }
  payload.voiceMailOption = sanitizeVoiceMailOption(payload.voiceMailOption);

  const optionType = payload.voiceMailOption?.voiceMailOptionType;
  const isValidOptionType =
    optionType === 'hangup' || optionType === 'prompt' || optionType === 'static_text';
  if (!isValidOptionType) {
    payload.voiceMailOption = undefined;
  }

  if (payload.voiceMailOption?.voiceMailOptionType === 'hangup') {
    payload.voiceMailOption = { voiceMailOptionType: 'hangup' };
  } else if (payload.voiceMailOption?.text !== undefined) {
    payload.voiceMailOption = {
      ...payload.voiceMailOption,
      text: payload.voiceMailOption.text.trim(),
    };
  }
  if (payload.voiceMailOption?.text !== undefined) {
    payload.voiceMailMessage = payload.voiceMailOption.text;
  }
  if (payload.voiceMailOption) {
    const actionType = payload.voiceMailOption.voiceMailOptionType;
    // Keep legacy fields for current backend persistence.
    payload.voiceMailDetection = {
      action:
        actionType === 'prompt'
          ? { type: actionType, prompt: payload.voiceMailOption.text }
          : actionType === 'static_text'
            ? { type: actionType, text: payload.voiceMailOption.text }
            : { type: 'hangup' },
    };
    // Workaround for backend JSON deserialization bug on VoiceMailOption (validCombination field).
    // Explicitly clear canonical option objects and rely on voiceMailDetection/voiceMailMessage.
    (payload as unknown as Record<string, unknown>).voiceMailOption = null;
    (payload as unknown as Record<string, unknown>).voicemailOption = null;
    (payload as unknown as Record<string, unknown>).voicemail_option = null;
  } else if (!payload.enableVoicemailDetection) {
    (payload as unknown as Record<string, unknown>).voiceMailOption = null;
    (payload as unknown as Record<string, unknown>).voicemailOption = null;
    (payload as unknown as Record<string, unknown>).voicemail_option = null;
    payload.voiceMailDetection = undefined;
    payload.voiceMailMessage = undefined;
  }

  payload.ivrOption = sanitizeIvrOption(payload.ivrOption);
  if (payload.ivrOption?.action.type === 'hangup') {
    payload.ivrOption = { action: { type: 'hangup' } };
  } else {
    delete payload.ivrOption;
  }

  if (payload.piiConfig?.mode) {
    const rawMode = String(payload.piiConfig.mode).trim();
    const normalizedMode = rawMode.toLowerCase() === 'post_call' ? 'POST_CALL' : rawMode;
    const categories = Array.isArray(payload.piiConfig.categories)
      ? payload.piiConfig.categories.filter((c) => typeof c === 'string' && c.trim().length > 0)
      : [];
    if (categories.length === 0) {
      payload.piiConfig = undefined;
    } else {
      payload.piiConfig = {
        ...payload.piiConfig,
        mode: normalizedMode as PiiModeType,
        categories: categories as PiiCategoriesType,
      };
    }
  }

  if (Array.isArray(payload.postCallAnalysisData)) {
    const sanitized = payload.postCallAnalysisData
      .map((field) => sanitizePostCallFieldForPayload(field as PostCallField))
      .filter((field): field is PostCallField => field !== null);
    payload.postCallAnalysisData = { data: sanitized };
  }
  payload.postCallAnalysisModel =
    typeof payload.postCallAnalysisModel === 'string' &&
      payload.postCallAnalysisModel.trim().length > 0
      ? payload.postCallAnalysisModel.trim()
      : DEFAULT_POST_CALL_ANALYSIS_MODEL;

  delete payload.userDtmfOptions;
  delete payload.language;

  return payload;
};

async function patchJson<T>(url: string, body: unknown): Promise<SaveResult<T>> {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    cache: 'no-store',
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let parsed: unknown = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = null;
  }

  if (!res.ok) {
    const message =
      isRecord(parsed) && typeof parsed.message === 'string'
        ? parsed.message
        : text || `Request failed (HTTP ${res.status}).`;
    return { ok: false, status: res.status, message };
  }

  return { ok: true, data: (parsed as T) ?? ({} as T) };
}

const SECTIONS: {
  id: SectionId;
  label: string;
  group: 'agent' | 'llm' | 'advanced';
  disabled?: boolean;
}[] = [
    { id: 'call', label: 'Call Settings', group: 'agent' },
    { id: 'speech', label: 'Speech Settings', group: 'agent' },
    { id: 'webhooks', label: 'Webhook Settings', group: 'agent' },
    { id: 'security', label: 'Security & DTMF', group: 'agent' },
    { id: 'postcall', label: 'Post-Call Extraction', group: 'agent' },
    { id: 'llm_kb', label: 'Knowledge Base', group: 'llm' },
    { id: 'llm_tools', label: 'Functions', group: 'llm' },
    { id: 'llm_mcps', label: 'LLM: MCPs', group: 'llm', disabled: true },
    { id: 'raw', label: 'Raw JSON', group: 'advanced' },
  ];

const PII_CATEGORY_GROUPS: Array<{
  title: string;
  items: Array<{ value: PiiCategoryType; label: string }>;
}> = [
    {
      title: 'Identity Information',
      items: [
        { value: 'PERSON_NAME', label: 'Person Name' },
        { value: 'DATE_OF_BIRTH', label: 'Date Of Birth' },
        { value: 'CUSTOMER_ACCOUNT_NUMBER', label: 'Customer Account Number' },
      ],
    },
    {
      title: 'Contact Information',
      items: [
        { value: 'ADDRESS', label: 'Address' },
        { value: 'EMAIL', label: 'Email' },
        { value: 'PHONE_NUMBER', label: 'Phone Number' },
      ],
    },
    {
      title: 'Government Identifiers',
      items: [
        { value: 'SSN', label: 'SSN' },
        { value: 'PASSPORT', label: 'Passport' },
        { value: 'DRIVER_LICENSE', label: 'Driver License' },
      ],
    },
    {
      title: 'Financial Information',
      items: [
        { value: 'CREDIT_CARD', label: 'Credit Card' },
        { value: 'BANK_ACCOUNT', label: 'Bank Account' },
      ],
    },
    {
      title: 'Security Credentials',
      items: [
        { value: 'PASSWORD', label: 'Password' },
        { value: 'PIN', label: 'Pin' },
      ],
    },
    {
      title: 'Health Information',
      items: [{ value: 'MEDICAL_ID', label: 'Medical Id' }],
    },
  ];

function resolveReacherrLlmId(agent: VoiceAgentDto): string | null {
  const re = agent.responseEngine as unknown;
  if (!isRecord(re)) return null;
  if (typeof re.type === 'string' && re.type.trim().length > 0 && re.type !== 'reacherr-llm') {
    return null;
  }
  if (typeof re.llmId === 'string' && re.llmId.trim().length > 0) return re.llmId;
  if (typeof re.engineId === 'string' && re.engineId.trim().length > 0) return re.engineId;
  return null;
}


export function AgentConfigEditor({
  initialAgent,
  initialLlm,
  initialConfig,
}: {
  initialAgent: VoiceAgentDto;
  initialLlm: ReacherrLlmDto | null;
  initialConfig?: EditorConfigDto | null;
}) {
  const [active, setActive] = React.useState<SectionId>('call');

  const [agentDraft, setAgentDraft] = React.useState<VoiceAgentDto>(normalizeAgentForEditor(initialAgent));
  const [llmDraft, setLlmDraft] = React.useState<ReacherrLlmDto | null>(initialLlm);

  const llmProviderOptions = React.useMemo(() => {
    return getLLMProviders(conversationConfigStoredResults);
  }, []);

  const [baselineAgent, setBaselineAgent] = React.useState(normalizeAgentForEditor(initialAgent));
  const [baselineLlm, setBaselineLlm] = React.useState(initialLlm);

  const [saving, setSaving] = React.useState<'idle' | 'agent' | 'llm' | 'all'>('idle');
  const [error, setError] = React.useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = React.useState<number | null>(null);

  const [postCallEditorOpen, setPostCallEditorOpen] = React.useState(false);
  const [piiEditorOpen, setPiiEditorOpen] = React.useState(false);
  const [ttsPickerOpen, setTtsPickerOpen] = React.useState(false);
  const [kbPickerOpen, setKbPickerOpen] = React.useState(false);
  const [isEditingAgentName, setIsEditingAgentName] = React.useState(false);
  const [editingPostCallIndex, setEditingPostCallIndex] = React.useState<number | null>(null);
  const [ttsDraftModel, setTtsDraftModel] = React.useState('');
  const [ttsDraftVoiceId, setTtsDraftVoiceId] = React.useState('');
  const [ttsVoiceProviderFilter, setTtsVoiceProviderFilter] = React.useState('all');
  const [postCallDraft, setPostCallDraft] = React.useState<PostCallDraft>({
    type: 'string',
    name: '',
    description: '',
  });
  const kbPickerRef = React.useRef<HTMLDivElement | null>(null);

  const agentDirty = stringifyStable(agentDraft) !== stringifyStable(baselineAgent);
  const llmDirty =
    llmDraft && baselineLlm ? stringifyStable(llmDraft) !== stringifyStable(baselineLlm) : false;

  const llmId = resolveReacherrLlmId(agentDraft);

  // Initialize dropdowns: normalize backend values (label vs slug).
  const didInitRef = React.useRef(false);
  React.useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    setLlmDraft((prev) => {
      if (!prev) return prev;
      const providers = llmProviderOptions.map((p) => ({ label: p.label, value: p.value, models: p.models }));

      let provider = prev.provider ?? '';
      let model = prev.model ?? '';

      // Infer provider if missing but model exists.
      if (!provider.trim() && model.trim()) {
        for (const p of providers) {
          const match =
            findByValueOrLabel(p.models.map((m) => ({ label: m.label, value: m.value })), model) ??
            p.models.find((m) => m.value === model) ??
            null;
          if (match) {
            provider = p.value;
            model = match.value;
            break;
          }
        }
      }

      if (provider.trim()) {
        const providerOpt = findByValueOrLabel(providers.map((p) => ({ label: p.label, value: p.value })), provider);
        const normalizedProvider = providerOpt?.value ?? provider;
        const models = providers.find((p) => p.value === normalizedProvider)?.models ?? [];
        const modelOpt =
          model.trim().length > 0
            ? findByValueOrLabel(models.map((m) => ({ label: m.label, value: m.value })), model) ??
            models.find((m) => m.value === model) ??
            null
            : models[0] ?? null;
        const normalizedModel = modelOpt?.value ?? model;

        if (normalizedProvider !== prev.provider || normalizedModel !== prev.model) {
          return { ...prev, provider: normalizedProvider, model: normalizedModel };
        }
      }

      return prev;
    });
  }, [llmProviderOptions]);

  const saveAgent = async () => {
    const dtmfError = validateUserDtmfOption(agentDraft.allowUserDtmf, agentDraft.userDtmfOption);
    if (dtmfError) {
      setError(dtmfError);
      return;
    }
    const voicemailError = validateVoicemailOption(
      agentDraft.enableVoicemailDetection,
      agentDraft.voiceMailOption
    );
    if (voicemailError) {
      setError(voicemailError);
      return;
    }
    const ttsProviderError = validateTtsProviderMatch(agentDraft.voiceModel, agentDraft.voiceId);
    if (ttsProviderError) {
      setError(ttsProviderError);
      return;
    }
    setSaving('agent');
    setError(null);
    try {
      const agentId = agentDraft.agentId;
      const url = `/api/agents/update${agentId ? `?agentId=${encodeURIComponent(agentId)}` : ''}`;
      const result = await patchJson<VoiceAgentDto>(url, buildAgentPayload(agentDraft));
      if (!result.ok) {
        setError(normalizeAgentSaveErrorMessage(result.message));
        return;
      }
      const normalized = normalizeAgentForEditor(result.data);
      setBaselineAgent(normalized);
      setAgentDraft(normalized);
      setLastSavedAt(Date.now());
    } finally {
      setSaving('idle');
    }
  };

  const saveLlm = async () => {
    if (!llmDraft) return;
    setSaving('llm');
    setError(null);
    try {
      const id = llmDraft.llmId ?? llmId;
      const url = `/api/llm/update${id ? `?llmId=${encodeURIComponent(id)}` : ''}`;
      const result = await patchJson<ReacherrLlmDto>(url, llmDraft);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setBaselineLlm(result.data);
      setLlmDraft(result.data);
      setLastSavedAt(Date.now());
    } finally {
      setSaving('idle');
    }
  };

  const saveLlmTemperature = async (nextTemperature: number) => {
    if (!llmDraft) return;
    setSaving('llm');
    setError(null);
    try {
      const id = llmDraft.llmId ?? llmId;
      const url = `/api/llm/update${id ? `?llmId=${encodeURIComponent(id)}` : ''}`;
      const nextDraft: ReacherrLlmDto = {
        ...llmDraft,
        temperature: nextTemperature,
      };
      const result = await patchJson<ReacherrLlmDto>(url, nextDraft);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setBaselineLlm(result.data);
      setLlmDraft(result.data);
      setLastSavedAt(Date.now());
    } finally {
      setSaving('idle');
    }
  };

  const saveAll = async () => {
    const needsAgent = agentDirty;
    const needsLlm = llmDirty;
    if (!needsAgent && !needsLlm) return;

    const dtmfError = validateUserDtmfOption(agentDraft.allowUserDtmf, agentDraft.userDtmfOption);
    if (dtmfError) {
      setError(dtmfError);
      return;
    }
    const voicemailError = validateVoicemailOption(
      agentDraft.enableVoicemailDetection,
      agentDraft.voiceMailOption
    );
    if (voicemailError) {
      setError(voicemailError);
      return;
    }
    const ttsProviderError = validateTtsProviderMatch(agentDraft.voiceModel, agentDraft.voiceId);
    if (ttsProviderError) {
      setError(ttsProviderError);
      return;
    }

    setSaving('all');
    setError(null);
    try {
      if (needsAgent) {
        const agentId = agentDraft.agentId;
        const url = `/api/agents/update${agentId ? `?agentId=${encodeURIComponent(agentId)}` : ''}`;
        const agentResult = await patchJson<VoiceAgentDto>(url, buildAgentPayload(agentDraft));
        if (!agentResult.ok) {
          setError(normalizeAgentSaveErrorMessage(agentResult.message));
          return;
        }
        const normalized = normalizeAgentForEditor(agentResult.data);
        setBaselineAgent(normalized);
        setAgentDraft(normalized);
      }

      if (needsLlm && llmDraft) {
        const id = llmDraft.llmId ?? llmId;
        const url = `/api/llm/update${id ? `?llmId=${encodeURIComponent(id)}` : ''}`;
        const llmResult = await patchJson<ReacherrLlmDto>(url, llmDraft);
        if (!llmResult.ok) {
          setError(llmResult.message);
          return;
        }
        setBaselineLlm(llmResult.data);
        setLlmDraft(llmResult.data);
      }

      setLastSavedAt(Date.now());
    } finally {
      setSaving('idle');
    }
  };

  const resetAll = () => {
    setAgentDraft(baselineAgent);
    setLlmDraft(baselineLlm);
    setError(null);
    setActive('call');
  };

  const llmSectionsEnabled = Boolean(llmDraft) && Boolean(llmId);
  const piiCategories = (agentDraft.piiConfig?.categories ?? []) as PiiCategoriesType;
  const selectedLanguageCode = (agentDraft.languageEnum ??
    agentDraft.language ??
    'en') as UiLanguageCode;
  const configDrivenLlmModelOptions = React.useMemo(() => {
    if (!llmDraft || !Array.isArray(initialConfig?.llmModels) || initialConfig.llmModels.length === 0) {
      return [];
    }
    const currentProvider = (llmDraft.provider ?? '').trim().toLowerCase();
    const byProvider = currentProvider
      ? initialConfig.llmModels.filter(
        (model) =>
          typeof model?.provider === 'string' &&
          model.provider.toLowerCase() === currentProvider
      )
      : initialConfig.llmModels;
    return ensureOption(
      byProvider
        .filter((model): model is { modelId: string; displayName?: string } => typeof model?.modelId === 'string')
        .map((model) => ({
          value: model.modelId,
          label: model.displayName?.trim() || model.modelId,
        })),
      llmDraft.model,
      'Custom'
    );
  }, [initialConfig?.llmModels, llmDraft]);
  const llmModelOptions = React.useMemo(() => {
    if (configDrivenLlmModelOptions.length > 0) return configDrivenLlmModelOptions;
    if (!llmDraft) return [];
    const provider = llmDraft.provider ?? '';
    const models = llmProviderOptions.find((p) => p.value === provider)?.models ?? [];
    return ensureOption(
      models.map((m) => ({ label: m.label, value: m.value })),
      llmDraft.model,
      'Custom'
    );
  }, [configDrivenLlmModelOptions, llmDraft, llmProviderOptions]);
  const defaultLlmModelValue = React.useMemo(
    () => resolveDefaultLlmModelValue(llmModelOptions),
    [llmModelOptions]
  );
  const postCallAnalysisModelOptions = React.useMemo(() => {
    const configModels = Array.isArray(initialConfig?.llmModels)
      ? initialConfig.llmModels
        .filter(
          (model): model is { modelId: string; displayName?: string } =>
            typeof model?.modelId === 'string'
        )
        .map((model) => ({
          value: model.modelId,
          label: model.displayName?.trim() || model.modelId,
        }))
      : [];
    const providerModels = llmProviderOptions.flatMap((provider) =>
      provider.models.map((model) => ({ value: model.value, label: model.label }))
    );
    return ensureOption(
      dedupeByValue([...configModels, ...providerModels]),
      agentDraft.postCallAnalysisModel,
      'Custom'
    );
  }, [agentDraft.postCallAnalysisModel, initialConfig?.llmModels, llmProviderOptions]);
  React.useEffect(() => {
    if (!defaultLlmModelValue) return;
    setLlmDraft((prev) => {
      if (!prev) return prev;
      if ((prev.model ?? '').trim().length > 0) return prev;
      return { ...prev, model: defaultLlmModelValue };
    });
  }, [defaultLlmModelValue]);
  React.useEffect(() => {
    setAgentDraft((prev) => {
      if ((prev.postCallAnalysisModel ?? '').trim().length > 0) return prev;
      return { ...prev, postCallAnalysisModel: DEFAULT_POST_CALL_ANALYSIS_MODEL };
    });
  }, []);
  React.useEffect(() => {
    if (!agentDraft.allowUserDtmf) return;
    setAgentDraft((prev) => {
      if (typeof prev.userDtmfOption?.timeout_ms === 'number') return prev;
      return {
        ...prev,
        userDtmfOption: {
          ...(prev.userDtmfOption ?? {}),
          timeout_ms: DTMF_TIMEOUT_DEFAULT_MS,
        },
        userDtmfOptions: {
          ...(prev.userDtmfOption ?? {}),
          timeout_ms: DTMF_TIMEOUT_DEFAULT_MS,
        },
      };
    });
  }, [agentDraft.allowUserDtmf]);
  const knowledgeBaseOptions = React.useMemo(() => {
    if (!Array.isArray(initialConfig?.knowledgeBases)) return [];
    return initialConfig.knowledgeBases
      .filter(
        (kb): kb is KnowledgeBaseDto =>
          typeof kb?.knowledgeBaseId === 'string' &&
          kb.knowledgeBaseId.trim().length > 0 &&
          typeof kb?.knowledgeBaseName === 'string'
      )
      .map((kb) => ({
        id: kb.knowledgeBaseId.trim(),
        name: kb.knowledgeBaseName.trim(),
        status: kb.status,
        sourceCount: Array.isArray(kb.knowledgeBaseSources) ? kb.knowledgeBaseSources.length : 0,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [initialConfig?.knowledgeBases]);
  const selectedKnowledgeBaseIds = React.useMemo(() => {
    if (!Array.isArray(llmDraft?.knowledgeBaseIds)) return [];
    return llmDraft.knowledgeBaseIds
      .filter((id): id is string => typeof id === 'string')
      .map((id) => id.trim())
      .filter((id) => id.length > 0);
  }, [llmDraft?.knowledgeBaseIds]);
  const toggleKnowledgeBaseSelection = (knowledgeBaseId: string, checked: boolean) => {
    setLlmDraft((prev) => {
      if (!prev) return prev;
      const current = new Set(
        (prev.knowledgeBaseIds ?? [])
          .filter((id): id is string => typeof id === 'string')
          .map((id) => id.trim())
          .filter((id) => id.length > 0)
      );
      if (checked) current.add(knowledgeBaseId);
      else current.delete(knowledgeBaseId);
      return {
        ...prev,
        knowledgeBaseIds: Array.from(current),
      };
    });
  };
  const selectedKnowledgeBaseSet = React.useMemo(
    () => new Set(selectedKnowledgeBaseIds),
    [selectedKnowledgeBaseIds]
  );
  const unselectedKnowledgeBaseOptions = React.useMemo(
    () => knowledgeBaseOptions.filter((kb) => !selectedKnowledgeBaseSet.has(kb.id)),
    [knowledgeBaseOptions, selectedKnowledgeBaseSet]
  );
  const knowledgeBaseOptionMap = React.useMemo(
    () => new Map(knowledgeBaseOptions.map((kb) => [kb.id, kb])),
    [knowledgeBaseOptions]
  );
  const selectedKnowledgeBases = React.useMemo(
    () =>
      selectedKnowledgeBaseIds.map((id) => {
        const matched = knowledgeBaseOptionMap.get(id);
        return (
          matched ?? {
            id,
            name: id,
            status: 'COMPLETE' as const,
            sourceCount: 0,
          }
        );
      }),
    [knowledgeBaseOptionMap, selectedKnowledgeBaseIds]
  );
  React.useEffect(() => {
    if (!kbPickerOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!kbPickerRef.current) return;
      if (kbPickerRef.current.contains(event.target as Node)) return;
      setKbPickerOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [kbPickerOpen]);
  React.useEffect(() => {
    setKbPickerOpen(false);
  }, [active]);
  const selectedTtsModel = agentDraft.voiceModel;
  const ttsModelOptions = React.useMemo(() => {
    const currentModel = selectedTtsModel;
    if (!Array.isArray(initialConfig?.ttsModels) || initialConfig.ttsModels.length === 0) {
      return ensureOption(
        currentModel ? [{ label: currentModel, value: currentModel }] : [],
        currentModel,
        'Custom'
      );
    }
    return ensureOption(
      initialConfig.ttsModels
        .filter(
          (model): model is { modelId: string; displayName?: string; provider?: string } =>
            typeof model?.modelId === 'string' &&
            String(model.provider ?? '').trim().toLowerCase() !== 'cartesia'
        )
        .map((model) => ({
          value: model.modelId,
          label: `${model.displayName?.trim() || model.modelId}${model.provider ? ` (${model.provider})` : ''}`,
        })),
      currentModel,
      'Custom'
    );
  }, [initialConfig?.ttsModels, selectedTtsModel]);
  const ttsVoiceCatalog = React.useMemo(() => {
    if (!Array.isArray(initialConfig?.voices)) return [];
    const selectedLang = selectedLanguageCode.trim().toLowerCase();
    return initialConfig.voices
      .filter(
        (voice): voice is NonNullable<EditorConfigDto['voices']>[number] =>
          typeof voice?.voiceId === 'string' && voice.voiceId.trim().length > 0
      )
      .filter((voice) => {
        if (Array.isArray(voice.supportedLanguages) && voice.supportedLanguages.length > 0) {
          const supported = voice.supportedLanguages.map((lang) => String(lang).trim().toLowerCase());
          if (!supported.includes(selectedLang)) return false;
        }
        return true;
      })
      .map((voice) => ({
        voiceId: (voice.voiceId ?? '').trim(),
        voiceName: (voice.voiceName ?? '').trim(),
        provider: (voice.provider ?? '').trim().toLowerCase(),
        gender: (voice.gender ?? '').trim(),
        accent: (voice.accent ?? '').trim(),
        age: (voice.age ?? '').trim(),
        avatarUrl: voice.avatarUrl ?? null,
        supportedLanguages: Array.isArray(voice.supportedLanguages) ? voice.supportedLanguages : [],
        recommended: Boolean(voice.recommended),
      }));
  }, [initialConfig?.voices, selectedLanguageCode]);
  const ttsVoiceProviderTabs = React.useMemo(() => {
    const unique = Array.from(
      new Set(ttsVoiceCatalog.map((voice) => voice.provider).filter((provider) => provider.length > 0))
    );
    return ['all', ...unique];
  }, [ttsVoiceCatalog]);
  const filteredTtsVoices = React.useMemo(() => {
    const providerFilter = ttsVoiceProviderFilter.trim().toLowerCase();
    return ttsVoiceCatalog.filter((voice) => {
      if (providerFilter !== 'all' && providerFilter.length > 0 && voice.provider !== providerFilter) {
        return false;
      }
      return true;
    });
  }, [ttsVoiceCatalog, ttsVoiceProviderFilter]);
  const recommendedTtsVoices = React.useMemo(
    () => filteredTtsVoices.filter((voice) => voice.recommended).slice(0, 6),
    [filteredTtsVoices]
  );
  const getCatalogVoiceIdForProvider = React.useCallback(
    (provider: string | undefined): string => {
      const providerLower = (provider ?? '').trim().toLowerCase();
      if (!providerLower) return '';
      return (ttsVoiceCatalog.find((voice) => voice.provider === providerLower)?.voiceId ?? '').trim();
    },
    [ttsVoiceCatalog]
  );
  React.useEffect(() => {
    const currentModel = (agentDraft.voiceModel ?? '').trim();
    const currentVoiceId = (agentDraft.voiceId ?? '').trim();
    const defaultModel = currentModel || ttsModelOptions[0]?.value || '';
    if (!defaultModel) return;

    const matchedModel = initialConfig?.ttsModels?.find((model) => model?.modelId === defaultModel);
    const provider =
      typeof matchedModel?.provider === 'string'
        ? matchedModel.provider
        : inferVoiceProviderFromModel(defaultModel);

    let defaultVoiceId = currentVoiceId;
    if (!defaultVoiceId) {
      const providerLower = provider.trim().toLowerCase();
      defaultVoiceId =
        (providerLower
          ? (ttsVoiceCatalog.find((voice) => voice.provider === providerLower)?.voiceId ?? '').trim()
          : '') ||
        (ttsVoiceCatalog[0]?.voiceId ?? '').trim();
    }

    if (currentModel === defaultModel && currentVoiceId === defaultVoiceId) return;

    setAgentDraft((prev) => ({
      ...prev,
      voiceModel: defaultModel,
      voiceId: defaultVoiceId || undefined,
    }));
  }, [
    agentDraft.voiceId,
    agentDraft.voiceModel,
    initialConfig?.ttsModels,
    ttsModelOptions,
    ttsVoiceCatalog,
  ]);
  const applyTtsSelection = () => {
    const model = ttsDraftModel.trim();
    const matched = initialConfig?.ttsModels?.find((m) => m?.modelId === model);
    const provider =
      typeof matched?.provider === 'string'
        ? matched.provider
        : inferVoiceProviderFromModel(model);
    const previousVoiceId = (agentDraft.voiceId ?? '').trim();
    const previousVoiceProvider = inferVoiceProviderFromVoiceId(previousVoiceId);
    const explicitVoiceId = ttsDraftVoiceId.trim();
    const voiceId =
      explicitVoiceId ||
      (provider &&
        previousVoiceId &&
        previousVoiceProvider &&
        provider.toLowerCase() === previousVoiceProvider.toLowerCase()
        ? previousVoiceId
        : getCatalogVoiceIdForProvider(provider));
    if (!model) {
      setError('TTS model is required.');
      return;
    }
    const providerMismatch = validateTtsProviderMatch(model, voiceId);
    if (providerMismatch) {
      setError(providerMismatch);
      return;
    }
    if (voiceId) {
      const matchedVoice = ttsVoiceCatalog.find(
        (voice) => voice.voiceId.toLowerCase() === voiceId.toLowerCase()
      );
      if (matchedVoice && matchedVoice.supportedLanguages.length > 0) {
        const supported = matchedVoice.supportedLanguages.map((lang) => lang.toLowerCase());
        if (!supported.includes(selectedLanguageCode.toLowerCase())) {
          const err = `Voice '${matchedVoice.voiceName || matchedVoice.voiceId}' (${matchedVoice.voiceId}) only supports ${matchedVoice.supportedLanguages.join(', ')}. It cannot be used for ${selectedLanguageCode}.`;
          setError(err);
          return;
        }
      }
    }
    setAgentDraft((prev) => ({
      ...prev,
      voiceModel: model,
      voiceId: voiceId || undefined,
    }));
    setError(null);
    setTtsPickerOpen(false);
  };
  const openTtsPicker = () => {
    setTtsDraftModel(selectedTtsModel ?? '');
    setTtsDraftVoiceId(agentDraft.voiceId ?? '');
    setTtsVoiceProviderFilter(
      inferVoiceProviderFromModel(selectedTtsModel).trim().toLowerCase() || 'all'
    );
    setTtsPickerOpen(true);
  };
  const handleTtsDraftModelChange = (nextModel: string) => {
    const nextProvider =
      initialConfig?.ttsModels?.find((model) => model?.modelId === nextModel)?.provider ?? '';
    const currentVoiceProvider = inferVoiceProviderFromVoiceId(ttsDraftVoiceId);
    setTtsDraftModel(nextModel);
    if (
      nextProvider &&
      currentVoiceProvider &&
      nextProvider.toLowerCase() !== currentVoiceProvider.toLowerCase()
    ) {
      setTtsDraftVoiceId(getCatalogVoiceIdForProvider(nextProvider));
    }
    if (nextProvider.trim().length > 0) {
      setTtsVoiceProviderFilter(nextProvider.trim().toLowerCase());
    }
  };
  const selectedVoiceId = (agentDraft.voiceId ?? '').trim();
  const selectedTtsVoice =
    selectedVoiceId.length > 0
      ? ttsVoiceCatalog.find((voice) => voice.voiceId.toLowerCase() === selectedVoiceId.toLowerCase()) ?? null
      : null;

  const postCallFields = (agentDraft.postCallAnalysisData ?? []) as PostCallField[];

  const togglePiiCategory = (category: PiiCategoryType, checked: boolean) => {
    setAgentDraft((prev) => {
      const current = new Set((prev.piiConfig?.categories ?? []) as string[]);
      if (checked) current.add(category);
      else current.delete(category);
      const nextCategories = Array.from(current) as PiiCategoriesType;

      return {
        ...prev,
        piiConfig: {
          mode: 'POST_CALL' as PiiModeType,
          categories: nextCategories,
        },
      };
    });
  };

  const openCreatePostCallField = () => {
    setEditingPostCallIndex(null);
    setPostCallDraft({ type: 'string', name: '', description: '' });
    setPostCallEditorOpen(true);
  };

  const openEditPostCallField = (index: number) => {
    const existing = postCallFields[index];
    if (!existing) return;
    setEditingPostCallIndex(index);
    setPostCallDraft(existing as PostCallDraft);
    setPostCallEditorOpen(true);
  };

  const deletePostCallField = (index: number) => {
    setAgentDraft((prev) => {
      const next = Array.isArray(prev.postCallAnalysisData) ? [...prev.postCallAnalysisData] : [];
      next.splice(index, 1);
      return { ...prev, postCallAnalysisData: next };
    });
  };

  const savePostCallField = () => {
    const cleanedType =
      typeof postCallDraft.type === 'string' ? postCallDraft.type.trim().toLowerCase() : 'string';
    const cleanedName =
      typeof postCallDraft.name === 'string' ? postCallDraft.name.trim() : '';
    const cleanedDescription =
      typeof postCallDraft.description === 'string' ? postCallDraft.description.trim() : '';
    if (!cleanedName || !cleanedDescription) {
      setError('Post-call field requires both name and description.');
      return;
    }

    let cleaned: PostCallDraft | null = null;
    if (cleanedType === 'string') {
      const examples = cleanStringList(postCallDraft.examples);
      if (!examples) {
        setError('String post-call field requires at least one example.');
        return;
      }
      cleaned = {
        type: 'string',
        name: cleanedName,
        description: cleanedDescription,
        examples,
      };
    } else if (cleanedType === 'enum') {
      const choices = cleanStringList(postCallDraft.choices);
      if (!choices) {
        setError('Enum post-call field requires at least one choice.');
        return;
      }
      cleaned = {
        type: 'enum',
        name: cleanedName,
        description: cleanedDescription,
        choices,
      };
    } else if (cleanedType === 'number' || cleanedType === 'boolean') {
      cleaned = {
        type: cleanedType,
        name: cleanedName,
        description: cleanedDescription,
      };
    } else {
      setError(`Unsupported post-call field type: ${cleanedType}`);
      return;
    }

    setError(null);

    setAgentDraft((prev) => {
      const next = Array.isArray(prev.postCallAnalysisData) ? [...prev.postCallAnalysisData] : [];
      if (editingPostCallIndex === null) next.push(cleaned);
      else next.splice(editingPostCallIndex, 1, cleaned);
      return { ...prev, postCallAnalysisData: next };
    });

    setPostCallEditorOpen(false);
  };

  const sectionIcon = (id: SectionId) => {
    switch (id) {
      case 'call':
        return <PhoneCall className="size-4 text-white/60" />;
      case 'webhooks':
        return <Webhook className="size-4 text-white/60" />;
      case 'speech':
        return <Speech className="size-4 text-white/60" />;
      case 'security':
        return <Shield className="size-4 text-white/60" />;
      case 'postcall':
        return <ListChecks className="size-4 text-white/60" />;
      case 'llm_kb':
        return <BookOpen className="size-4 text-white/60" />;
      case 'llm_tools':
        return <Wrench className="size-4 text-white/60" />;
      case 'llm_mcps':
        return <Boxes className="size-4 text-white/60" />;
      case 'raw':
        return <Code className="size-4 text-white/60" />;
      default:
        return <div className="size-4" aria-hidden />;
    }
  };

  return (
    <div className="h-[90vh] w-full">
      <div className="h-full mx-auto grid w-full p-1 max-w-none gap-1 text-white lg:grid-cols-12">
        <div className="order-3 lg:col-span-3">
          <div className="h-full rounded-md border border-white/10 bg-[radial-gradient(900px_circle_at_15%_12%,rgba(255,255,255,0.08)_0%,rgba(56,66,218,0.25)_36%,rgba(0,0,0,0.95)_72%,rgba(0,0,0,1)_100%)] p-6 shadow-[0_34px_120px_rgba(0,0,0,0.45)] sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">
                  Agent Config
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={resetAll}
                  disabled={saving !== 'idle' || (!agentDirty && !llmDirty)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={saveAll}
                  disabled={saving !== 'idle' || (!agentDirty && !llmDirty)}
                  className="rounded-2xl border border-white/15 bg-white/15 px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_60px_rgba(12,14,55,0.55)] transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving === 'all' ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-white/60">
              <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">
                Agent: {agentDirty ? 'Unsaved changes' : 'Saved'}
              </span>
              <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">
                LLM: {llmSectionsEnabled ? (llmDirty ? 'Unsaved changes' : 'Saved') : 'Not linked'}
              </span>
              {lastSavedAt ? (
                <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">
                  Last saved: {new Date(lastSavedAt).toLocaleString()}
                </span>
              ) : null}
            </div>

            {error ? (
              <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <div className="mt-8">
              {active === 'call' ? (
                <div className="grid gap-8">

                  <VoicemailSettings
                    enabled={Boolean(agentDraft.enableVoicemailDetection)}
                    optionType={agentDraft.voiceMailOption?.voiceMailOptionType as VoiceMailActionType | undefined}
                    text={agentDraft.voiceMailOption?.text ?? ''}
                    ivrHangupEnabled={agentDraft.ivrOption?.action?.type === 'hangup'}
                    saving={saving === 'agent'}
                    dirty={agentDirty}
                    onEnabledChange={(enabled) =>
                      setAgentDraft((prev) => ({
                        ...prev,
                        enableVoicemailDetection: enabled,
                        voiceMailOption: enabled
                          ? prev.voiceMailOption ?? { voiceMailOptionType: 'hangup' }
                          : prev.voiceMailOption,
                      }))
                    }
                    onOptionTypeChange={(nextType) =>
                      setAgentDraft((prev) => ({
                        ...prev,
                        voiceMailOption: nextType === 'hangup'
                          ? { voiceMailOptionType: 'hangup' }
                          : {
                            voiceMailOptionType: nextType,
                            text: prev.voiceMailOption?.text ?? '',
                          },
                      }))
                    }
                    onTextChange={(nextText) =>
                      setAgentDraft((prev) => ({
                        ...prev,
                        voiceMailOption: {
                          voiceMailOptionType:
                            prev.voiceMailOption?.voiceMailOptionType === 'prompt' ||
                              prev.voiceMailOption?.voiceMailOptionType === 'static_text'
                              ? prev.voiceMailOption.voiceMailOptionType
                              : 'static_text',
                          text: nextText,
                        },
                      }))
                    }
                    onIvrHangupEnabledChange={(enabled) =>
                      setAgentDraft((prev) => {
                        if (enabled) {
                          return {
                            ...prev,
                            ivrOption: { action: { type: 'hangup' } },
                          };
                        }
                        const next = { ...prev };
                        delete next.ivrOption;
                        return next;
                      })
                    }
                  />

                  <CallTimingSettings
                    maxCallDurationMs={agentDraft.maxCallDurationMs}
                    ringTimeOutMs={agentDraft.ringTimeOutMs}
                    endCallAfterSilenceMs={agentDraft.endCallAfterSilenceMs}
                    onMaxCallDurationChange={(next) =>
                      setAgentDraft((prev) => ({ ...prev, maxCallDurationMs: next }))
                    }
                    onRingTimeOutChange={(next) =>
                      setAgentDraft((prev) => ({ ...prev, ringTimeOutMs: next }))
                    }
                    onEndCallAfterSilenceChange={(next) =>
                      setAgentDraft((prev) => ({ ...prev, endCallAfterSilenceMs: next }))
                    }
                  />

                </div>
              ) : null}

              {active === 'webhooks' ? (
                <WebhookSettings
                  webhookUrl={agentDraft.webhookUrl}
                  webhookTimeoutMs={agentDraft.webhookTimeoutMs}
                  saving={saving === 'agent'}
                  dirty={agentDirty}
                  onWebhookUrlChange={(value) =>
                    setAgentDraft((prev) => ({ ...prev, webhookUrl: value }))
                  }
                  onWebhookTimeoutMsChange={(value) =>
                    setAgentDraft((prev) => ({ ...prev, webhookTimeoutMs: value }))
                  }
                  onSave={saveAgent}
                />
              ) : null}

              {active === 'speech' ? (
                <SpeechSettings
                  ambientSound={agentDraft.ambientSound}
                  ambientSoundVolume={agentDraft.ambientSoundVolume}
                  responsiveness={agentDraft.responsiveness}
                  interruptionSensitivity={agentDraft.interruptionSensitivity}
                  reminderTriggerTimeoutMs={agentDraft.reminderTriggerTimeoutMs}
                  reminderMaxCount={agentDraft.reminderMaxCount}
                  saving={saving === 'agent'}
                  dirty={agentDirty}
                  onAmbientSoundChange={(next) =>
                    setAgentDraft((prev) => ({ ...prev, ambientSound: next }))
                  }
                  onAmbientSoundVolumeChange={(next) =>
                    setAgentDraft((prev) => ({ ...prev, ambientSoundVolume: next }))
                  }
                  onResponsivenessChange={(next) =>
                    setAgentDraft((prev) => ({ ...prev, responsiveness: next }))
                  }
                  onInterruptionSensitivityChange={(next) =>
                    setAgentDraft((prev) => ({ ...prev, interruptionSensitivity: next }))
                  }
                  onReminderTriggerTimeoutMsChange={(next) =>
                    setAgentDraft((prev) => ({ ...prev, reminderTriggerTimeoutMs: next }))
                  }
                  onReminderMaxCountChange={(next) =>
                    setAgentDraft((prev) => ({ ...prev, reminderMaxCount: next }))
                  }
                  onSave={saveAgent}
                />
              ) : null}

              {active === 'security' ? (
                <SecuritySettings
                  allowUserDtmf={Boolean(agentDraft.allowUserDtmf)}
                  digitLimit={agentDraft.userDtmfOption?.digit_limit}
                  terminationKey={agentDraft.userDtmfOption?.termination_key}
                  timeoutMs={agentDraft.userDtmfOption?.timeout_ms ?? DTMF_TIMEOUT_DEFAULT_MS}
                  timeoutMinMs={DTMF_TIMEOUT_MIN_MS}
                  timeoutMaxMs={DTMF_TIMEOUT_MAX_MS}
                  timeoutStepMs={DTMF_TIMEOUT_STEP_MS}
                  terminationKeys={DTMF_TERMINATION_KEYS}
                  piiSelectedCategories={piiCategories as string[]}
                  piiCategoryGroups={PII_CATEGORY_GROUPS}
                  piiEditorOpen={piiEditorOpen}
                  saving={saving === 'agent'}
                  dirty={agentDirty}
                  onAllowUserDtmfChange={(enabled) =>
                    setAgentDraft((prev) => ({ ...prev, allowUserDtmf: enabled }))
                  }
                  onDigitLimitEnabledChange={(enabled) =>
                    setAgentDraft((prev) => {
                      const current = prev.userDtmfOption?.digit_limit;
                      const nextDigitLimit = enabled
                        ? (typeof current === 'number' && current >= 1 && current <= 50 ? current : 10)
                        : undefined;
                      return {
                        ...prev,
                        userDtmfOption: {
                          ...(prev.userDtmfOption ?? {}),
                          digit_limit: nextDigitLimit,
                        },
                        userDtmfOptions: {
                          ...(prev.userDtmfOption ?? {}),
                          digit_limit: nextDigitLimit,
                        },
                      };
                    })
                  }
                  onDigitLimitChange={(value) =>
                    setAgentDraft((prev) => ({
                      ...prev,
                      userDtmfOption: {
                        ...(prev.userDtmfOption ?? {}),
                        digit_limit: value,
                      },
                      userDtmfOptions: {
                        ...(prev.userDtmfOption ?? {}),
                        digit_limit: value,
                      },
                    }))
                  }
                  onTerminationKeyEnabledChange={(enabled) =>
                    setAgentDraft((prev) => {
                      const current = (prev.userDtmfOption?.termination_key ?? '').trim();
                      const nextTermination = enabled
                        ? (DTMF_TERMINATION_KEYS.includes(current as (typeof DTMF_TERMINATION_KEYS)[number])
                          ? current
                          : '#')
                        : undefined;
                      return {
                        ...prev,
                        userDtmfOption: {
                          ...(prev.userDtmfOption ?? {}),
                          termination_key: nextTermination,
                        },
                        userDtmfOptions: {
                          ...(prev.userDtmfOption ?? {}),
                          termination_key: nextTermination,
                        },
                      };
                    })
                  }
                  onTerminationKeyChange={(value) =>
                    setAgentDraft((prev) => ({
                      ...prev,
                      userDtmfOption: {
                        ...(prev.userDtmfOption ?? {}),
                        termination_key: value,
                      },
                      userDtmfOptions: {
                        ...(prev.userDtmfOption ?? {}),
                        termination_key: value,
                      },
                    }))
                  }
                  onTimeoutMsChange={(value) =>
                    setAgentDraft((prev) => ({
                      ...prev,
                      userDtmfOption: {
                        ...(prev.userDtmfOption ?? {}),
                        timeout_ms: value,
                      },
                      userDtmfOptions: {
                        ...(prev.userDtmfOption ?? {}),
                        timeout_ms: value,
                      },
                    }))
                  }
                  onEnsurePiiMode={() =>
                    setAgentDraft((prev) => ({
                      ...prev,
                      piiConfig: {
                        mode: 'POST_CALL' as PiiModeType,
                        categories: (prev.piiConfig?.categories ?? []) as PiiCategoriesType,
                      },
                    }))
                  }
                  onOpenPiiEditor={() => setPiiEditorOpen(true)}
                  onClosePiiEditor={() => setPiiEditorOpen(false)}
                  onTogglePiiCategory={(category, checked) =>
                    togglePiiCategory(category as PiiCategoryType, checked)
                  }
                  onSave={saveAgent}
                />
              ) : null}

              {active === 'postcall' ? (
                <PostCallSettings
                  fields={postCallFields}
                  postCallAnalysisModel={agentDraft.postCallAnalysisModel}
                  postCallAnalysisModelOptions={postCallAnalysisModelOptions}
                  saving={saving === 'agent'}
                  dirty={agentDirty}
                  editorOpen={postCallEditorOpen}
                  editingIndex={editingPostCallIndex}
                  draft={postCallDraft}
                  onOpenCreate={openCreatePostCallField}
                  onOpenEdit={openEditPostCallField}
                  onDelete={deletePostCallField}
                  onModelChange={(model) =>
                    setAgentDraft((prev) => ({ ...prev, postCallAnalysisModel: model }))
                  }
                  onSave={saveAgent}
                  onCloseEditor={() => setPostCallEditorOpen(false)}
                  onDraftChange={setPostCallDraft}
                  onSaveField={savePostCallField}
                />
              ) : null}

              {active.startsWith('llm_') ? (
                !llmSectionsEnabled || !llmDraft ? (
                  <div className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-sm text-white/60">
                    This agent does not have a Reacherr LLM linked.
                  </div>
                ) : active === 'llm_kb' ? (
                  <div className="grid gap-4">
                    <p className="text-sm text-white/60">
                      Add knowledge base to provide context to the agent.
                    </p>
                    <div className="grid gap-2">
                      {selectedKnowledgeBases.length === 0 ? (
                        <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/60">
                          No knowledge bases selected.
                        </div>
                      ) : (
                        selectedKnowledgeBases.map((kb) => (
                          <div
                            key={kb.id}
                            className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-2"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-white/90">{kb.name}</p>
                              <p className="text-xs text-white/55">
                                {kb.sourceCount} source(s) • {kb.status}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleKnowledgeBaseSelection(kb.id, false)}
                              className="rounded-lg border border-white/10 bg-black/40 p-1 text-white/65 transition hover:border-white/20 hover:text-white"
                              aria-label={`Remove ${kb.name}`}
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="relative" ref={kbPickerRef}>
                      <button
                        type="button"
                        onClick={() => setKbPickerOpen((prev) => !prev)}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
                      >
                        <Plus className="size-4" />
                        Add
                      </button>
                      {kbPickerOpen ? (
                        <div className="absolute left-0 z-20 mt-2 w-full max-w-md rounded-2xl border border-white/10 bg-[#0b1022] p-2 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
                          <div className="max-h-56 overflow-y-auto">
                            {unselectedKnowledgeBaseOptions.length === 0 ? (
                              <p className="px-3 py-2 text-xs text-white/55">
                                All knowledge bases are already selected.
                              </p>
                            ) : (
                              unselectedKnowledgeBaseOptions.map((kb) => (
                                <button
                                  key={kb.id}
                                  type="button"
                                  onClick={() => {
                                    toggleKnowledgeBaseSelection(kb.id, true);
                                    setKbPickerOpen(false);
                                  }}
                                  className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm text-white/85 transition hover:bg-white/10"
                                >
                                  <span className="truncate">{kb.name}</span>
                                  <span className="text-xs text-white/50">{kb.sourceCount}</span>
                                </button>
                              ))
                            )}
                          </div>
                          <div className="mt-2 border-t border-white/10 pt-2">
                            <button
                              type="button"
                              onClick={() => window.open('/knowledge-base', '_blank', 'noopener,noreferrer')}
                              className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-white/85 transition hover:bg-white/10"
                            >
                              Add New Knowledge Base
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                    {knowledgeBaseOptions.length === 0 ? (
                      <div className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-sm text-white/60">
                        No knowledge bases found in config.
                      </div>
                    ) : null}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <button
                        type="button"
                        onClick={saveLlm}
                        disabled={saving !== 'idle' || !llmDirty}
                        className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {saving === 'llm' ? 'Saving llm…' : 'Save llm'}
                      </button>
                    </div>
                  </div>
                ) : active === 'llm_tools' ? (
                  <LlmToolsSettings
                    tools={(llmDraft.generalTools ?? []) as NonNullable<ReacherrLlmDto['generalTools']>}
                    saving={saving === 'llm'}
                    dirty={llmDirty}
                    onToolsChange={(nextTools) =>
                      setLlmDraft((prev) => (prev ? { ...prev, generalTools: nextTools } : prev))
                    }
                    onSave={saveLlm}
                  />
                ) : active === 'llm_mcps' ? (
                  <div className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-sm text-white/60">
                    MCP configuration is coming soon.
                  </div>
                ) : null
              ) : null}

              {active === 'raw' ? (
                <div className="grid gap-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                      Voice Agent JSON
                    </p>
                    <textarea
                      value={JSON.stringify(agentDraft, null, 2)}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          if (isRecord(parsed)) {
                            setAgentDraft(normalizeAgentForEditor(parsed as unknown as VoiceAgentDto));
                          }
                        } catch {
                          // keep last valid
                        }
                      }}
                      className="mt-3 min-h-64 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-xs text-white/85 outline-none transition focus:border-white/25"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                      Reacherr LLM JSON
                    </p>
                    <textarea
                      value={JSON.stringify(llmDraft ?? {}, null, 2)}
                      onChange={(e) => {
                        if (!llmDraft) return;
                        try {
                          const parsed = JSON.parse(e.target.value);
                          if (isRecord(parsed)) setLlmDraft(parsed as unknown as ReacherrLlmDto);
                        } catch {
                          // keep last valid
                        }
                      }}
                      className="mt-3 min-h-64 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-xs text-white/85 outline-none transition focus:border-white/25"
                      disabled={!llmDraft}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="order-2 lg:col-span-3">
          <div className="h-full rounded-md border border-white/10 bg-white/5 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur">
            <div className="divide-y divide-white/10">
              {SECTIONS.filter((s) => {
                if (s.group === 'llm') return llmSectionsEnabled;
                return true;
              }).map((s) => {
                const isActive = active === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActive(s.id)}
                    disabled={Boolean(s.disabled)}
                    className={[
                      'flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30',
                      isActive ? 'bg-white/10' : 'hover:bg-white/5',
                      s.disabled ? 'cursor-not-allowed opacity-60 hover:bg-black/20' : '',
                    ].join(' ')}
                  >
                    <span className="shrink-0">{sectionIcon(s.id)}</span>
                    <span className="flex-1 font-semibold text-white/85">{s.label}</span>
                    {s.disabled ? (
                      <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">
                        coming soon
                      </span>
                    ) : null}
                    <ChevronRight
                      className={[
                        'size-4 shrink-0 transition',
                        isActive ? 'text-white/70' : 'text-white/35',
                      ].join(' ')}
                      aria-hidden
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="order-1 lg:col-span-6">
          <div className="h-full rounded-md border border-white/10 bg-[radial-gradient(800px_circle_at_70%_20%,rgba(255,255,255,0.06)_0%,rgba(56,66,218,0.16)_35%,rgba(0,0,0,0.95)_72%,rgba(0,0,0,1)_100%)] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.35)] sm:p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">
                Agent
              </p>
              <div className="mt-3 flex items-center gap-3">
                {isEditingAgentName ? (
                  <input
                    value={agentDraft.agentName ?? ''}
                    onChange={(e) =>
                      setAgentDraft((prev) => ({ ...prev, agentName: e.target.value }))
                    }
                    onBlur={() => setIsEditingAgentName(false)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        setIsEditingAgentName(false);
                      }
                    }}
                    autoFocus
                    className="h-11 w-full max-w-md rounded-2xl border border-white/10 bg-black/30 px-4 text-2xl font-semibold text-white/95 outline-none transition focus:border-white/25 sm:text-3xl"
                    placeholder="Unnamed Agent"
                  />
                ) : (
                  <>
                    <h1 className="text-2xl font-semibold sm:text-3xl">
                      {agentDraft.agentName || 'Unnamed Agent'}
                    </h1>
                    <button
                      type="button"
                      onClick={() => setIsEditingAgentName(true)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
                      aria-label="Edit agent name"
                    >
                      <Pencil className="size-4" />
                    </button>
                  </>
                )}
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                    LLM Model
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <LlmModelSelect
                        value={llmDraft?.model ?? ''}
                        options={llmModelOptions}
                        disabled={!llmDraft}
                        placeholder={llmDraft ? 'Select model' : 'Not linked'}
                        onValueChange={(model) => {
                          setLlmDraft((prev) => (prev ? { ...prev, model } : prev));
                        }}
                      />
                    </div>
                    <LlmTemperatureSettings
                      value={llmDraft?.temperature}
                      disabled={!llmDraft || saving !== 'idle'}
                      saving={saving === 'llm'}
                      onSave={saveLlmTemperature}
                    />
                  </div>
                </div>
                <TtsModelSettings
                  selectedTtsVoice={selectedTtsVoice}
                  selectedVoiceId={selectedVoiceId}
                  selectedTtsModel={selectedTtsModel ?? ''}
                  ttsPickerOpen={ttsPickerOpen}
                  ttsDraftModel={ttsDraftModel}
                  ttsDraftVoiceId={ttsDraftVoiceId}
                  ttsVoiceProviderFilter={ttsVoiceProviderFilter}
                  ttsModelOptions={ttsModelOptions}
                  ttsVoiceProviderTabs={ttsVoiceProviderTabs}
                  recommendedTtsVoices={recommendedTtsVoices}
                  filteredTtsVoices={filteredTtsVoices}
                  errorMessage={error}
                  onOpenPicker={openTtsPicker}
                  onClosePicker={() => setTtsPickerOpen(false)}
                  onSaveSelection={applyTtsSelection}
                  onTtsDraftModelChange={handleTtsDraftModelChange}
                  onTtsDraftVoiceIdChange={setTtsDraftVoiceId}
                  onTtsVoiceProviderFilterChange={setTtsVoiceProviderFilter}
                />
              </div>
            </div>

            {!llmSectionsEnabled || !llmDraft ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-sm text-white/60">
                Link an LLM to this agent to edit prompts.
              </div>
            ) : (
              <div className="mt-4 grid gap-4">
                <label className="grid gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                    General Prompt
                  </span>
                  <textarea
                    value={llmDraft.generalPrompt ?? ''}
                    onChange={(e) =>
                      setLlmDraft((prev) => (prev ? { ...prev, generalPrompt: e.target.value } : prev))
                    }
                    className="min-h-96 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/90 outline-none transition focus:border-white/25"
                  />
                </label>

                <BeginMessageSettings
                  startSpeaker={llmDraft.startSpeaker}
                  beginMessageDelay={llmDraft.beginMessageDelay}
                  beginMessage={llmDraft.beginMessage}
                  onStartSpeakerChange={(startSpeaker) =>
                    setLlmDraft((prev) => (prev ? { ...prev, startSpeaker } : prev))
                  }
                  onBeginMessageDelayChange={(beginMessageDelay) =>
                    setLlmDraft((prev) => (prev ? { ...prev, beginMessageDelay } : prev))
                  }
                  onBeginMessageChange={(beginMessage) =>
                    setLlmDraft((prev) => (prev ? { ...prev, beginMessage } : prev))
                  }
                />

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={saveLlm}
                    disabled={saving !== 'idle' || !llmDirty}
                    className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving === 'llm' ? 'Saving llm…' : 'Save llm'}
                  </button>
                  <span className="text-xs text-white/45">{llmDirty ? 'Unsaved changes' : 'Saved'}</span>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
