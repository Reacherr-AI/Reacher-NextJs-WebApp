import { NextResponse } from 'next/server';
import type { ReacherrLlmDto } from '@/types';
import { apiFetch } from '@/lib/api';
import { parseJsonResponse } from '@/lib/route-helpers';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isUuid = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

const normalizeMcpsForUpdate = (value: unknown): unknown => {
  if (!Array.isArray(value)) return value;
  return value.map((item) => {
    if (!isRecord(item)) return item;
    const next: Record<string, unknown> = { ...item };

    const queryParams = isRecord(next.queryParams)
      ? next.queryParams
      : isRecord(next.query_params)
        ? next.query_params
        : undefined;
    if (queryParams) next.queryParams = queryParams;
    delete next.query_params;

    const timeoutMs =
      typeof next.timeoutMs === 'number'
        ? next.timeoutMs
        : typeof next.timeout_ms === 'number'
          ? next.timeout_ms
          : undefined;
    if (typeof timeoutMs === 'number') next.timeoutMs = timeoutMs;
    delete next.timeout_ms;

    return next;
  });
};

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

  const normalizedPayload: Record<string, unknown> = { ...raw };
  if ('mcps' in normalizedPayload) {
    normalizedPayload.mcps = normalizeMcpsForUpdate(normalizedPayload.mcps);
  }

  const res = await apiFetch(`/api/v1/update-reacherr-llm/${llmId}`, {
    method: 'PATCH',
    body: JSON.stringify(normalizedPayload),
  });
  const parsed = await parseJsonResponse<ReacherrLlmDto>(res);

  if (!parsed.ok) {
    return NextResponse.json(parsed.data, { status: parsed.status });
  }

  return NextResponse.json(parsed.data);
}
