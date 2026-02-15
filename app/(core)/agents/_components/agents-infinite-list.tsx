'use client';

import * as React from 'react';
import type { AgentDashBoardDto } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { formatAgentType, formatTimestamp } from '../_lib/agent-format';

type AgentsDashboardResponse = {
  items: AgentDashBoardDto[];
  page: number;
  size: number;
  nextPage: number | null;
};

export function AgentsInfiniteList({
  initialAgents,
  initialNextPage,
  pageSize,
}: {
  initialAgents: AgentDashBoardDto[];
  initialNextPage: number | null;
  pageSize: number;
}) {
  const [agents, setAgents] = React.useState<AgentDashBoardDto[]>(initialAgents);
  const [nextPage, setNextPage] = React.useState<number | null>(initialNextPage);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [reachedEnd, setReachedEnd] = React.useState(false);

  const sentinelRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    setAgents(initialAgents);
    setNextPage(initialNextPage);
    setError(null);
    setReachedEnd(initialNextPage === null && initialAgents.length > 0);
  }, [initialAgents, initialNextPage]);

  const loadMore = React.useCallback(async () => {
    if (isLoading) return;
    if (nextPage === null) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/agents/dashboard?page=${encodeURIComponent(nextPage)}&size=${encodeURIComponent(
          pageSize
        )}`,
        {
          method: 'GET',
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Unable to load more agents.');
      }

      const data = (await res.json()) as AgentsDashboardResponse;
      const items = Array.isArray(data?.items) ? data.items : [];

      // Avoid duplicates if the observer fires twice or the backend returns overlapping pages.
      const seen = new Set(
        agents.map((a) => a.agentId ?? `${a.agentName ?? ''}-${a.agentVersion ?? ''}`)
      );
      const newItems: AgentDashBoardDto[] = [];
      for (const item of items) {
        const key = item.agentId ?? `${item.agentName ?? ''}-${item.agentVersion ?? ''}`;
        if (!seen.has(key)) {
          newItems.push(item);
          seen.add(key);
        }
      }

      if (newItems.length > 0) {
        setAgents((prev) => [...prev, ...newItems]);
      }

      // We don't have a total-count; stop when the backend returns an empty page,
      // or when we didn't add anything new (likely repeated/overlapping pages).
      if (items.length === 0 || newItems.length === 0) {
        setReachedEnd(true);
        setNextPage(null);
      } else {
        // Prefer backend hint, but keep progressing even if it isn't provided.
        setNextPage(data?.nextPage ?? nextPage + 1);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unable to load more agents.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [agents, isLoading, nextPage, pageSize]);

  React.useEffect(() => {
    if (!sentinelRef.current) return;
    if (nextPage === null) return;

    const el = sentinelRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          void loadMore();
        }
      },
      { root: null, rootMargin: '700px 0px', threshold: 0.01 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, nextPage]);

  return (
    <>
      {agents.map((agent, index) => (
        <div
          key={agent.agentId ?? `${agent.agentName ?? 'agent'}-${index}`}
          className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_30px_80px_rgba(8,10,35,0.5)] backdrop-blur cursor-pointer"
          onClick={() => { window.location.href = `/agents/${agent.agentId}` }}
        >
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-white/60">
                {formatAgentType(agent.agentType)}
              </div>
              <h2 className="mt-3 text-2xl font-semibold">
                {agent.agentName || 'Unnamed Agent'}
              </h2>
            </div>
            <div className="flex flex-col gap-2 text-sm text-white/70">
              <span>Version: {agent.agentVersion ?? '—'}</span>
              <span>Last Updated: {formatTimestamp(agent.lastUpdatedAt)}</span>
            </div>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/50">Response Engine</p>
              <p className="mt-2 text-sm text-white/80">
                Type: {agent.responseEngineRefDto?.type ?? '—'}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/50">Phone Numbers</p>
              {agent.phoneNumbers?.length ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {agent.phoneNumbers.map((phone) => (
                    <span
                      key={phone}
                      className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/80"
                    >
                      {phone}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-white/60">No numbers assigned.</p>
              )}
            </div>
          </div>

          {agent.voiceAvatarUrl ? (
            <div className="mt-6 flex items-center gap-3 text-sm text-white/60">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                Voice Avatar
              </span>
              <span className="truncate">{agent.voiceAvatarUrl}</span>
            </div>
          ) : null}
        </div>
      ))}

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-5 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {isLoading ? <AgentsSkeleton count={Math.min(6, pageSize)} /> : null}

      <div ref={sentinelRef} />

      {reachedEnd && agents.length > 0 ? (
        <div className="py-6 text-center text-sm text-white/50">You have reached the end.</div>
      ) : null}
    </>
  );
}

function AgentsSkeleton({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: Math.max(3, Math.min(count, 8)) }).map((_, i) => (
        <div
          key={`agent-skeleton-${i}`}
          className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_30px_80px_rgba(8,10,35,0.5)] backdrop-blur"
        >
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="w-full max-w-md">
              <Skeleton className="h-6 w-40 rounded-full bg-white/10" />
              <Skeleton className="mt-4 h-8 w-72 bg-white/10" />
            </div>
            <div className="w-full max-w-xs space-y-2">
              <Skeleton className="h-4 w-40 bg-white/10" />
              <Skeleton className="h-4 w-56 bg-white/10" />
            </div>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <Skeleton className="h-4 w-36 bg-white/10" />
              <Skeleton className="mt-3 h-5 w-44 bg-white/10" />
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <Skeleton className="h-4 w-36 bg-white/10" />
              <div className="mt-3 flex flex-wrap gap-2">
                <Skeleton className="h-6 w-24 rounded-full bg-white/10" />
                <Skeleton className="h-6 w-28 rounded-full bg-white/10" />
                <Skeleton className="h-6 w-20 rounded-full bg-white/10" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
