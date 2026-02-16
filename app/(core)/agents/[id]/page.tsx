import { apiFetch } from '@/lib/api';
import { parseJsonResponse } from '@/lib/route-helpers';
import type { ReacherrLlmDto, VoiceAgentDto } from '@/types';
import { notFound } from 'next/navigation';
import { AgentConfigEditor } from '../_components/agent-config-editor';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isUuid = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

const resolveReacherrLlmId = (agent: VoiceAgentDto): string | null => {
  const re = agent.responseEngine as unknown;
  if (!isRecord(re)) return null;
  if (typeof re.type === 'string' && re.type.trim().length > 0 && re.type !== 'reacherr-llm') {
    return null;
  }
  if (typeof re.llmId === 'string' && re.llmId.trim().length > 0) return re.llmId;
  if (typeof re.engineId === 'string' && re.engineId.trim().length > 0) return re.engineId;
  return null;
};

export default async function AgentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const agentRes = await apiFetch(`/api/v1/get-voice-agent/${id}`, { method: 'GET' });
  const agentParsed = await parseJsonResponse<VoiceAgentDto>(agentRes);
  if (!agentParsed.ok) notFound();

  const agent = agentParsed.data as VoiceAgentDto;

  let llm: ReacherrLlmDto | null = null;
  const llmId = resolveReacherrLlmId(agent);
  if (llmId) {
    const llmRes = await apiFetch(`/api/v1/get-reacherr-llm/${llmId}`, {
      method: 'GET',
    });
    const llmParsed = await parseJsonResponse<ReacherrLlmDto>(llmRes);
    if (llmParsed.ok) {
      llm = llmParsed.data as ReacherrLlmDto;
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <AgentConfigEditor initialAgent={agent} initialLlm={llm} />
    </div>
  );
}
