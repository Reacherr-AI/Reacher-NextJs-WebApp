import { apiFetch } from '@/lib/api';
import type { AgentDashBoardDto, AgentTemplateType, TemplateDto } from '@/types';
import { AgentsInfiniteList } from './_components/agents-infinite-list';
import { formatTimestamp } from './_lib/agent-format';
import { CreateAgentModal } from './_components/create-agent-modal';

const PAGE_SIZE = 50;

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


const getAgentsPage = async (page: number) => {
  const safePage = Number.isFinite(page) && page >= 0 ? Math.floor(page) : 0;
  const res = await apiFetch(
    `/api/v1/list-agent-dashboard?page=${safePage}&size=${PAGE_SIZE}`
  );

  if (!res.ok) {
    const message = await res.text();
    return {
      agents: [] as AgentDashBoardDto[],
      nextPage: null as number | null,
      error: message || 'Unable to load agents.',
    };
  }

  const data = (await res.json()) as AgentDashBoardDto[];
  const agents = Array.isArray(data) ? data : [];
  // Some backends cap `size` regardless of what we request. Without a total-count,
  // the safest has-more signal is "non-empty page"; we'll stop once we hit an empty page.
  const nextPage = agents.length > 0 ? safePage + 1 : null;

  return { agents, nextPage, error: null as string | null };
};


// ------------------------------------------------------------------
// ---------------------- RENDER PAGE -------------------------------
// ------------------------------------------------------------------


export default async function AgentsPage() {
  const [
    { agents, nextPage, error: agentsError },
    { templates, error: templatesError },
  ] = await Promise.all([getAgentsPage(0), getTemplates()]);

  return (
    <div className="min-h-screen bg-black pb-16 text-white">
      <div
        role="main"
        className="mx-auto h-full w-full max-w-378 rounded-b-[26px] bg-[radial-gradient(1200px_circle_at_75%_10%,rgba(248,248,248,0.08)_0%,rgba(56,66,218,0.35)_32%,rgba(12,14,55,0.75)_60%,rgba(0,0,0,1)_100%)] px-6 pb-12 pt-10 shadow-[0_40px_120px_rgba(6,7,33,0.45)] sm:px-10"
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
          </div>

          <div className="w-full max-w-sm">
            <CreateAgentModal initialTemplates={templates} initialTemplatesError={templatesError} />

            <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_30px_80px_rgba(10,12,35,0.55)] backdrop-blur">
              <p className="text-xs uppercase tracking-[0.25em] text-white/45">
                Account Snapshot
              </p>
              <div className="mt-4 grid gap-3 text-sm text-white/70">
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
            <AgentsInfiniteList
              initialAgents={agents}
              initialNextPage={nextPage}
              pageSize={PAGE_SIZE}
            />
          </div>
        )}
      </div>
    </div>
  );
}
