import { apiFetch } from '@/lib/api';
import { parseJsonResponse } from '@/lib/route-helpers';
import type { KnowledgeBaseDto } from '@/types';
import { KnowledgeBaseShell } from './_components/knowledge-base-shell';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isKnowledgeBaseDto = (value: unknown): value is KnowledgeBaseDto => {
  if (!isRecord(value)) return false;
  if (!isString(value.knowledgeBaseId)) return false;
  if (!isString(value.knowledgeBaseName)) return false;
  if (!isString(value.status)) return false;
  if (!Array.isArray(value.knowledgeBaseSources)) return false;
  if (typeof value.lastUpdatedTime !== 'number') return false;
  return true;
};

const fetchKnowledgeBases = async () => {
  const res = await apiFetch('/api/v1/list-knowledge-bases', { method: 'GET' });
  const parsed = await parseJsonResponse<unknown>(res);

  if (!parsed.ok) {
    const message =
      isRecord(parsed.data) && typeof parsed.data.message === 'string'
        ? parsed.data.message
        : 'Unable to load knowledge bases.';

    return {
      knowledgeBases: [] as KnowledgeBaseDto[],
      error: message,
    };
  }

  const knowledgeBases = Array.isArray(parsed.data)
    ? parsed.data.filter(isKnowledgeBaseDto)
    : [];

  return {
    knowledgeBases,
    error: null as string | null,
  };
};

export default async function KnowledgeBasePage() {
  const { knowledgeBases, error } = await fetchKnowledgeBases();

  return (
    <div className="min-h-screen bg-black pb-16 text-white">
      <div className="mx-auto h-full w-full max-w-378 rounded-b-[26px] bg-[radial-gradient(1200px_circle_at_75%_10%,rgba(248,248,248,0.08)_0%,rgba(56,66,218,0.35)_32%,rgba(12,14,55,0.75)_60%,rgba(0,0,0,1)_100%)] px-4 pb-12 pt-8 shadow-[0_40px_120px_rgba(6,7,33,0.45)] sm:px-8">
        <header className="mb-7">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">
            Workspace
          </p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl">Knowledge Base</h1>
          <p className="mt-3 max-w-2xl text-sm text-white/65 sm:text-base">
            Create and manage source collections for your agents using files, text snippets, and website pages.
          </p>
        </header>

        <KnowledgeBaseShell initialKnowledgeBases={knowledgeBases} initialError={error} />
      </div>
    </div>
  );
}
