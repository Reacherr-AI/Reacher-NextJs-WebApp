import { NextResponse } from 'next/server';
import { apiFetch } from '@/lib/api';
import { parseJsonResponse } from '@/lib/route-helpers';
import { appendKnowledgeBaseSources, hasKnowledgeBaseSources } from '@/app/api/knowledge-base/_lib/form-data';

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

export async function POST(
  req: Request,
  { params }: { params: Promise<{ knowledgeBaseId: string }> }
) {
  const { knowledgeBaseId } = await params;

  if (!isUuid(knowledgeBaseId)) {
    return NextResponse.json({ message: 'Invalid knowledgeBaseId.' }, { status: 400 });
  }

  const incoming = await req.formData().catch(() => null);
  if (!incoming) {
    return NextResponse.json({ message: 'Invalid multipart form body.' }, { status: 400 });
  }

  const outbound = new FormData();
  appendKnowledgeBaseSources(outbound, incoming);
  const hasSource = hasKnowledgeBaseSources(outbound);

  if (!hasSource) {
    return NextResponse.json({ message: 'At least one source is required.' }, { status: 400 });
  }

  const res = await apiFetch(`/api/v1/add-knowledge-base-sources/${knowledgeBaseId}`, {
    method: 'POST',
    body: outbound,
  });

  const parsed = await parseJsonResponse<unknown>(res);
  if (!parsed.ok) {
    return NextResponse.json(parsed.data, { status: parsed.status });
  }

  return NextResponse.json(parsed.data);
}
