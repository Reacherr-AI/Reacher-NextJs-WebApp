import { apiFetch } from '@/lib/api';
import { parseJsonResponse } from '@/lib/route-helpers';
import type { KnowledgeBaseDto, ReacherrLlmDto, VoiceAgentDto } from '@/types';
import { notFound } from 'next/navigation';
import { AgentConfigEditor } from '../_components/agent-config-editor';
import { getVoiceConfigByLanguage } from '../_lib/config';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isUuid = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

const isPlaceholderVoiceId = (value: unknown): boolean => {
  if (typeof value !== 'string') return false;
  const normalized = value.trim().toLowerCase();
  return normalized.endsWith('-default') || normalized === 'alloy';
};

const sanitizeInitialAgentVoice = (agent: VoiceAgentDto): VoiceAgentDto => {
  if (!isPlaceholderVoiceId(agent.voiceId) && !isPlaceholderVoiceId(agent.ttsConfig?.voiceId)) {
    return agent;
  }

  return {
    ...agent,
    voiceId: isPlaceholderVoiceId(agent.voiceId) ? undefined : agent.voiceId,
    ttsConfig: agent.ttsConfig
      ? {
        ...agent.ttsConfig,
        voiceId: isPlaceholderVoiceId(agent.ttsConfig.voiceId) ? '' : agent.ttsConfig.voiceId,
      }
      : agent.ttsConfig,
  };
};

const isKnowledgeBaseDto = (value: unknown): value is KnowledgeBaseDto => {
  if (!isRecord(value)) return false;
  if (!isString(value.knowledgeBaseId)) return false;
  if (!isString(value.knowledgeBaseName)) return false;
  if (!isString(value.status)) return false;
  if (!Array.isArray(value.knowledgeBaseSources)) return false;
  if (typeof value.lastUpdatedTime !== 'number') return false;
  return true;
};

type ConfigDto = {
  llmModels?: Array<{ modelId?: string; provider?: string; displayName?: string }>;
  ttsModels?: Array<{ modelId?: string; provider?: string; displayName?: string }>;
  languages?: Array<{ code?: string; name?: string }>;
  emotions?: string[];
  knowledgeBases?: KnowledgeBaseDto[];
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
};

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

  const agent = sanitizeInitialAgentVoice(agentParsed.data as VoiceAgentDto);

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

  let configError: string | null = null;
  let config: ConfigDto | null = null;
  const configRes = await apiFetch('/api/v1/config', { method: 'GET' });
  if (!configRes.ok) {
    configError = (await configRes.text()) || 'Unable to load config.';
  } else {
    const data = await configRes.json().catch(() => null as ConfigDto | null);
    if (isRecord(data)) config = data;
  }

  const agentLanguageCode = (agent.languageEnum ?? agent.language ?? 'en').toString().trim().toLowerCase();
  const voices = getVoiceConfigByLanguage(agentLanguageCode);
  const knowledgeBasesFromConfig = Array.isArray(config?.knowledgeBases)
    ? config.knowledgeBases.filter(isKnowledgeBaseDto)
    : null;
  let knowledgeBases = knowledgeBasesFromConfig ?? [];
  if (!knowledgeBasesFromConfig) {
    const kbRes = await apiFetch('/api/v1/list-knowledge-bases', { method: 'GET' });
    const kbParsed = await parseJsonResponse<unknown>(kbRes);
    knowledgeBases = kbParsed.ok && Array.isArray(kbParsed.data)
      ? kbParsed.data.filter(isKnowledgeBaseDto)
      : [];
  }

  config = {
    ...(config ?? {}),
    knowledgeBases,
    voices,
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {configError ? (
        <div className="mx-auto max-w-378 px-6 pt-6 sm:px-10">
          <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-6 py-4 text-sm text-yellow-100">
            Config fetch failed: {configError}
          </div>
        </div>
      ) : null}
      <AgentConfigEditor initialAgent={agent} initialLlm={llm} initialConfig={config} />
    </div>
  );
}
