import { NextResponse } from 'next/server';
import type { TemplateDto } from '@/types';
import { apiFetch } from '@/lib/api';
import { parseJsonResponse } from '@/lib/route-helpers';

export async function GET() {
  const res = await apiFetch('/api/v1/templates', { method: 'GET' });
  const parsed = await parseJsonResponse<TemplateDto[]>(res);

  if (!parsed.ok) {
    return NextResponse.json(parsed.data, { status: parsed.status });
  }

  return NextResponse.json(parsed.data);
}

