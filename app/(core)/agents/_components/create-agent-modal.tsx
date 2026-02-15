'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import type { AgentTemplateType, TemplateDto, VoiceAgentDto } from '@/types';

type ApiError = { message?: unknown };

const CREATE_BLANK_AGENT_API_ROUTE = '/api/agents/create-blank' satisfies Route;

const templateCreateRoute = (templateId: string) =>
  (`/api/agents/create-from-template/${templateId}` as Route);

async function requestJson<T>(
  route: Route,
  init: RequestInit
): Promise<{ ok: true; data: T } | { ok: false; status: number; message: string }> {
  const res = await fetch(route, init);
  const text = await res.text();
  const parsed: unknown = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg =
      typeof (parsed as ApiError | null)?.message === 'string'
        ? (parsed as { message: string }).message
        : `Request failed (HTTP ${res.status}).`;
    return { ok: false, status: res.status, message: msg };
  }

  return { ok: true, data: parsed as T };
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isVoiceAgentDto = (value: unknown): value is VoiceAgentDto => {
  if (!isRecord(value)) return false;
  // `agentName` and `responseEngine` are required in the TS type.
  if (typeof value.agentName !== 'string') return false;
  if (!isRecord(value.responseEngine)) return false;
  if (typeof value.responseEngine.type !== 'string') return false;
  return true;
};

type ArchitectureOption = {
  value: Exclude<AgentTemplateType, 'custom'>;
  title: string;
  description: string;
  disabled?: boolean;
};

const ARCHITECTURES: readonly ArchitectureOption[] = [
  {
    value: 'single-prompt',
    title: 'Single Prompt',
    description: 'Instruction-driven LLM execution for simple tasks.',
  },
  {
    value: 'conversational-flow',
    title: 'Conversational Flow',
    description: 'Node-based logic for complex flows.',
    disabled: true,
  },
] as const;

type CreateAgentModalProps = {
  initialTemplates: TemplateDto[];
  initialTemplatesError: string | null;
};

export function CreateAgentModal(props: CreateAgentModalProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [architecture, setArchitecture] =
    useState<ArchitectureOption['value']>('single-prompt');

  const templates = props.initialTemplates;
  const templatesError = props.initialTemplatesError;
  type SelectedStart = { kind: 'blank' } | { kind: 'template'; id: string };
  const [selectedStart, setSelectedStart] = useState<SelectedStart>({ kind: 'blank' });

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const compatibleTemplates = useMemo(() => {
    return templates.filter((tpl) => {
      // If backend doesn't tag a template, keep it visible.
      if (!tpl.agentType) return true;
      if (tpl.agentType === 'custom') return true;
      return tpl.agentType === architecture;
    });
  }, [architecture, templates]);

  const onCreate = async () => {
    if (creating) return;

    setCreating(true);
    setCreateError(null);

    try {
      const result =
        selectedStart.kind === 'blank'
          ? await requestJson<unknown>(CREATE_BLANK_AGENT_API_ROUTE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ architecture }),
          })
          : await requestJson<unknown>(templateCreateRoute(selectedStart.id), {
            method: 'POST',
          });

      if (!result.ok) {
        setCreateError(result.message);
        return;
      }

      if (!isVoiceAgentDto(result.data)) {
        setCreateError('Unexpected response from server.');
        return;
      }

      setOpen(false);
      router.refresh();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Unable to create agent.');
    } finally {
      setCreating(false);
    }
  };

  const selectedTemplate =
    selectedStart.kind === 'template'
      ? compatibleTemplates.find((t) => t.id === selectedStart.id) ?? null
      : null;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setCreateError(null);
          setSelectedStart({ kind: 'blank' });
          setOpen(true);
        }}
        className="inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white shadow-[0_22px_70px_rgba(12,14,55,0.55)] backdrop-blur transition hover:bg-white/15 hover:shadow-[0_26px_90px_rgba(12,14,55,0.65)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      >
        Create Agent
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Create new agent"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div className="max-h-[calc(100vh-3rem)] w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(1000px_circle_at_70%_0%,rgba(248,248,248,0.08)_0%,rgba(56,66,218,0.35)_30%,rgba(12,14,55,0.85)_58%,rgba(0,0,0,1)_100%)] text-white shadow-[0_50px_160px_rgba(0,0,0,0.55)]">
            <div className="flex items-start justify-between gap-6 border-b border-white/10 px-7 py-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">
                  Create New Agent
                </p>
                <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">
                  Select architecture and template
                </h2>
              </div>
              <button
                type="button"
                className="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <span className="text-xl leading-none">×</span>
              </button>
            </div>

            <div className="grid max-h-[calc(100vh-14rem)] gap-7 overflow-y-auto px-7 py-6">
              <section>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                  Agent Architecture
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {ARCHITECTURES.map((opt) => {
                    const active = architecture === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          if (opt.disabled) return;
                          setArchitecture(opt.value);
                          setSelectedStart({ kind: 'blank' });
                        }}
                        disabled={opt.disabled}
                        className={[
                          'rounded-2xl border p-5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:cursor-not-allowed',
                          active
                            ? 'border-white/25 bg-white/10 shadow-[0_18px_50px_rgba(10,12,35,0.55)]'
                            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10',
                          opt.disabled ? 'opacity-50 hover:border-white/10 hover:bg-white/5' : '',
                        ].join(' ')}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold">{opt.title}</p>
                          {opt.disabled ? (
                            <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/70">
                              Coming soon
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-2 text-sm text-white/60">{opt.description}</p>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                      Industry Template
                    </p>
                    <p className="mt-2 text-sm text-white/60">
                      We will auto-create the required Reacherr LLM or conversation flow.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white/70">
                      {compatibleTemplates.length} templates
                    </span>
                  </div>
                </div>

                {templatesError ? (
                  <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {templatesError}
                  </div>
                ) : null}

                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => setSelectedStart({ kind: 'blank' })}
                    className={[
                      'rounded-2xl border p-5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30',
                      selectedStart.kind === 'blank'
                        ? 'border-white/25 bg-white/10 shadow-[0_18px_50px_rgba(10,12,35,0.55)]'
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10',
                    ].join(' ')}
                  >
                    <p className="text-sm font-semibold">Blank Agent</p>
                    <p className="mt-2 text-xs text-white/55">Start from scratch</p>
                  </button>
                  {compatibleTemplates.map((tpl) => {
                    const active = selectedStart.kind === 'template' && tpl.id === selectedStart.id;
                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => setSelectedStart({ kind: 'template', id: tpl.id })}
                        className={[
                          'rounded-2xl border p-5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30',
                          active
                            ? 'border-white/25 bg-white/10 shadow-[0_18px_50px_rgba(10,12,35,0.55)]'
                            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10',
                        ].join(' ')}
                      >
                        <p className="text-sm font-semibold">{tpl.name}</p>
                        <p className="mt-2 line-clamp-2 text-xs text-white/55">
                          {tpl.description}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {!templatesError && compatibleTemplates.length === 0 ? (
                  <p className="mt-4 text-sm text-white/60">
                    No templates available for this architecture.
                  </p>
                ) : null}
              </section>

              {createError ? (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {createError}
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-white/10 px-7 py-5">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onCreate}
                disabled={creating}
                className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-[0_18px_50px_rgba(16,20,64,0.35)] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
                aria-disabled={creating}
                title={
                  selectedTemplate
                    ? `Create ${selectedTemplate.name}`
                    : selectedStart.kind === 'blank'
                      ? 'Create a blank agent'
                      : 'Select a template to continue'
                }
              >
                {creating ? 'Creating…' : 'Create Agent'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
