import { NextResponse } from 'next/server';
import type { AgentDashBoardDto } from '@/types';
import { apiFetch } from '@/lib/api';
import { parseJsonResponse } from '@/lib/route-helpers';

const clampInt = (value: string | null, fallback: number, min: number, max: number) => {
  if (!value) return fallback;
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n)) return fallback;
  const v = Math.floor(n);
  if (v < min) return min;
  if (v > max) return max;
  return v;
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const page = clampInt(url.searchParams.get('page'), 0, 0, 10_000);
  const size = clampInt(url.searchParams.get('size'), 50, 1, 200);

  const res = await apiFetch(`/api/v1/list-agent-dashboard?page=${page}&size=${size}`, {
    method: 'GET',
  });
  const parsed = await parseJsonResponse<AgentDashBoardDto[]>(res);

  if (!parsed.ok) {
    return NextResponse.json(parsed.data, { status: parsed.status });
  }

  const items = Array.isArray(parsed.data) ? parsed.data : [];
  // Without a total-count, use "non-empty page" as the has-more signal.
  const nextPage = items.length > 0 ? page + 1 : null;

  return NextResponse.json({
    items,
    page,
    size,
    nextPage,
  });
}
