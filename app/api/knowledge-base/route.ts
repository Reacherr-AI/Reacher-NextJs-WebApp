import { NextResponse } from 'next/server';
import type { KnowledgeBaseDto } from '@/types';
import { apiFetch } from '@/lib/api';
import { parseJsonResponse } from '@/lib/route-helpers';
import { appendKnowledgeBaseSources } from './_lib/form-data';

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

const parseList = (value: unknown): KnowledgeBaseDto[] => {
  if (!Array.isArray(value)) return [];
  return value.filter(isKnowledgeBaseDto);
};

const appendKnowledgeBaseFields = (target: FormData, source: FormData, includeName: boolean) => {
  if (includeName) {
    const nameValue = source.get('knowledgeBaseName');
    if (typeof nameValue !== 'string' || nameValue.trim().length === 0) {
      throw new Error('Missing knowledgeBaseName');
    }
    target.append('knowledgeBaseName', nameValue.trim());
  }

  appendKnowledgeBaseSources(target, source);
};

export async function GET() {
  const res = await apiFetch('/api/v1/list-knowledge-bases', { method: 'GET' });
  const parsed = await parseJsonResponse<unknown>(res);

  if (!parsed.ok) {
    return NextResponse.json(parsed.data, { status: parsed.status });
  }

  return NextResponse.json(parseList(parsed.data));
}

export async function POST(req: Request) {
  const incoming = await req.formData().catch(() => null);
  if (!incoming) {
    return NextResponse.json({ message: 'Invalid multipart form body.' }, { status: 400 });
  }

  const outbound = new FormData();

  try {
    appendKnowledgeBaseFields(outbound, incoming, true);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Invalid form body.' },
      { status: 400 }
    );
  }

  const res = await apiFetch('/api/v1/create-knowledge-base', {
    method: 'POST',
    body: outbound,
  });

  const parsed = await parseJsonResponse<unknown>(res);
  if (!parsed.ok) {
    return NextResponse.json(parsed.data, { status: parsed.status });
  }

  if (!isKnowledgeBaseDto(parsed.data)) {
    return NextResponse.json({ message: 'Unexpected create response from backend.' }, { status: 502 });
  }

  return NextResponse.json(parsed.data);
}
