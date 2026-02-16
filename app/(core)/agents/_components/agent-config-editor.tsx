'use client';

import * as React from 'react';
import type { ReacherrLlmDto, VoiceAgentDto } from '@/types';
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
  User,
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

type SectionId =
  | 'identity'
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

const normalizeVoicemailOption = (agent: VoiceAgentDto): VoiceAgentDto => {
  const legacyAction = (agent as unknown as { voiceMailDetection?: { action?: { type?: string; text?: string; prompt?: string } } })
    .voiceMailDetection?.action;

  if (agent.voiceMailOption || !legacyAction?.type) return agent;

  return {
    ...agent,
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

  if (payload.voiceMailOption?.voiceMailOptionType === 'hangup') {
    payload.voiceMailOption = { voiceMailOptionType: 'hangup' };
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
  delete payload.voiceMailDetection;

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
    { id: 'identity', label: 'Identity', group: 'agent' },
    { id: 'call', label: 'Call Settings', group: 'agent' },
    { id: 'webhooks', label: 'Webhook Settings', group: 'agent' },
    { id: 'voicemail', label: 'Voicemail', group: 'agent' },
    { id: 'security', label: 'Security & DTMF', group: 'agent' },
    { id: 'postcall', label: 'Post-Call Extraction', group: 'agent' },
    { id: 'llm_model', label: 'LLM: Model', group: 'llm', disabled: true },
    { id: 'llm_kb', label: 'LLM: Knowledge Base', group: 'llm', disabled: true },
    { id: 'llm_tools', label: 'LLM: Tools', group: 'llm', disabled: true },
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
}: {
  initialAgent: VoiceAgentDto;
  initialLlm: ReacherrLlmDto | null;
}) {
  const [active, setActive] = React.useState<SectionId>('identity');

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
  const [editingPostCallIndex, setEditingPostCallIndex] = React.useState<number | null>(null);
  type PostCallDraft = PostCallField & { choices?: string[]; examples?: string[] };
  const [postCallDraft, setPostCallDraft] = React.useState<PostCallDraft>({
    type: 'string',
    name: '',
    description: '',
  });

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
    setActive('identity');
  };

  const llmSectionsEnabled = Boolean(llmDraft) && Boolean(llmId);
  const piiCategories = (agentDraft.piiConfig?.categories ?? []) as PiiCategoriesType;

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
      case 'identity':
        return <User className="size-4 text-white/60" />;
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
              {active === 'identity' ? (
                <div className="grid gap-4">
                  <label className="grid gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                      Agent Name
                    </span>
                    <input
                      value={agentDraft.agentName ?? ''}
                      onChange={(e) =>
                        setAgentDraft((prev) => ({ ...prev, agentName: e.target.value }))
                      }
                      className="h-11 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white/90 outline-none transition focus:border-white/25"
                      placeholder="Support Agent"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                      Language
                    </span>
                    <input
                      value={(agentDraft.languageEnum as unknown as string) ?? ''}
                      onChange={(e) =>
                        setAgentDraft((prev) => ({
                          ...prev,
                          languageEnum: e.target.value as never,
                          language: e.target.value as never,
                        }))
                      }
                      className="h-11 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white/90 outline-none transition focus:border-white/25"
                      placeholder="en"
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
                <div className="grid gap-4">
                  <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                    <span className="text-sm font-semibold">Enable Voicemail Detection</span>
                    <input
                      type="checkbox"
                      checked={Boolean(agentDraft.enableVoicemailDetection)}
                      onChange={(e) =>
                        setAgentDraft((prev) => ({
                          ...prev,
                          enableVoicemailDetection: e.target.checked,
                        }))
                      }
                      className="h-4 w-4"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                      Voicemail Action Type
                    </span>
                    <select
                      value={agentDraft.voiceMailOption?.voiceMailOptionType ?? ''}
                      onChange={(e) =>
                        setAgentDraft((prev) => ({
                          ...prev,
                          voiceMailOption: {
                            ...(prev.voiceMailOption ?? { voiceMailOptionType: 'hangup' }),
                            voiceMailOptionType: e.target.value as VoiceMailActionType,
                          },
                        }))
                      }
                      className="h-11 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white/90 outline-none transition focus:border-white/25"
                    >
                      <option value="" className="bg-black text-white">
                        Select action
                      </option>
                      <option value="hangup" className="bg-black text-white">
                        hangup
                      </option>
                      <option value="prompt" className="bg-black text-white">
                        prompt
                      </option>
                      <option value="static_text" className="bg-black text-white">
                        static_text
                      </option>
                    </select>
                  </label>

                  <label className="grid gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                      Voicemail Text (for prompt/static_text)
                    </span>
                    <input
                      value={agentDraft.voiceMailOption?.text ?? ''}
                      onChange={(e) =>
                        setAgentDraft((prev) => ({
                          ...prev,
                          voiceMailOption: {
                            ...(prev.voiceMailOption ?? { voiceMailOptionType: 'hangup' }),
                            text: e.target.value,
                          },
                        }))
                      }
                      className="h-11 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white/90 outline-none transition focus:border-white/25"
                      placeholder="Leave a message after the tone..."
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
                      onChange={(e) =>
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
                    <div className="grid gap-4">
                      <label className="grid gap-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                          Provider
                        </span>
                        <select
                          value={llmDraft.provider ?? ''}
                          onChange={(e) => {
                            const provider = e.target.value;
                            const models =
                              llmProviderOptions.find((p) => p.value === provider)?.models ?? [];
                            const nextModel =
                              models.some((m) => m.value === llmDraft.model)
                                ? (llmDraft.model ?? '')
                                : (models[0]?.value ?? '');
                            setLlmDraft((prev) => (prev ? { ...prev, provider, model: nextModel } : prev));
                          }}
                          className="h-11 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white/90 outline-none transition focus:border-white/25"
                        >
                          {ensureOption(
                            llmProviderOptions.map((p) => ({ label: p.label, value: p.value })),
                            llmDraft.provider,
                            'Custom'
                          ).map((opt) => (
                            <option key={`llm-provider-${opt.value}`} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="grid gap-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                          Model
                        </span>
                        <select
                          value={llmDraft.model ?? ''}
                          onChange={(e) => {
                            const model = e.target.value;
                            setLlmDraft((prev) => (prev ? { ...prev, model } : prev));
                          }}
                          className="h-11 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white/90 outline-none transition focus:border-white/25"
                        >
                          {(() => {
                            const provider = llmDraft.provider ?? '';
                            const models =
                              llmProviderOptions.find((p) => p.value === provider)?.models ?? [];
                            const options = ensureOption(
                              models.map((m) => ({ label: m.label, value: m.value })),
                              llmDraft.model,
                              'Custom'
                            );
                            return options.map((opt) => (
                              <option key={`llm-model-${opt.value}`} value={opt.value}>
                                {opt.label}
                              </option>
                            ));
                          })()}
                        </select>
                      </label>
                    </div>

                    <div className="grid gap-4">
                      <label className="grid gap-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                          S2S Model
                        </span>
                        <input
                          value={(llmDraft.s2sModel as unknown as string) ?? ''}
                          onChange={(e) =>
                            setLlmDraft((prev) => (prev ? { ...prev, s2sModel: e.target.value as never } : prev))
                          }
                          className="h-11 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white/90 outline-none transition focus:border-white/25"
                        />
                      </label>
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
                    </div>

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
                  <div className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-sm text-white/60">
                    Knowledge base configuration is coming soon.
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
              <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">
                {agentDraft.agentName || 'Unnamed Agent'}
              </h1>
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
          </div>
        </div>
      </div>
    </div>
  );
}
