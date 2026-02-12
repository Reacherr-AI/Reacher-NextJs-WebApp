import { NextResponse } from 'next/server';
import { apiFetch } from '@/lib/api';
import { parseJsonResponse } from '@/lib/route-helpers';

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ knowledgeBaseId: string; sourceId: string }> }
) {
  const { knowledgeBaseId, sourceId } = await params;

  if (!isUuid(knowledgeBaseId) || !isUuid(sourceId)) {
    return NextResponse.json({ message: 'Invalid path params.' }, { status: 400 });
  }

  const res = await apiFetch(`/api/v1/${knowledgeBaseId}/source/${sourceId}`, { method: 'GET' });
  const parsed = await parseJsonResponse<unknown>(res);

  if (!parsed.ok) {
    return NextResponse.json(parsed.data, { status: parsed.status });
  }

  return NextResponse.json(parsed.data);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ knowledgeBaseId: string; sourceId: string }> }
) {
  const { knowledgeBaseId, sourceId } = await params;

  if (!isUuid(knowledgeBaseId) || !isUuid(sourceId)) {
    return NextResponse.json({ message: 'Invalid path params.' }, { status: 400 });
  }

  const res = await apiFetch(`/api/v1/delete-knowledge-base-source/${knowledgeBaseId}/source/${sourceId}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const parsed = await parseJsonResponse<unknown>(res);
    return NextResponse.json(parsed.data, { status: parsed.status });
  }

  return NextResponse.json({ ok: true });
}
