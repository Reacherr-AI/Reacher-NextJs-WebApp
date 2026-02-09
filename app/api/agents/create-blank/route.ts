import { NextResponse } from 'next/server';
import type { ReacherrLlmDto, VoiceAgentDto } from '@/types';
import { apiFetch } from '@/lib/api';
import { parseJsonResponse } from '@/lib/route-helpers';

type Architecture = 'single-prompt';

type EngineType = 'REACHERR_LLM' | 'CONVERSATION_FLOW';

type VoiceAgentCreateBody = {
  agentName: string;
  responseEngine: {
    type: EngineType;
    llmId?: string;
    conversationFlowId?: string;
    version: number;
  };
};

const isArchitecture = (value: unknown): value is Architecture =>
  value === 'single-prompt';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isReacherrLlmDto = (value: unknown): value is ReacherrLlmDto =>
  isRecord(value) && (value.llmId === undefined || typeof value.llmId === 'string');

const nowSlug = () => new Date().toISOString().replace(/[:.]/g, '-');

export async function POST(req: Request) {
  const raw = (await req.json().catch(() => null)) as unknown;

  if (!isRecord(raw) || !isArchitecture(raw.architecture)) {
    return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
  }

  const llmBody: Partial<ReacherrLlmDto> = {
    beginMessage: '',
    toolCallStrictMode: false,
    generalTools: [
      {
        type: 'end_call',
        name: 'end_call',
        description:
          'End the call when user has to leave (like says bye) or you are instructed to do so.',
      },
    ],
  };

  const llmRes = await apiFetch('/api/v1/create-reacherr-llm', {
    method: 'POST',
    body: JSON.stringify(llmBody),
  });
  const llmParsed = await parseJsonResponse<ReacherrLlmDto>(llmRes);

  if (!llmParsed.ok) {
    return NextResponse.json(llmParsed.data, { status: llmParsed.status });
  }

  if (!isReacherrLlmDto(llmParsed.data)) {
    return NextResponse.json({ message: 'Unexpected LLM response from backend.' }, { status: 502 });
  }

  const llmId = llmParsed.data.llmId;
  if (typeof llmId !== 'string' || llmId.trim().length === 0) {
    return NextResponse.json({ message: 'Backend did not return an llmId.' }, { status: 502 });
  }

  const agentBody: VoiceAgentCreateBody = {
    agentName: `Single-Prompt Agent ${nowSlug()}`,
    responseEngine: { type: 'REACHERR_LLM', llmId, version: 0 },
  };

  const agentRes = await apiFetch('/api/v1/create-voice-agent', {
    method: 'POST',
    body: JSON.stringify(agentBody),
  });
  const agentParsed = await parseJsonResponse<VoiceAgentDto>(agentRes);

  if (!agentParsed.ok) {
    return NextResponse.json(agentParsed.data, { status: agentParsed.status });
  }

  return NextResponse.json(agentParsed.data);
}
