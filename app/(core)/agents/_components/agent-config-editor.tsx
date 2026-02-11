'use client';

import * as React from 'react';
import type { ReacherrLlmDto, VoiceAgentDto } from '@/types';
import {
  conversationConfigStoredResults,
  getLLMProviders,
  getSTTProvidersWithLanguages,
  getTTSProvidersWithLanguages,
} from '../../_lib/conversation-config';
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
  Mic,
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
  NonNullable<VoiceAgentDto['voiceMailDetection']>['action']
>['type'];

type PiiModeType = NonNullable<NonNullable<VoiceAgentDto['piiConfig']>['mode']>;

type PiiCategoriesType = NonNullable<NonNullable<VoiceAgentDto['piiConfig']>['categories']>;

type SectionId =
  | 'identity'
  | 'call'
  | 'speech'
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
    { id: 'speech', label: 'Speech Settings', group: 'agent' },
    { id: 'webhooks', label: 'Webhook Settings', group: 'agent' },
    { id: 'voicemail', label: 'Voicemail', group: 'agent' },
    { id: 'security', label: 'Security & DTMF', group: 'agent' },
    { id: 'postcall', label: 'Post-Call Extraction', group: 'agent' },
    { id: 'llm_model', label: 'LLM: Model', group: 'llm' },
    { id: 'llm_kb', label: 'LLM: Knowledge Base', group: 'llm', disabled: true },
    { id: 'llm_tools', label: 'LLM: Tools', group: 'llm', disabled: true },
    { id: 'llm_mcps', label: 'LLM: MCPs', group: 'llm', disabled: true },
    { id: 'raw', label: 'Raw JSON', group: 'advanced' },
  ];

function hasReacherrLlm(agent: VoiceAgentDto): agent is VoiceAgentDto & {
  responseEngine: { llmId: string };
} {
  const re = agent.responseEngine as unknown;
  return isRecord(re) && typeof re.llmId === 'string' && re.llmId.trim().length > 0;
}

export function AgentConfigEditor({
  initialAgent,
  initialLlm,
}: {
  initialAgent: VoiceAgentDto;
  initialLlm: ReacherrLlmDto | null;
}) {
  const [active, setActive] = React.useState<SectionId>('identity');

  const [agentDraft, setAgentDraft] = React.useState<VoiceAgentDto>(initialAgent);
  const [llmDraft, setLlmDraft] = React.useState<ReacherrLlmDto | null>(initialLlm);

  const llmProviderOptions = React.useMemo(() => {
    return getLLMProviders(conversationConfigStoredResults);
  }, []);

  const sttProviderOptions = React.useMemo(() => {
    return getSTTProvidersWithLanguages(conversationConfigStoredResults);
  }, []);

  const ttsProviderOptions = React.useMemo(() => {
    return getTTSProvidersWithLanguages(conversationConfigStoredResults);
  }, []);

  const [baselineAgent, setBaselineAgent] = React.useState(initialAgent);
  const [baselineLlm, setBaselineLlm] = React.useState(initialLlm);

  const [saving, setSaving] = React.useState<'idle' | 'agent' | 'llm' | 'all'>('idle');
  const [error, setError] = React.useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = React.useState<number | null>(null);

  const [postCallEditorOpen, setPostCallEditorOpen] = React.useState(false);
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

  const llmId = hasReacherrLlm(agentDraft) ? agentDraft.responseEngine.llmId : null;

  // Initialize dropdowns: normalize backend values (label vs slug).
  const didInitRef = React.useRef(false);
  React.useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    setAgentDraft((prev) => {
      let next = prev;

      // STT normalize
      if (prev.sttConfig?.provider && sttProviderOptions.length > 0) {
        const providers = sttProviderOptions.map((p) => ({
          label: p.label,
          value: p.value,
          models: p.models,
        }));
        const providerOpt =
          findByValueOrLabel(providers, prev.sttConfig.provider) ??
          providers.find((p) => p.value === prev.sttConfig?.provider) ??
          null;

        if (providerOpt) {
          const models = providerOpt.models ?? [];
          const modelOpt =
            prev.sttConfig?.model && prev.sttConfig.model.trim().length > 0
              ? findByValueOrLabel(
                models.map((m) => ({ label: m.label, value: m.value })),
                prev.sttConfig.model
              ) ??
              models.find((m) => m.value === prev.sttConfig?.model) ??
              null
              : null;

          const normalizedProvider = providerOpt.value;
          const normalizedModel = modelOpt?.value ?? prev.sttConfig.model ?? '';

          if (
            normalizedProvider !== (prev.sttConfig?.provider ?? '') ||
            normalizedModel !== (prev.sttConfig?.model ?? '')
          ) {
            next = {
              ...next,
              sttConfig: {
                provider: normalizedProvider,
                model: normalizedModel,
                settings: prev.sttConfig?.settings,
              },
            };
          }
        }
      }

      // TTS normalize (keep custom voiceId if it's not in the catalog)
      if (prev.ttsConfig?.provider && ttsProviderOptions.length > 0) {
        const providers = ttsProviderOptions.map((p) => ({
          label: p.label,
          value: p.value,
          models: p.models,
        }));
        const providerOpt =
          findByValueOrLabel(providers, prev.ttsConfig.provider) ??
          providers.find((p) => p.value === prev.ttsConfig?.provider) ??
          null;

        if (providerOpt) {
          const models = providerOpt.models ?? [];
          const modelOpt =
            prev.ttsConfig?.model && prev.ttsConfig.model.trim().length > 0
              ? findByValueOrLabel(
                models.map((m) => ({ label: m.label, value: m.value })),
                prev.ttsConfig.model
              ) ??
              models.find((m) => m.value === prev.ttsConfig?.model) ??
              null
              : null;

          const normalizedProvider = providerOpt.value;
          const normalizedModel = modelOpt?.value ?? prev.ttsConfig.model ?? '';

          const voices = models.find((m) => m.value === normalizedModel)?.voices ?? [];
          const currentVoiceId = prev.ttsConfig?.voiceId ?? '';
          const normalizedVoiceId =
            currentVoiceId && voices.some((v) => v.voiceId === currentVoiceId)
              ? currentVoiceId
              : currentVoiceId;

          if (
            normalizedProvider !== (prev.ttsConfig?.provider ?? '') ||
            normalizedModel !== (prev.ttsConfig?.model ?? '') ||
            normalizedVoiceId !== (prev.ttsConfig?.voiceId ?? '')
          ) {
            next = {
              ...next,
              ttsConfig: {
                provider: normalizedProvider,
                model: normalizedModel,
                voiceId: normalizedVoiceId,
                avatarUrl: prev.ttsConfig?.avatarUrl,
                settings: prev.ttsConfig?.settings,
              },
            };
          }
        }
      }

      return next;
    });

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
  }, [llmProviderOptions, sttProviderOptions, ttsProviderOptions]);

  const saveAgent = async () => {
    setSaving('agent');
    setError(null);
    try {
      const agentId = agentDraft.agentId;
      const url = `/api/agents/update${agentId ? `?agentId=${encodeURIComponent(agentId)}` : ''}`;
      const result = await patchJson<VoiceAgentDto>(url, agentDraft);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setBaselineAgent(result.data);
      setAgentDraft(result.data);
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

    setSaving('all');
    setError(null);
    try {
      if (needsAgent) {
        const agentId = agentDraft.agentId;
        const url = `/api/agents/update${agentId ? `?agentId=${encodeURIComponent(agentId)}` : ''}`;
        const agentResult = await patchJson<VoiceAgentDto>(url, agentDraft);
        if (!agentResult.ok) {
          setError(agentResult.message);
          return;
        }
        setBaselineAgent(agentResult.data);
        setAgentDraft(agentResult.data);
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

  const postCallFields = (agentDraft.postCallAnalysisData ?? []) as PostCallField[];

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
    const cleaned: PostCallDraft = {
      ...postCallDraft,
      type: typeof postCallDraft.type === 'string' ? postCallDraft.type.trim() : 'string',
      name: typeof postCallDraft.name === 'string' ? postCallDraft.name.trim() : postCallDraft.name,
      description:
        typeof postCallDraft.description === 'string'
          ? postCallDraft.description.trim()
          : postCallDraft.description,
    };

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
      case 'speech':
        return <Mic className="size-4 text-white/60" />;
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
                      value={(agentDraft.language as unknown as string) ?? ''}
                      onChange={(e) =>
                        setAgentDraft((prev) => ({ ...prev, language: e.target.value as never }))
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
                        No Response Timeout (ms)
                      </span>
                      <input
                        inputMode="numeric"
                        value={agentDraft.noResponseTimeoutMs ?? ''}
                        onChange={(e) =>
                          setAgentDraft((prev) => ({
                            ...prev,
                            noResponseTimeoutMs: e.target.value === '' ? undefined : Number(e.target.value),
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

              {active === 'speech' ? (
                <div className="grid gap-5">
                  {(() => {
                    const sttMissing =
                      !agentDraft.sttConfig?.provider || !agentDraft.sttConfig?.model;
                    const ttsMissing =
                      !agentDraft.ttsConfig?.provider ||
                      !agentDraft.ttsConfig?.model ||
                      !agentDraft.ttsConfig?.voiceId;
                    if (!sttMissing && !ttsMissing) return null;
                    return (
                      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-100">
                        <p className="font-semibold text-amber-50">Speech configuration required</p>
                        <p className="mt-1 text-amber-100/80">
                          {sttMissing && ttsMissing
                            ? 'Select your STT provider/model and TTS provider/model/voice to continue.'
                            : sttMissing
                              ? 'Select your STT provider and model.'
                              : 'Select your TTS provider, model, and voice.'}
                        </p>
                      </div>
                    );
                  })()}

                  <div className="grid gap-4">
                    <label className="grid gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                        STT Provider
                      </span>
                      <select
                        value={agentDraft.sttConfig?.provider ?? ''}
                        onChange={(e) => {
                          const provider = e.target.value;
                          setAgentDraft((prev) => ({
                            ...prev,
                            sttConfig: {
                              provider,
                              model: '',
                              settings: prev.sttConfig?.settings,
                            },
                          }));
                        }}
                        className="h-11 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white/90 outline-none transition focus:border-white/25"
                      >
                        <option value="">Select STT provider</option>
                        {ensureOption(
                          sttProviderOptions.map((p) => ({ label: p.label, value: p.value })),
                          agentDraft.sttConfig?.provider,
                          'Custom'
                        ).map((opt) => (
                          <option key={`stt-provider-${opt.value}`} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="grid gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                        STT Model
                      </span>
                      <select
                        value={agentDraft.sttConfig?.model ?? ''}
                        onChange={(e) => {
                          const model = e.target.value;
                          setAgentDraft((prev) => ({
                            ...prev,
                            sttConfig: {
                              provider: prev.sttConfig?.provider ?? '',
                              model,
                              settings: prev.sttConfig?.settings,
                            },
                          }));
                        }}
                        className="h-11 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white/90 outline-none transition focus:border-white/25"
                        disabled={!agentDraft.sttConfig?.provider}
                      >
                        <option value="">Select STT model</option>
                        {(() => {
                          const provider = agentDraft.sttConfig?.provider ?? '';
                          const models =
                            sttProviderOptions.find((p) => p.value === provider)?.models ?? [];
                          const modelOptions = ensureOption(
                            models.map((m) => ({ label: m.label, value: m.value })),
                            agentDraft.sttConfig?.model,
                            'Custom'
                          );
                          return modelOptions.map((opt) => (
                            <option key={`stt-model-${opt.value}`} value={opt.value}>
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
                        TTS Provider
                      </span>
                      <select
                        value={agentDraft.ttsConfig?.provider ?? ''}
                        onChange={(e) => {
                          const provider = e.target.value;
                          setAgentDraft((prev) => ({
                            ...prev,
                            ttsConfig: {
                              provider,
                              model: '',
                              voiceId: '',
                              avatarUrl: prev.ttsConfig?.avatarUrl,
                              settings: prev.ttsConfig?.settings,
                            },
                          }));
                        }}
                        className="h-11 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white/90 outline-none transition focus:border-white/25"
                      >
                        <option value="">Select TTS provider</option>
                        {ensureOption(
                          ttsProviderOptions.map((p) => ({ label: p.label, value: p.value })),
                          agentDraft.ttsConfig?.provider,
                          'Custom'
                        ).map((opt) => (
                          <option key={`tts-provider-${opt.value}`} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="grid gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                        TTS Model
                      </span>
                      <select
                        value={agentDraft.ttsConfig?.model ?? ''}
                        onChange={(e) => {
                          const model = e.target.value;
                          setAgentDraft((prev) => ({
                            ...prev,
                            ttsConfig: {
                              provider: prev.ttsConfig?.provider ?? '',
                              model,
                              voiceId: '',
                              avatarUrl: prev.ttsConfig?.avatarUrl,
                              settings: prev.ttsConfig?.settings,
                            },
                          }));
                        }}
                        className="h-11 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white/90 outline-none transition focus:border-white/25"
                        disabled={!agentDraft.ttsConfig?.provider}
                      >
                        <option value="">Select TTS model</option>
                        {(() => {
                          const provider = agentDraft.ttsConfig?.provider ?? '';
                          const models =
                            ttsProviderOptions.find((p) => p.value === provider)?.models ?? [];
                          const modelOptions = ensureOption(
                            models.map((m) => ({ label: m.label, value: m.value })),
                            agentDraft.ttsConfig?.model,
                            'Custom'
                          );
                          return modelOptions.map((opt) => (
                            <option key={`tts-model-${opt.value}`} value={opt.value}>
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
                        TTS Voice ID
                      </span>
                      <select
                        value={agentDraft.ttsConfig?.voiceId ?? ''}
                        onChange={(e) => {
                          const voiceId = e.target.value;
                          setAgentDraft((prev) => ({
                            ...prev,
                            ttsConfig: {
                              provider: prev.ttsConfig?.provider ?? '',
                              model: prev.ttsConfig?.model ?? '',
                              voiceId,
                              avatarUrl: prev.ttsConfig?.avatarUrl,
                              settings: prev.ttsConfig?.settings,
                            },
                          }));
                        }}
                        className="h-11 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white/90 outline-none transition focus:border-white/25"
                        disabled={!agentDraft.ttsConfig?.provider || !agentDraft.ttsConfig?.model}
                      >
                        <option value="">Select a voice</option>
                        {(() => {
                          const provider = agentDraft.ttsConfig?.provider ?? '';
                          const model = agentDraft.ttsConfig?.model ?? '';
                          const models =
                            ttsProviderOptions.find((p) => p.value === provider)?.models ?? [];
                          const voices = models.find((m) => m.value === model)?.voices ?? [];
                          const options = ensureOption(
                            voices.map((v) => ({ label: v.displayName, value: v.voiceId })),
                            agentDraft.ttsConfig?.voiceId,
                            'Custom'
                          );
                          return options.map((opt) => (
                            <option key={`tts-voice-${opt.value}`} value={opt.value}>
                              {opt.label}
                            </option>
                          ));
                        })()}
                      </select>
                    </label>
                    <label className="grid gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                        Voice Avatar URL
                      </span>
                      <input
                        value={agentDraft.ttsConfig?.avatarUrl ?? ''}
                        onChange={(e) =>
                          setAgentDraft((prev) => ({
                            ...prev,
                            ttsConfig: {
                              provider: prev.ttsConfig?.provider ?? '',
                              model: prev.ttsConfig?.model ?? '',
                              voiceId: prev.ttsConfig?.voiceId ?? '',
                              avatarUrl: e.target.value,
                              settings: prev.ttsConfig?.settings,
                            },
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
                    <input
                      value={agentDraft.voiceMailDetection?.action?.type ?? ''}
                      onChange={(e) =>
                        setAgentDraft((prev) => ({
                          ...prev,
                          voiceMailDetection: {
                            ...(prev.voiceMailDetection ?? {}),
                            action: {
                              ...(prev.voiceMailDetection?.action ?? { type: '' }),
                              type: e.target.value as unknown as VoiceMailActionType,
                            },
                          },
                        }))
                      }
                      className="h-11 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white/90 outline-none transition focus:border-white/25"
                      placeholder="static_text"
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
                        inputMode="decimal"
                        value={agentDraft.userDtmfOptions?.digit_limit ?? ''}
                        onChange={(e) =>
                          setAgentDraft((prev) => ({
                            ...prev,
                            userDtmfOptions: {
                              ...(prev.userDtmfOptions ?? {}),
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
                        value={agentDraft.userDtmfOptions?.termination_key ?? ''}
                        onChange={(e) =>
                          setAgentDraft((prev) => ({
                            ...prev,
                            userDtmfOptions: {
                              ...(prev.userDtmfOptions ?? {}),
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
                        value={agentDraft.userDtmfOptions?.timeout_ms ?? ''}
                        onChange={(e) =>
                          setAgentDraft((prev) => ({
                            ...prev,
                            userDtmfOptions: {
                              ...(prev.userDtmfOptions ?? {}),
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
                    <input
                      value={agentDraft.piiConfig?.mode ?? ''}
                      onChange={(e) =>
                        setAgentDraft((prev) => ({
                          ...prev,
                          piiConfig: {
                            mode: e.target.value as unknown as PiiModeType,
                            categories: (prev.piiConfig?.categories ?? []) as PiiCategoriesType,
                          },
                        }))
                      }
                      className="h-11 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white/90 outline-none transition focus:border-white/25"
                      placeholder="post_call"
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
                          if (isRecord(parsed)) setAgentDraft(parsed as unknown as VoiceAgentDto);
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
