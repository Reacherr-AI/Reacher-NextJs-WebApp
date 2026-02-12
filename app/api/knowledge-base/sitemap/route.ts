import { NextResponse } from 'next/server';
import type { ListSitemapRequestDto, ListSitemapResponseDto } from '@/types';
import { apiFetch } from '@/lib/api';
import { parseJsonResponse } from '@/lib/route-helpers';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isStringArray = (value: unknown): value is ListSitemapResponseDto =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

export async function POST(req: Request) {
  const raw = (await req.json().catch(() => null)) as unknown;

  if (!isRecord(raw) || typeof raw.websiteUrl !== 'string' || raw.websiteUrl.trim().length === 0) {
    return NextResponse.json({ message: 'websiteUrl is required.' }, { status: 400 });
  }

  const body: ListSitemapRequestDto = {
    websiteUrl: raw.websiteUrl.trim(),
  };

  const res = await apiFetch('/api/v1/list-sitemap', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  const parsed = await parseJsonResponse<unknown>(res);
  if (!parsed.ok) {
    return NextResponse.json(parsed.data, { status: parsed.status });
  }

  if (!isStringArray(parsed.data)) {
    return NextResponse.json({ message: 'Unexpected sitemap response from backend.' }, { status: 502 });
  }

  return NextResponse.json(parsed.data);
}
