'use client';

import { useMemo, useState } from 'react';
import type { KnowledgeBaseDto } from '@/types';
import { KnowledgeBaseListPanel } from './knowledge-base-list-panel';
import { KnowledgeBaseDetailPanel } from './knowledge-base-detail-panel';
import { CreateKnowledgeBaseModal } from './create-knowledge-base-modal';
import type { DraftTextSource, DraftUrlSource } from './types';

type ApiError = { message?: unknown };

type KnowledgeBaseShellProps = {
  initialKnowledgeBases: KnowledgeBaseDto[];
  initialError: string | null;
};

const parseErrorMessage = (status: number, data: unknown) => {
  if (typeof (data as ApiError | null)?.message === 'string') {
    return (data as { message: string }).message;
  }

  return `Request failed (HTTP ${status}).`;
};

async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  const text = await res.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { message: text };
    }
  }

  if (!res.ok) {
    throw new Error(parseErrorMessage(res.status, parsed));
  }

  return parsed as T;
}

export function KnowledgeBaseShell({ initialKnowledgeBases, initialError }: KnowledgeBaseShellProps) {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBaseDto[]>(initialKnowledgeBases);
  const [selectedKnowledgeBaseId, setSelectedKnowledgeBaseId] = useState<string | null>(
    initialKnowledgeBases[0]?.knowledgeBaseId ?? null
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(initialError);

  const selectedKnowledgeBase = useMemo(
    () => knowledgeBases.find((kb) => kb.knowledgeBaseId === selectedKnowledgeBaseId) ?? null,
    [knowledgeBases, selectedKnowledgeBaseId]
  );

  const upsertKnowledgeBase = (updatedKnowledgeBase: KnowledgeBaseDto) => {
    setKnowledgeBases((prev) => {
      const existingIndex = prev.findIndex((item) => item.knowledgeBaseId === updatedKnowledgeBase.knowledgeBaseId);
      if (existingIndex === -1) {
        return [updatedKnowledgeBase, ...prev];
      }

      const next = [...prev];
      next[existingIndex] = updatedKnowledgeBase;
      return next;
    });
  };

  const handleDeleteKnowledgeBase = async (knowledgeBaseId: string) => {
    setBusy(true);
    setError(null);

    try {
      await requestJson<{ ok: true }>(`/api/knowledge-base/${encodeURIComponent(knowledgeBaseId)}`, {
        method: 'DELETE',
      });

      setKnowledgeBases((prev) => {
        const remaining = prev.filter((kb) => kb.knowledgeBaseId !== knowledgeBaseId);
        setSelectedKnowledgeBaseId((selected) => {
          if (selected !== knowledgeBaseId) return selected;
          return remaining[0]?.knowledgeBaseId ?? null;
        });
        return remaining;
      });
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteSource = async (knowledgeBaseId: string, sourceId: string) => {
    setBusy(true);
    setError(null);

    try {
      await requestJson<{ ok: true }>(
        `/api/knowledge-base/${encodeURIComponent(knowledgeBaseId)}/sources/${encodeURIComponent(sourceId)}`,
        { method: 'DELETE' }
      );

      const refreshed = await requestJson<KnowledgeBaseDto>(
        `/api/knowledge-base/${encodeURIComponent(knowledgeBaseId)}`,
        { method: 'GET' }
      );
      upsertKnowledgeBase(refreshed);
    } finally {
      setBusy(false);
    }
  };

  const handleAddFiles = async (knowledgeBaseId: string, files: File[]) => {
    setBusy(true);
    setError(null);

    try {
      const formData = new FormData();
      for (const file of files) {
        formData.append('knowledgeBaseFiles', file, file.name);
      }

      const updated = await requestJson<KnowledgeBaseDto>(
        `/api/knowledge-base/${encodeURIComponent(knowledgeBaseId)}/sources`,
        {
          method: 'POST',
          body: formData,
        }
      );

      upsertKnowledgeBase(updated);
    } finally {
      setBusy(false);
    }
  };

  const handleAddText = async (knowledgeBaseId: string, textSource: DraftTextSource) => {
    setBusy(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append(
        'knowledgeBaseTexts',
        new Blob([JSON.stringify({ title: textSource.title, text: textSource.text })], {
          type: 'application/json',
        }),
        'knowledgeBaseText.json'
      );

      const updated = await requestJson<KnowledgeBaseDto>(
        `/api/knowledge-base/${encodeURIComponent(knowledgeBaseId)}/sources`,
        {
          method: 'POST',
          body: formData,
        }
      );

      upsertKnowledgeBase(updated);
    } finally {
      setBusy(false);
    }
  };

  const handleAddUrls = async (knowledgeBaseId: string, urlSource: DraftUrlSource) => {
    setBusy(true);
    setError(null);

    try {
      const formData = new FormData();
      for (const url of urlSource.urls) {
        formData.append('knowledgeBaseUrls', url);
      }

      const updated = await requestJson<KnowledgeBaseDto>(
        `/api/knowledge-base/${encodeURIComponent(knowledgeBaseId)}/sources`,
        {
          method: 'POST',
          body: formData,
        }
      );

      upsertKnowledgeBase(updated);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-[22rem_1fr]">
        <KnowledgeBaseListPanel
          knowledgeBases={knowledgeBases}
          selectedKnowledgeBaseId={selectedKnowledgeBaseId}
          onSelect={setSelectedKnowledgeBaseId}
          onCreateClick={() => {
            setError(null);
            setCreateOpen(true);
          }}
        />

        <KnowledgeBaseDetailPanel
          knowledgeBase={selectedKnowledgeBase}
          busy={busy}
          onDeleteKnowledgeBase={handleDeleteKnowledgeBase}
          onDeleteSource={handleDeleteSource}
          onAddFiles={handleAddFiles}
          onAddText={handleAddText}
          onAddUrls={handleAddUrls}
        />
      </div>

      {error ? (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {createOpen ? (
        <CreateKnowledgeBaseModal
          open={createOpen}
          onOpenChange={setCreateOpen}
          onCreated={(knowledgeBase) => {
            upsertKnowledgeBase(knowledgeBase);
            setSelectedKnowledgeBaseId(knowledgeBase.knowledgeBaseId);
          }}
        />
      ) : null}
    </>
  );
}
