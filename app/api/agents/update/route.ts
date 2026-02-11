import { NextResponse } from 'next/server';
import type { VoiceAgentDto } from '@/types';
import { apiFetch } from '@/lib/api';
import { parseJsonResponse } from '@/lib/route-helpers';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isUuid = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

export async function PATCH(req: Request) {
  const url = new URL(req.url);
  const raw = (await req.json().catch(() => null)) as unknown;

  const agentIdFromQuery = url.searchParams.get('agentId');
  const agentIdFromBody = isRecord(raw) ? raw.agentId : undefined;
  const agentId = isUuid(agentIdFromQuery)
    ? agentIdFromQuery
    : isUuid(agentIdFromBody)
      ? agentIdFromBody
      : null;

  if (!agentId) {
    return NextResponse.json({ message: 'Missing or invalid agentId.' }, { status: 400 });
  }

  if (!isRecord(raw)) {
    return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
  }

  const res = await apiFetch(`/api/v1/publish-voice-agent/${agentId}`, {
    method: 'PATCH',
    body: JSON.stringify(raw),
  });
  const parsed = await parseJsonResponse<VoiceAgentDto>(res);

  if (!parsed.ok) {
    return NextResponse.json(parsed.data, { status: parsed.status });
  }

  return NextResponse.json(parsed.data);
}
