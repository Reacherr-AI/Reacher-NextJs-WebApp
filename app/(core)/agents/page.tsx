import { apiFetch } from '@/lib/api';
import type { AgentDashBoardDto, AgentTemplateType, ResponseEngineRef, TemplateDto } from '@/types';
import { CreateAgentModal } from './create-agent-modal';

const PAGE_SIZE = 50;
const MAX_PAGES = 20;

// ------------------------------------------------------------------
// ---------------------- GET TEMPLATES -----------------------------
// ------------------------------------------------------------------

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isTemplateType = (value: unknown): value is AgentTemplateType =>
  value === 'single-prompt' || value === 'conversational-flow' || value === 'custom';

const isTemplateDto = (value: unknown): value is TemplateDto => {
  if (!isRecord(value)) return false;
  if (typeof value.id !== 'string' || value.id.trim().length === 0) return false;
  if (typeof value.name !== 'string' || value.name.trim().length === 0) return false;
  if (typeof value.description !== 'string') return false;
  if (value.agentType !== undefined && !isTemplateType(value.agentType)) return false;
  return true;
};

const parseTemplateList = (value: unknown): TemplateDto[] => {
  if (!Array.isArray(value)) return [];
  return value.filter(isTemplateDto);
};

const formatTimestamp = (value?: number) => {
  if (!value && value !== 0) return '—';
  const ms = value < 1_000_000_000_000 ? value * 1000 : value;
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const formatAgentType = (value?: string) => {
  if (!value) return 'Unknown';
  return value
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
};

const getTemplates = async () => {
  const res = await apiFetch('/api/v1/templates', { method: 'GET' });

  if (!res.ok) {
    const message = await res.text();
    return {
      templates: [] as TemplateDto[],
      error: message || 'Unable to load templates.',
    };
  }

  const data: unknown = await res.json().catch(() => null);
  return { templates: parseTemplateList(data), error: null as string | null };
};


// ------------------------------------------------------------------
// ---------------------- GET AGENTS --------------------------------
// ------------------------------------------------------------------


const getAgents = async () => {
  const agents: AgentDashBoardDto[] = [];

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const res = await apiFetch(
      `/api/v1/list-agent-dashboard?page=${page}&size=${PAGE_SIZE}`
    );

    if (!res.ok) {
      const message = await res.text();
      return {
        agents: [] as AgentDashBoardDto[],
        error: message || 'Unable to load agents.',
      };
    }

    const data = (await res.json()) as AgentDashBoardDto[];
    const pageItems = Array.isArray(data) ? data : [];
    agents.push(...pageItems);

    if (pageItems.length < PAGE_SIZE) {
      break;
    }
  }

  return { agents, error: null as string | null };
};


const getConversationFlowId = (ref?: ResponseEngineRef) => {
  if (ref && 'conversationFlowId' in ref) {
    return ref.conversationFlowId ?? '—';
  }
  return '—';
};

const getLlmId = (ref?: ResponseEngineRef) => {
  if (ref && 'llmId' in ref) {
    return ref.llmId ?? '—';
  }
  return '—';
};


// ------------------------------------------------------------------
// ---------------------- RENDER PAGE -------------------------------
// ------------------------------------------------------------------


export default async function AgentsPage() {
  const [{ agents, error: agentsError }, { templates, error: templatesError }] =
    await Promise.all([getAgents(), getTemplates()]);

  return (
    <div className="min-h-screen bg-black pb-16 text-white">
      <div
        role="main"
        className="mx-auto w-full max-w-378 rounded-b-[26px] bg-[radial-gradient(1200px_circle_at_75%_10%,rgba(248,248,248,0.08)_0%,rgba(56,66,218,0.35)_32%,rgba(12,14,55,0.75)_60%,rgba(0,0,0,1)_100%)] px-6 pb-12 pt-10 shadow-[0_40px_120px_rgba(6,7,33,0.45)] sm:px-10"
      >
        <header className="flex flex-wrap items-start justify-between gap-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">
              Agent Dashboard
            </p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-5xl">
              Your Reacherr agents, all in one place
            </h1>
            <p className="mt-4 text-sm text-white/60 sm:text-base">
              Track every agent tied to your account, including the response
              engine, call routing, and live phone numbers.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold text-white/70 shadow-[0_12px_40px_rgba(9,11,30,0.45)] backdrop-blur">
              Total Agents
              <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-black">
                {agents.length}
              </span>
            </div>
          </div>

          <div className="w-full max-w-sm">
            <CreateAgentModal initialTemplates={templates} initialTemplatesError={templatesError} />

            <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_30px_80px_rgba(10,12,35,0.55)] backdrop-blur">
              <p className="text-xs uppercase tracking-[0.25em] text-white/45">
                Account Snapshot
              </p>
              <div className="mt-4 grid gap-3 text-sm text-white/70">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                  <span>Active Agents</span>
                  <span className="text-base font-semibold text-white">
                    {agents.length}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                  <span>Latest Update</span>
                  <span className="text-sm text-white/60">
                    {agents[0] ? formatTimestamp(agents[0].lastUpdatedAt) : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {agentsError ? (
          <div className="mt-10 rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-5 text-sm text-red-200">
            {agentsError}
          </div>
        ) : null}

        {agents.length === 0 && !agentsError ? (
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 px-6 py-12 text-center shadow-[0_24px_80px_rgba(10,12,35,0.55)]">
            <p className="text-base font-semibold">No agents found yet.</p>
            <p className="mt-2 text-sm text-white/60">
              Once you create an agent, it will appear here with its phone
              numbers and configuration details.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6">
            {agents.map((agent, index) => (
              <div
                key={agent.agentId ?? `${agent.agentName ?? 'agent'}-${index}`}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_30px_80px_rgba(8,10,35,0.5)] backdrop-blur"
              >
                <div className="flex flex-wrap items-start justify-between gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-white/60">
                      {formatAgentType(agent.agentType)}
                    </div>
                    <h2 className="mt-3 text-2xl font-semibold">
                      {agent.agentName || 'Unnamed Agent'}
                    </h2>
                    <p className="mt-2 text-sm text-white/60">
                      Agent ID: {agent.agentId ?? '—'}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 text-sm text-white/70">
                    <span>Version: {agent.agentVersion ?? '—'}</span>
                    <span>Last Updated: {formatTimestamp(agent.lastUpdatedAt)}</span>
                  </div>
                </div>

                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                      Response Engine
                    </p>
                    <p className="mt-2 text-sm text-white/80">
                      Type: {agent.responseEngineRefDto?.type ?? '—'}
                    </p>
                    <p className="mt-1 text-sm text-white/60">
                      Conversation Flow: {getConversationFlowId(agent.responseEngineRefDto)}
                    </p>
                    <p className="mt-1 text-sm text-white/60">
                      LLM: {getLlmId(agent.responseEngineRefDto)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                      Phone Numbers
                    </p>
                    {agent.phoneNumbers?.length ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {agent.phoneNumbers.map((phone) => (
                          <span
                            key={phone}
                            className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/80"
                          >
                            {phone}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-white/60">
                        No numbers assigned.
                      </p>
                    )}
                  </div>
                </div>

                {agent.voiceAvatarUrl ? (
                  <div className="mt-6 flex items-center gap-3 text-sm text-white/60">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                      Voice Avatar
                    </span>
                    <span className="truncate">{agent.voiceAvatarUrl}</span>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
