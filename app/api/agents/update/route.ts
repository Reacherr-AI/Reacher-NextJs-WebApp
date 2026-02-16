import { NextResponse } from 'next/server';
import type { VoiceAgentDto } from '@/types';
import { apiFetch } from '@/lib/api';
import { parseJsonResponse } from '@/lib/route-helpers';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isUuid = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

const sanitizeVoiceMailOption = (value: unknown): unknown => {
  if (!isRecord(value)) return value;
  const out: Record<string, unknown> = {};
  if (typeof value.voiceMailOptionType === 'string') {
    out.voiceMailOptionType = value.voiceMailOptionType;
  }
  if (typeof value.text === 'string') {
    out.text = value.text;
  }
  return out;
};

const tryParseJson = (value: string): unknown => {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const cleanStringList = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  const next = value
    .map((v) => (typeof v === 'string' ? v.trim() : ''))
    .filter((v) => v.length > 0);
  return next.length > 0 ? next : undefined;
};

const sanitizePostCallField = (value: unknown): Record<string, unknown> | null => {
  if (!isRecord(value)) return null;

  const type = typeof value.type === 'string' ? value.type.trim().toLowerCase() : '';
  const name = typeof value.name === 'string' ? value.name.trim() : '';
  const description = typeof value.description === 'string' ? value.description.trim() : '';
  if (!type || !name || !description) return null;

  if (type === 'string') {
    const examples = cleanStringList(value.examples);
    if (!examples) return null;
    return { type, name, description, examples };
  }

  if (type === 'enum') {
    const choices = cleanStringList(value.choices);
    if (!choices) return null;
    return { type, name, description, choices };
  }

  if (type === 'number' || type === 'boolean') {
    return { type, name, description };
  }

  return null;
};

const sanitizePostCallFieldList = (value: unknown): Array<Record<string, unknown>> => {
  if (!Array.isArray(value)) return [];
  return value
    .map((field) => sanitizePostCallField(field))
    .filter((field): field is Record<string, unknown> => field !== null);
};

const normalizePostCallAnalysisData = (value: unknown): unknown => {
  const parsed = typeof value === 'string' ? tryParseJson(value) : value;

  if (Array.isArray(parsed)) {
    return { data: sanitizePostCallFieldList(parsed) };
  }

  if (!isRecord(parsed)) return parsed;

  const next = { ...parsed } as Record<string, unknown>;
  const rawData = next.data;
  const parsedData = typeof rawData === 'string' ? tryParseJson(rawData) : rawData;

  if (Array.isArray(parsedData)) {
    next.data = sanitizePostCallFieldList(parsedData);
    return next;
  }

  return next;
};

const sanitizeUpdatePayload = (value: unknown): unknown => {
  if (!isRecord(value)) return value;
  const payload = { ...value };
  if ('voiceMailOption' in payload) {
    payload.voiceMailOption = sanitizeVoiceMailOption(payload.voiceMailOption);
  }
  if ('voicemailOption' in payload) {
    payload.voicemailOption = sanitizeVoiceMailOption(payload.voicemailOption);
  }
  if ('postCallAnalysisData' in payload) {
    payload.postCallAnalysisData = normalizePostCallAnalysisData(payload.postCallAnalysisData);
  }
  return payload;
};

export async function PATCH(req: Request) {
  const url = new URL(req.url);
  const raw = (await req.json().catch(() => null)) as unknown;
  const sanitized = sanitizeUpdatePayload(raw);

  const agentIdFromQuery = url.searchParams.get('agentId');
  const agentIdFromBody = isRecord(sanitized) ? sanitized.agentId : undefined;
  const agentId = isUuid(agentIdFromQuery)
    ? agentIdFromQuery
    : isUuid(agentIdFromBody)
      ? agentIdFromBody
      : null;

  if (!agentId) {
    return NextResponse.json({ message: 'Missing or invalid agentId.' }, { status: 400 });
  }

  if (!isRecord(sanitized)) {
    return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
  }

  const res = await apiFetch(`/api/v1/update-voice-agent/${agentId}`, {
    method: 'PATCH',
    body: JSON.stringify(sanitized),
  });
  const parsed = await parseJsonResponse<VoiceAgentDto>(res);

  if (!parsed.ok) {
    return NextResponse.json(parsed.data, { status: parsed.status });
  }

  return NextResponse.json(parsed.data);
}
