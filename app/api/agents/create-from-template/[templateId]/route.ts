import { NextResponse } from 'next/server';
import type { VoiceAgentDto } from '@/types';
import { apiFetch } from '@/lib/api';
import { parseJsonResponse } from '@/lib/route-helpers';

const isUuidish = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.trim());

export async function POST(
  _req: Request,
  context: { params: Promise<{ templateId: string }> }
) {
  const { templateId } = await context.params;

  if (typeof templateId !== 'string' || !isUuidish(templateId)) {
    return NextResponse.json({ message: 'Invalid templateId.' }, { status: 400 });
  }

  const res = await apiFetch(`/api/v1/create-agent-from-template/${templateId}`, {
    method: 'POST',
  });
  const parsed = await parseJsonResponse<VoiceAgentDto>(res);

  if (!parsed.ok) {
    return NextResponse.json(parsed.data, { status: parsed.status });
  }

  return NextResponse.json(parsed.data);
}

