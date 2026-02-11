import { NextResponse } from 'next/server';
import type { ReacherrLlmDto } from '@/types';
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

  const llmIdFromQuery = url.searchParams.get('llmId');
  const llmIdFromBody = isRecord(raw) ? raw.llmId : undefined;
  const llmId = isUuid(llmIdFromQuery)
    ? llmIdFromQuery
    : isUuid(llmIdFromBody)
      ? llmIdFromBody
      : null;

  if (!llmId) {
    return NextResponse.json({ message: 'Missing or invalid llmId.' }, { status: 400 });
  }

  if (!isRecord(raw)) {
    return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
  }

  const res = await apiFetch(`/api/v1/update-reacherr-llm/${llmId}`, {
    method: 'PATCH',
    body: JSON.stringify(raw),
  });
  const parsed = await parseJsonResponse<ReacherrLlmDto>(res);

  if (!parsed.ok) {
    return NextResponse.json(parsed.data, { status: parsed.status });
  }

  return NextResponse.json(parsed.data);
}
