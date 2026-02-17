'use client';

import * as React from 'react';
import * as RPNInput from 'react-phone-number-input';
import flags from 'react-phone-number-input/flags';
import type { KnowledgeBaseDto, ReacherrLlmDto, VoiceAgentDto } from '@/types';
import {
  conversationConfigStoredResults,
  getLLMProviders,
} from '../_lib/conversation-config';
import { KNOWN_POST_CALL_FIELD_TYPES, type KnownPostCallFieldType, type PostCallField } from '@/types';
import {
  BookOpen,
  Boxes,
  Brain,
  CheckCircle2,
  ChevronRight,
  Code,
  Hash,
  ListChecks,
  PhoneCall,
  Pencil,
  Plus,
  Shield,
  Text,
  Trash2,
  Voicemail,
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
type UiCountry = RPNInput.Country;
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

const defaultVoiceIdForProvider = (provider: string | undefined): string => {
  const normalized = (provider ?? '').trim().toLowerCase();
  if (normalized === 'minimax') return 'minimax-Crystal';
  if (normalized === 'openai') return 'openai-Anna';
  if (normalized === 'elevenlabs') return '11labs-Andrew';
  return '';
};

const isPlaceholderVoiceId = (voiceId: string | undefined): boolean => {
  const normalized = (voiceId ?? '').trim().toLowerCase();
  if (!normalized) return false;
  return normalized.endsWith('-default') || normalized === 'alloy';
};

type SectionId =
  | 'call'
  | 'webhooks'
  | 'voicemail'
  | 'security'
  | 'postcall'
  | 'llm_model'
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
  if (option.timeout_ms !== undefined && (option.timeout_ms < 1000 || option.timeout_ms > 15000)) {
    return 'Timeout (ms) must be between 1000 and 15000.';
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

const normalizeVoicemailOption = (agent: VoiceAgentDto): VoiceAgentDto => {
  const legacyAgent = agent as VoiceAgentDto & {
    enableVoiceMailDetection?: boolean;
    voicemailOption?: VoiceAgentDto['voiceMailOption'];
    voiceMailDetection?: { action?: { type?: string; text?: string; prompt?: string } };
    voiceMailMessage?: string;
  };
  const legacyAction = legacyAgent
    .voiceMailDetection?.action;
  const normalizedEnableVoicemailDetection =
    typeof agent.enableVoicemailDetection === 'boolean'
      ? agent.enableVoicemailDetection
      : legacyAgent.enableVoiceMailDetection;
  const normalizedVoiceMailOption =
    sanitizeVoiceMailOption(agent.voiceMailOption) ??
    sanitizeVoiceMailOption(legacyAgent.voicemailOption);
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
  const languageEnum = withVoicemail.languageEnum ?? withVoicemail.language;
  const userDtmfOption = normalizeUserDtmfOption(
    withVoicemail.userDtmfOption ?? withVoicemail.userDtmfOptions
  );
  const normalizedPiiMode =
    withVoicemail.piiConfig?.mode &&
      String(withVoicemail.piiConfig.mode).trim().toLowerCase() === 'post_call'
      ? ('POST_CALL' as PiiModeType)
      : withVoicemail.piiConfig?.mode;
  const rawPostCall = withVoicemail.postCallAnalysisData as unknown;
  const normalizedPostCall = (Array.isArray(rawPostCall)
    ? rawPostCall
    : isRecord(rawPostCall) && Array.isArray(rawPostCall.data)
      ? rawPostCall.data
      : []) as PostCallField[];

  return {
    ...withVoicemail,
    languageEnum,
    language: languageEnum,
    userDtmfOption,
    userDtmfOptions: userDtmfOption,
    piiConfig: withVoicemail.piiConfig
      ? {
        ...withVoicemail.piiConfig,
        mode: normalizedPiiMode as PiiModeType,
      }
      : undefined,
    postCallAnalysisData: normalizedPostCall,
    ttsConfig:
      withVoicemail.ttsConfig ??
      (withVoicemail.voiceId || withVoicemail.voiceModel
        ? {
          provider: '',
          model: withVoicemail.voiceModel ?? '',
          voiceId: withVoicemail.voiceId ?? '',
        }
        : undefined),
  };
};

const buildAgentPayload = (draft: VoiceAgentDto): VoiceAgentDto => {
  const payload = normalizeVoicemailOption(draft) as VoiceAgentDto & {
    userDtmfOptions?: unknown;
    language?: unknown;
    voiceMailDetection?: unknown;
    enableVoiceMailDetection?: boolean;
    voiceMailMessage?: string;
    voicemailOption?: VoiceAgentDto['voiceMailOption'];
    postCallAnalysisData?: unknown;
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

  if (payload.ttsConfig?.voiceId) payload.voiceId = payload.ttsConfig.voiceId;
  if (payload.ttsConfig?.model) payload.voiceModel = payload.ttsConfig.model;

  const modelProvider = inferVoiceProviderFromModel(payload.voiceModel);
  const voiceProvider = inferVoiceProviderFromVoiceId(payload.voiceId);
  if (modelProvider && voiceProvider && modelProvider !== voiceProvider) {
    payload.voiceId = undefined;
    if (payload.ttsConfig) payload.ttsConfig.voiceId = '';
  }

  if (!payload.voiceId && modelProvider) {
    const autoVoiceId = defaultVoiceIdForProvider(modelProvider);
    if (autoVoiceId) {
      payload.voiceId = autoVoiceId;
      if (payload.ttsConfig) payload.ttsConfig.voiceId = autoVoiceId;
    }
  }

  if (isPlaceholderVoiceId(payload.voiceId)) {
    payload.voiceId = undefined;
  }

  const normalizedEnableVoicemailDetection =
    typeof payload.enableVoicemailDetection === 'boolean'
      ? payload.enableVoicemailDetection
      : payload.enableVoiceMailDetection;
  if (typeof normalizedEnableVoicemailDetection === 'boolean') {
    payload.enableVoicemailDetection = normalizedEnableVoicemailDetection;
    payload.enableVoiceMailDetection = normalizedEnableVoicemailDetection;
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
    payload.voicemailOption = payload.voiceMailOption;
    const actionType = payload.voiceMailOption.voiceMailOptionType;
    payload.voiceMailDetection = {
      action:
        actionType === 'prompt'
          ? { type: actionType, prompt: payload.voiceMailOption.text }
          : actionType === 'static_text'
            ? { type: actionType, text: payload.voiceMailOption.text }
            : { type: 'hangup' },
    };
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
    { id: 'webhooks', label: 'Webhook Settings', group: 'agent' },
    { id: 'voicemail', label: 'Voicemail', group: 'agent', disabled: true },
    { id: 'security', label: 'Security & DTMF', group: 'agent' },
    { id: 'postcall', label: 'Post-Call Extraction', group: 'agent' },
    { id: 'llm_model', label: 'LLM: Model', group: 'llm' },
    { id: 'llm_kb', label: 'LLM: Knowledge Base', group: 'llm' },
    { id: 'llm_tools', label: 'LLM: Tools', group: 'llm', disabled: true },
    { id: 'llm_mcps', label: 'LLM: MCPs', group: 'llm', disabled: true },
    { id: 'raw', label: 'Raw JSON', group: 'advanced' },
  ];

const LANGUAGE_OPTIONS: Array<{ code: UiLanguageCode; label: string; country: UiCountry }> = [
  { code: 'en', label: 'English', country: 'US' },
  { code: 'es', label: 'Spanish', country: 'ES' },
  { code: 'fr', label: 'French', country: 'FR' },
  { code: 'de', label: 'German', country: 'DE' },
  { code: 'it', label: 'Italian', country: 'IT' },
  { code: 'pt', label: 'Portuguese', country: 'PT' },
  { code: 'zh', label: 'Chinese', country: 'CN' },
  { code: 'ja', label: 'Japanese', country: 'JP' },
  { code: 'ko', label: 'Korean', country: 'KR' },
  { code: 'hi', label: 'Hindi', country: 'IN' },
  { code: 'bn', label: 'Bengali', country: 'BD' },
  { code: 'gu', label: 'Gujarati', country: 'IN' },
  { code: 'kn', label: 'Kannada', country: 'IN' },
  { code: 'ml', label: 'Malayalam', country: 'IN' },
  { code: 'mr', label: 'Marathi', country: 'IN' },
  { code: 'pa', label: 'Punjabi', country: 'IN' },
  { code: 'ta', label: 'Tamil', country: 'IN' },
  { code: 'te', label: 'Telugu', country: 'IN' },
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
  const [ttsVoiceSearch, setTtsVoiceSearch] = React.useState('');
  type PostCallDraft = PostCallField & { choices?: string[]; examples?: string[] };
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
    setSaving('agent');
    setError(null);
    try {
      const agentId = agentDraft.agentId;
      const url = `/api/agents/update${agentId ? `?agentId=${encodeURIComponent(agentId)}` : ''}`;
      const result = await patchJson<VoiceAgentDto>(url, buildAgentPayload(agentDraft));
      if (!result.ok) {
        setError(result.message);
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

    setSaving('all');
    setError(null);
    try {
      if (needsAgent) {
        const agentId = agentDraft.agentId;
        const url = `/api/agents/update${agentId ? `?agentId=${encodeURIComponent(agentId)}` : ''}`;
        const agentResult = await patchJson<VoiceAgentDto>(url, buildAgentPayload(agentDraft));
        if (!agentResult.ok) {
          setError(agentResult.message);
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
  const configuredLanguages = React.useMemo(() => {
    if (!Array.isArray(initialConfig?.languages) || initialConfig.languages.length === 0) return [];
    return initialConfig.languages
      .filter((entry): entry is { code: string; name?: string } => typeof entry?.code === 'string')
      .map((entry) => {
        const fallback = LANGUAGE_OPTIONS.find((opt) => opt.code === (entry.code as UiLanguageCode));
        return {
          code: entry.code as UiLanguageCode,
          label: entry.name?.trim() || fallback?.label || entry.code,
          country: fallback?.country,
        };
      });
  }, [initialConfig?.languages]);
  const languageOptions = configuredLanguages.length > 0 ? configuredLanguages : LANGUAGE_OPTIONS;
  const selectedLanguageCode = (agentDraft.languageEnum ??
    agentDraft.language ??
    'en') as UiLanguageCode;
  const selectedLanguage =
    languageOptions.find((option) => option.code === selectedLanguageCode) ?? languageOptions[0];
  const SelectedLanguageFlag =
    selectedLanguage?.country ? flags[selectedLanguage.country as UiCountry] : undefined;
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
  const selectedTtsModel = agentDraft.ttsConfig?.model ?? agentDraft.voiceModel;
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
    const search = ttsVoiceSearch.trim().toLowerCase();
    return ttsVoiceCatalog.filter((voice) => {
      if (providerFilter !== 'all' && providerFilter.length > 0 && voice.provider !== providerFilter) {
        return false;
      }
      if (!search) return true;
      const haystack = [
        voice.voiceName,
        voice.voiceId,
        voice.provider,
        voice.gender,
        voice.accent,
        voice.age,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(search);
    });
  }, [ttsVoiceCatalog, ttsVoiceProviderFilter, ttsVoiceSearch]);
  const recommendedTtsVoices = React.useMemo(
    () => filteredTtsVoices.filter((voice) => voice.recommended).slice(0, 6),
    [filteredTtsVoices]
  );
  const applyTtsSelection = () => {
    const model = ttsDraftModel.trim();
    const matched = initialConfig?.ttsModels?.find((m) => m?.modelId === model);
    const provider =
      typeof matched?.provider === 'string'
        ? matched.provider
        : (agentDraft.ttsConfig?.provider ?? '') || inferVoiceProviderFromModel(model);
    const previousVoiceId = (agentDraft.ttsConfig?.voiceId ?? agentDraft.voiceId ?? '').trim();
    const previousVoiceProvider = inferVoiceProviderFromVoiceId(previousVoiceId);
    const explicitVoiceId = ttsDraftVoiceId.trim();
    const voiceId =
      explicitVoiceId ||
      (provider &&
        previousVoiceId &&
        previousVoiceProvider &&
        provider.toLowerCase() === previousVoiceProvider.toLowerCase()
        ? previousVoiceId
        : defaultVoiceIdForProvider(provider));
    if (!model) {
      setError('TTS model is required.');
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
      ttsConfig: {
        ...(prev.ttsConfig ?? {
          provider,
          voiceId: prev.voiceId ?? '',
        }),
        provider,
        model,
        voiceId: voiceId || '',
      },
    }));
    setError(null);
    setTtsPickerOpen(false);
  };

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

  const postCallIcon = (type: string) => {
    switch (type) {
      case 'boolean':
        return <CheckCircle2 className="size-5 text-white/70" />;
      case 'enum':
        return <ListChecks className="size-5 text-white/70" />;
      case 'number':
        return <Hash className="size-5 text-white/70" />;
      case 'string':
      default:
        return <Text className="size-5 text-white/70" />;
    }
  };

  const sectionIcon = (id: SectionId) => {
    switch (id) {
      case 'call':
        return <PhoneCall className="size-4 text-white/60" />;
      case 'webhooks':
        return <Webhook className="size-4 text-white/60" />;
      case 'voicemail':
        return <Voicemail className="size-4 text-white/60" />;
      case 'security':
        return <Shield className="size-4 text-white/60" />;
      case 'postcall':
        return <ListChecks className="size-4 text-white/60" />;
      case 'llm_model':
        return <Brain className="size-4 text-white/60" />;
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
                <div className="grid gap-4">
                  <div className="grid gap-4">
                    <label className="grid gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                        Max Call Duration (ms)
                      </span>
                      <input
                        inputMode="numeric"
                        value={agentDraft.maxCallDurationMs ?? ''}
                        onChange={(e) =>
                          setAgentDraft((prev) => ({
                            ...prev,
                            maxCallDurationMs: e.target.value === '' ? undefined : Number(e.target.value),
                          }))
                        }
                        className="h-11 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white/90 outline-none transition focus:border-white/25"
                      />
                    </label>
                    <label className="grid gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                        Ring Timeout (ms)
                      </span>
                      <input
                        inputMode="numeric"
                        value={agentDraft.ringTimeOutMs ?? ''}
                        onChange={(e) =>
                          setAgentDraft((prev) => ({
                            ...prev,
                            ringTimeOutMs: e.target.value === '' ? undefined : Number(e.target.value),
                          }))
                        }
                        className="h-11 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white/90 outline-none transition focus:border-white/25"
                      />
                    </label>
                    <label className="grid gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                        Webhook Timeout (ms)
                      </span>
                      <input
                        inputMode="numeric"
                        value={agentDraft.webhookTimeoutMs ?? ''}
                        onChange={(e) =>
                          setAgentDraft((prev) => ({
                            ...prev,
                            webhookTimeoutMs: e.target.value === '' ? undefined : Number(e.target.value),
                          }))
                        }
                        className="h-11 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white/90 outline-none transition focus:border-white/25"
                      />
                    </label>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      type="button"
                      onClick={saveAgent}
                      disabled={saving !== 'idle' || !agentDirty}
                      className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving === 'agent' ? 'Saving agent…' : 'Save agent'}
                    </button>
                  </div>
                </div>
              ) : null}

              {active === 'webhooks' ? (
                <div className="grid gap-4">
                  <label className="grid gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                      Webhook URL
                    </span>
                    <input
                      value={agentDraft.webhookUrl ?? ''}
                      onChange={(e) =>
                        setAgentDraft((prev) => ({ ...prev, webhookUrl: e.target.value }))
                      }
                      className="h-11 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white/90 outline-none transition focus:border-white/25"
                      placeholder="https://example.com/webhook"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                      Webhook Timeout (ms)
                    </span>
                    <input
                      inputMode="numeric"
                      value={agentDraft.webhookTimeoutMs ?? ''}
                      onChange={(e) =>
                        setAgentDraft((prev) => ({
                          ...prev,
                          webhookTimeoutMs: e.target.value === '' ? undefined : Number(e.target.value),
                        }))
                      }
                      className="h-11 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white/90 outline-none transition focus:border-white/25"
                    />
                  </label>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      type="button"
                      onClick={saveAgent}
                      disabled={saving !== 'idle' || !agentDirty}
                      className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving === 'agent' ? 'Saving agent…' : 'Save agent'}
                    </button>
                  </div>
                </div>
              ) : null}

              {active === 'voicemail' ? (
                <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                    Coming Soon
                  </p>
                  <p className="mt-3 text-sm text-white/75">
                    Voicemail configuration is temporarily unavailable in this editor.
                  </p>
                </div>
              ) : null}

              {active === 'security' ? (
                <div className="grid gap-5">
                  <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                    <span className="text-sm font-semibold">Allow User DTMF</span>
                    <input
                      type="checkbox"
                      checked={Boolean(agentDraft.allowUserDtmf)}
                      onChange={(e) =>
                        setAgentDraft((prev) => ({ ...prev, allowUserDtmf: e.target.checked }))
                      }
                      className="h-4 w-4"
                    />
                  </label>

                  <div className="grid gap-4">
                    <label className="grid gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                        Digit Limit
                      </span>
                      <input
                        inputMode="numeric"
                        min={1}
                        max={50}
                        value={agentDraft.userDtmfOption?.digit_limit ?? ''}
                        onChange={(e) =>
                          setAgentDraft((prev) => ({
                            ...prev,
                            userDtmfOption: {
                              ...(prev.userDtmfOption ?? {}),
                              digit_limit: e.target.value === '' ? undefined : Number(e.target.value),
                            },
                            userDtmfOptions: {
                              ...(prev.userDtmfOption ?? {}),
                              digit_limit: e.target.value === '' ? undefined : Number(e.target.value),
                            },
                          }))
                        }
                        className="h-11 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white/90 outline-none transition focus:border-white/25"
                      />
                    </label>
                    <label className="grid gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                        Termination Key
                      </span>
                      <input
                        maxLength={1}
                        value={agentDraft.userDtmfOption?.termination_key ?? ''}
                        onChange={(e) =>
                          setAgentDraft((prev) => ({
                            ...prev,
                            userDtmfOption: {
                              ...(prev.userDtmfOption ?? {}),
                              termination_key: e.target.value,
                            },
                            userDtmfOptions: {
                              ...(prev.userDtmfOption ?? {}),
                              termination_key: e.target.value,
                            },
                          }))
                        }
                        className="h-11 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white/90 outline-none transition focus:border-white/25"
                      />
                    </label>
                    <label className="grid gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                        Timeout (ms)
                      </span>
                      <input
                        inputMode="numeric"
                        min={1000}
                        max={15000}
                        value={agentDraft.userDtmfOption?.timeout_ms ?? ''}
                        onChange={(e) =>
                          setAgentDraft((prev) => ({
                            ...prev,
                            userDtmfOption: {
                              ...(prev.userDtmfOption ?? {}),
                              timeout_ms: e.target.value === '' ? undefined : Number(e.target.value),
                            },
                            userDtmfOptions: {
                              ...(prev.userDtmfOption ?? {}),
                              timeout_ms: e.target.value === '' ? undefined : Number(e.target.value),
                            },
                          }))
                        }
                        className="h-11 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white/90 outline-none transition focus:border-white/25"
                      />
                    </label>
                  </div>

                  <label className="grid gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                      PII Mode
                    </span>
                    <select
                      value="POST_CALL"
                      onChange={() =>
                        setAgentDraft((prev) => ({
                          ...prev,
                          piiConfig: {
                            mode: 'POST_CALL' as PiiModeType,
                            categories: (prev.piiConfig?.categories ?? []) as PiiCategoriesType,
                          },
                        }))
                      }
                      className="h-11 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white/90 outline-none transition focus:border-white/25"
                    >
                      <option value="POST_CALL">POST_CALL</option>
                    </select>
                  </label>

                  <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">Personal Info Redaction (PII)</p>
                        <p className="mt-1 text-xs text-white/55">
                          Select sensitive categories to redact.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPiiEditorOpen(true)}
                        className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
                      >
                        Set up
                      </button>
                    </div>
                    <p className="mt-3 text-xs text-white/60">
                      {piiCategories.length > 0
                        ? `${piiCategories.length} categories selected`
                        : 'No categories selected'}
                    </p>
                  </div>

                  {piiEditorOpen ? (
                    <div
                      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm"
                      role="dialog"
                      aria-modal="true"
                      aria-label="Set PII categories"
                      onMouseDown={(event) => {
                        if (event.target === event.currentTarget) setPiiEditorOpen(false);
                      }}
                    >
                      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-black p-6 text-white shadow-[0_50px_160px_rgba(0,0,0,0.55)]">
                        <div className="flex items-center justify-between gap-4">
                          <h3 className="text-lg font-semibold">Set PII Categories</h3>
                          <button
                            type="button"
                            onClick={() => setPiiEditorOpen(false)}
                            className="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
                            aria-label="Close"
                          >
                            <span className="text-xl leading-none">×</span>
                          </button>
                        </div>

                        <div className="mt-4 grid max-h-[60vh] gap-4 overflow-y-auto pr-1">
                          {PII_CATEGORY_GROUPS.map((group) => (
                            <div key={`pii-group-${group.title}`} className="grid gap-2">
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                                {group.title}
                              </p>
                              <div className="grid gap-2 sm:grid-cols-2">
                                {group.items.map((item) => (
                                  <label
                                    key={`pii-category-${item.value}`}
                                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={piiCategories.includes(item.value)}
                                      onChange={(e) => togglePiiCategory(item.value, e.target.checked)}
                                      className="h-4 w-4"
                                    />
                                    <span>{item.label}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-5 flex justify-end">
                          <button
                            type="button"
                            onClick={() => setPiiEditorOpen(false)}
                            className="rounded-2xl border border-white/15 bg-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      type="button"
                      onClick={saveAgent}
                      disabled={saving !== 'idle' || !agentDirty}
                      className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving === 'agent' ? 'Saving agent…' : 'Save agent'}
                    </button>
                  </div>
                </div>
              ) : null}

              {active === 'postcall' ? (
                <div className="grid gap-5">
                  <div>
                    <h3 className="text-base font-semibold">Post Call Data Retrieval</h3>
                    <p className="mt-2 text-sm text-white/60">
                      Define the information you need to extract from the call.
                      <span className="text-white/40"> (Learn more)</span>
                    </p>
                  </div>

                  <div className="grid gap-3">
                    {postCallFields.length === 0 ? (
                      <div className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-sm text-white/60">
                        No post-call fields yet. Add fields like call summary, success, or tags.
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        {postCallFields.map((field, idx) => {
                          const title =
                            (typeof field.name === 'string' && field.name.trim().length > 0
                              ? field.name.trim()
                              : null) ?? `Field ${idx + 1}`;
                          return (
                            <div
                              key={`post-call-field-${idx}-${field.type}-${title}`}
                              className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                                  {postCallIcon(field.type)}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-semibold text-white/90">{title}</p>
                                  <p className="truncate text-xs text-white/50">
                                    {field.description ? `${field.description}` : ''}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-3 flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => openEditPostCallField(idx)}
                                  className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                                  aria-label="Edit field"
                                >
                                  <Pencil className="size-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deletePostCallField(idx)}
                                  className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                                  aria-label="Delete field"
                                >
                                  <Trash2 className="size-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={openCreatePostCallField}
                      className="inline-flex w-fit items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
                    >
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-black/30">
                        <Plus className="size-5" />
                      </span>
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      type="button"
                      onClick={saveAgent}
                      disabled={saving !== 'idle' || !agentDirty}
                      className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving === 'agent' ? 'Saving agent…' : 'Save agent'}
                    </button>
                  </div>

                  {postCallEditorOpen ? (
                    <div
                      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm"
                      role="dialog"
                      aria-modal="true"
                      aria-label="Edit post-call field"
                      onMouseDown={(event) => {
                        if (event.target === event.currentTarget) setPostCallEditorOpen(false);
                      }}
                    >
                      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(900px_circle_at_70%_0%,rgba(248,248,248,0.08)_0%,rgba(56,66,218,0.25)_30%,rgba(12,14,55,0.85)_58%,rgba(0,0,0,1)_100%)] text-white shadow-[0_50px_160px_rgba(0,0,0,0.55)]">
                        <div className="flex items-start justify-between gap-6 border-b border-white/10 px-7 py-6">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">
                              Post-Call Field
                            </p>
                            <h2 className="mt-3 text-2xl font-semibold">
                              {editingPostCallIndex === null ? 'Add field' : 'Edit field'}
                            </h2>
                          </div>
                          <button
                            type="button"
                            className="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                            onClick={() => setPostCallEditorOpen(false)}
                            aria-label="Close"
                          >
                            <span className="text-xl leading-none">×</span>
                          </button>
                        </div>

                        <div className="grid gap-5 px-7 py-6">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <label className="grid gap-2">
                              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                                Type
                              </span>
                              <select
                                value={postCallDraft.type}
                                onChange={(e) =>
                                  setPostCallDraft((prev) => ({
                                    ...prev,
                                    type: e.target.value as KnownPostCallFieldType,
                                    choices:
                                      e.target.value === 'enum' ? prev.choices : undefined,
                                    examples:
                                      e.target.value === 'string' ? prev.examples : undefined,
                                  }))
                                }
                                className="h-11 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white/90 outline-none transition focus:border-white/25"
                              >
                                {KNOWN_POST_CALL_FIELD_TYPES.map((t) => (
                                  <option key={`postcall-type-${t}`} value={t}>
                                    {t}
                                  </option>
                                ))}
                              </select>
                            </label>

                            <label className="grid gap-2">
                              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                                Name
                              </span>
                              <input
                                value={postCallDraft.name ?? ''}
                                onChange={(e) =>
                                  setPostCallDraft((prev) => ({ ...prev, name: e.target.value }))
                                }
                                className="h-11 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white/90 outline-none transition focus:border-white/25"
                                placeholder="Call Summary"
                              />
                            </label>
                          </div>

                          <label className="grid gap-2">
                            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                              Description
                            </span>
                            <textarea
                              value={postCallDraft.description ?? ''}
                              onChange={(e) =>
                                setPostCallDraft((prev) => ({
                                  ...prev,
                                  description: e.target.value,
                                }))
                              }
                              className="min-h-28 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/90 outline-none transition focus:border-white/25"
                              placeholder="What should the model extract?"
                            />
                          </label>

                          {postCallDraft.type === 'enum' ? (
                            <label className="grid gap-2">
                              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                                Choices (one per line)
                              </span>
                              <textarea
                                value={postCallDraft.choices?.join('\n') ?? ''}
                                onChange={(e) => {
                                  const choices = e.target.value
                                    .split('\n')
                                    .map((s) => s.trim())
                                    .filter(Boolean);
                                  setPostCallDraft((prev) => ({ ...prev, choices, examples: undefined }));
                                }}
                                className="min-h-24 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-xs text-white/85 outline-none transition focus:border-white/25"
                                placeholder="successful\nunsuccessful\nunknown"
                              />
                            </label>
                          ) : null}

                          {postCallDraft.type === 'string' ? (
                            <label className="grid gap-2">
                              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                                Examples (one per line)
                              </span>
                              <textarea
                                value={postCallDraft.examples?.join('\n') ?? ''}
                                onChange={(e) => {
                                  const examples = e.target.value
                                    .split('\n')
                                    .map((s) => s.trim())
                                    .filter(Boolean);
                                  setPostCallDraft((prev) => ({ ...prev, examples, choices: undefined }));
                                }}
                                className="min-h-24 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-xs text-white/85 outline-none transition focus:border-white/25"
                                placeholder="Customer requested reschedule\nAsked about pricing"
                              />
                            </label>
                          ) : null}

                          <div className="flex flex-wrap justify-end gap-3 pt-2">
                            <button
                              type="button"
                              onClick={() => setPostCallEditorOpen(false)}
                              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={savePostCallField}
                              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/15 px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_60px_rgba(12,14,55,0.55)] transition hover:bg-white/20"
                            >
                              <CheckCircle2 className="size-4" />
                              Save field
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {active.startsWith('llm_') ? (
                !llmSectionsEnabled || !llmDraft ? (
                  <div className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-sm text-white/60">
                    This agent does not have a Reacherr LLM linked.
                  </div>
                ) : active === 'llm_model' ? (
                  <div className="grid gap-4">
                    <label className="grid gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                        Temperature
                      </span>
                      <input
                        inputMode="decimal"
                        value={llmDraft.temperature ?? ''}
                        onChange={(e) =>
                          setLlmDraft((prev) =>
                            prev
                              ? { ...prev, temperature: e.target.value === '' ? undefined : Number(e.target.value) }
                              : prev
                          )
                        }
                        className="h-11 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white/90 outline-none transition focus:border-white/25"
                      />
                    </label>
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
                  <div className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-sm text-white/60">
                    Tool configuration is coming soon.
                  </div>
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
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                    Language
                  </p>
                  <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-3 py-2">
                    <span className="inline-flex h-5 w-7 items-center justify-center overflow-hidden rounded-sm border border-white/10 bg-white/5">
                      {SelectedLanguageFlag ? <SelectedLanguageFlag title={selectedLanguage.label} /> : null}
                    </span>
                    <select
                      value={selectedLanguageCode}
                      onChange={(e) =>
                        setAgentDraft((prev) => ({
                          ...prev,
                          languageEnum: e.target.value as UiLanguageCode,
                          language: e.target.value as UiLanguageCode,
                        }))
                      }
                      className="h-9 w-full bg-transparent text-sm text-white/90 outline-none"
                    >
                      {languageOptions.map((option) => (
                        <option
                          key={`agent-lang-${option.code}`}
                          value={option.code}
                          className="bg-black text-white"
                        >
                          {option.label} ({option.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                    LLM Model
                  </p>
                  <div className="mt-2 rounded-2xl border border-white/10 bg-black/30 px-3 py-2">
                    <select
                      value={llmDraft?.model ?? ''}
                      onChange={(e) => {
                        const model = e.target.value;
                        setLlmDraft((prev) => (prev ? { ...prev, model } : prev));
                      }}
                      className="h-9 w-full bg-transparent text-sm text-white/90 outline-none disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={!llmDraft}
                    >
                      {!llmDraft ? (
                        <option value="" className="bg-black text-white">
                          Not linked
                        </option>
                      ) : null}
                      {llmModelOptions.map((opt) => (
                        <option key={`llm-header-model-${opt.value}`} value={opt.value} className="bg-black text-white">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                    TTS Model
                  </p>
                  <div className="mt-2 rounded-2xl border border-white/10 bg-black/30 px-3 py-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm text-white/90">
                          {selectedTtsModel || 'No model selected'}
                        </p>
                        <p className="truncate text-xs text-white/55">
                          Voice ID: {agentDraft.ttsConfig?.voiceId || agentDraft.voiceId || 'not set'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setTtsDraftModel(selectedTtsModel ?? '');
                          setTtsDraftVoiceId(agentDraft.ttsConfig?.voiceId ?? agentDraft.voiceId ?? '');
                          setTtsVoiceProviderFilter(
                            (agentDraft.ttsConfig?.provider ?? inferVoiceProviderFromModel(selectedTtsModel)).trim().toLowerCase() || 'all'
                          );
                          setTtsVoiceSearch('');
                          setTtsPickerOpen(true);
                        }}
                        className="shrink-0 rounded-xl border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/15"
                      >
                        Set up
                      </button>
                    </div>
                  </div>
                </div>
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

                <label className="grid gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                    Begin Message
                  </span>
                  <textarea
                    value={llmDraft.beginMessage ?? ''}
                    onChange={(e) =>
                      setLlmDraft((prev) => (prev ? { ...prev, beginMessage: e.target.value } : prev))
                    }
                    className="min-h-28 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/90 outline-none transition focus:border-white/25"
                  />
                </label>

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

            {ttsPickerOpen ? (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm"
                role="dialog"
                aria-modal="true"
                aria-label="Set TTS Model and Voice ID"
                onMouseDown={(event) => {
                  if (event.target === event.currentTarget) setTtsPickerOpen(false);
                }}
              >
                <div className="flex h-[86vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(1200px_circle_at_70%_0%,rgba(248,248,248,0.07)_0%,rgba(56,66,218,0.22)_35%,rgba(12,14,55,0.9)_62%,rgba(0,0,0,1)_100%)] text-white shadow-[0_50px_160px_rgba(0,0,0,0.55)]">
                  <div className="flex items-start justify-between gap-6 border-b border-white/10 px-7 py-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">
                        Select Voice
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold">Pick model and voice</h2>
                    </div>
                    <button
                      type="button"
                      className="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                      onClick={() => setTtsPickerOpen(false)}
                      aria-label="Close"
                    >
                      <span className="text-xl leading-none">×</span>
                    </button>
                  </div>

                  <div className="grid gap-4 border-b border-white/10 px-7 py-5">
                    <div className="grid gap-3 sm:grid-cols-[2fr,1fr]">
                      <label className="grid gap-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                          TTS Model
                        </span>
                        <select
                          value={ttsDraftModel}
                          onChange={(e) => {
                            const nextModel = e.target.value;
                            const nextProvider =
                              initialConfig?.ttsModels?.find((model) => model?.modelId === nextModel)?.provider ?? '';
                            const currentVoiceProvider = inferVoiceProviderFromVoiceId(ttsDraftVoiceId);
                            setTtsDraftModel(nextModel);
                            if (
                              nextProvider &&
                              currentVoiceProvider &&
                              nextProvider.toLowerCase() !== currentVoiceProvider.toLowerCase()
                            ) {
                              setTtsDraftVoiceId(defaultVoiceIdForProvider(nextProvider));
                            }
                            if (nextProvider.trim().length > 0) {
                              setTtsVoiceProviderFilter(nextProvider.trim().toLowerCase());
                            }
                          }}
                          className="h-11 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white/90 outline-none transition focus:border-white/25"
                        >
                          <option value="" className="bg-black text-white">
                            Select model
                          </option>
                          {ttsModelOptions.map((opt) => (
                            <option key={`tts-picker-model-${opt.value}`} value={opt.value} className="bg-black text-white">
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="grid gap-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                          Search Voice
                        </span>
                        <input
                          value={ttsVoiceSearch}
                          onChange={(e) => setTtsVoiceSearch(e.target.value)}
                          className="h-11 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white/90 outline-none transition focus:border-white/25"
                          placeholder="Search by name, id, accent..."
                        />
                      </label>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {ttsVoiceProviderTabs.map((provider) => {
                        const label = provider === 'all' ? 'All' : provider.charAt(0).toUpperCase() + provider.slice(1);
                        const isActive = ttsVoiceProviderFilter === provider;
                        return (
                          <button
                            key={`tts-provider-${provider}`}
                            type="button"
                            onClick={() => setTtsVoiceProviderFilter(provider)}
                            className={[
                              'rounded-xl border px-3 py-1.5 text-xs font-semibold transition',
                              isActive
                                ? 'border-white/40 bg-white/15 text-white'
                                : 'border-white/10 bg-black/30 text-white/75 hover:bg-white/10',
                            ].join(' ')}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto px-7 py-5">
                    {recommendedTtsVoices.length > 0 ? (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                          Recommended Voices
                        </p>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                          {recommendedTtsVoices.map((voice) => {
                            const isSelected = ttsDraftVoiceId.trim() === voice.voiceId;
                            return (
                              <button
                                key={`tts-rec-${voice.voiceId}`}
                                type="button"
                                onClick={() => setTtsDraftVoiceId(voice.voiceId)}
                                className={[
                                  'flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition',
                                  isSelected
                                    ? 'border-white/35 bg-white/15'
                                    : 'border-white/10 bg-black/30 hover:bg-white/10',
                                ].join(' ')}
                              >
                                {voice.avatarUrl ? (
                                  <img src={voice.avatarUrl} alt={voice.voiceName || voice.voiceId} className="h-10 w-10 rounded-full object-cover" />
                                ) : (
                                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm font-semibold">
                                    {(voice.voiceName || voice.voiceId).slice(0, 1).toUpperCase()}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-white/95">
                                    {voice.voiceName || voice.voiceId}
                                  </p>
                                  <p className="truncate text-xs text-white/60">{voice.voiceId}</p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}

                    <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-black/25">
                      <div className="divide-y divide-white/10">
                        {filteredTtsVoices.length === 0 ? (
                          <div className="px-4 py-6 text-sm text-white/60">No voices match current filters.</div>
                        ) : (
                          filteredTtsVoices.map((voice) => {
                            const isSelected = ttsDraftVoiceId.trim() === voice.voiceId;
                            return (
                              <button
                                key={`tts-row-${voice.voiceId}`}
                                type="button"
                                onClick={() => setTtsDraftVoiceId(voice.voiceId)}
                                className={[
                                  'grid w-full grid-cols-[2fr,2fr,2fr,auto] items-center gap-3 px-4 py-3 text-left transition',
                                  isSelected ? 'bg-white/10' : 'hover:bg-white/5',
                                ].join(' ')}
                              >
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-white/90">
                                    {voice.voiceName || voice.voiceId}
                                  </p>
                                  <p className="truncate text-xs text-white/55">{voice.provider || 'unknown provider'}</p>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {voice.accent ? (
                                    <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[11px] text-white/70">
                                      {voice.accent}
                                    </span>
                                  ) : null}
                                  {voice.gender ? (
                                    <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[11px] text-white/70">
                                      {voice.gender}
                                    </span>
                                  ) : null}
                                  {voice.age ? (
                                    <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[11px] text-white/70">
                                      {voice.age}
                                    </span>
                                  ) : null}
                                </div>
                                <p className="truncate text-sm text-white/80">{voice.voiceId}</p>
                                <span className="rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-xs font-semibold text-white/80">
                                  {isSelected ? 'Selected' : 'Select'}
                                </span>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 border-t border-white/10 px-7 py-5 sm:grid-cols-[2fr,auto] sm:items-end">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setTtsPickerOpen(false)}
                        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={applyTtsSelection}
                        className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
                      >
                        Save voice
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
