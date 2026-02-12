'use client';

import { useMemo, useRef, useState } from 'react';
import type { KnowledgeBaseDto } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AddSourceMenu } from './add-source-menu';
import { AddTextSourceModal } from './add-text-source-modal';
import { AddWebPagesModal } from './add-web-pages-modal';
import type { DraftFileSource, DraftSource, DraftTextSource, DraftUrlSource } from './types';

type ApiError = { message?: unknown };

type CreateKnowledgeBaseModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (knowledgeBase: KnowledgeBaseDto) => void;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isKnowledgeBaseDto = (value: unknown): value is KnowledgeBaseDto => {
  if (!isRecord(value)) return false;
  if (typeof value.knowledgeBaseId !== 'string') return false;
  if (typeof value.knowledgeBaseName !== 'string') return false;
  if (typeof value.status !== 'string') return false;
  if (!Array.isArray(value.knowledgeBaseSources)) return false;
  if (typeof value.lastUpdatedTime !== 'number') return false;
  return true;
};

const sourceSummary = (source: DraftSource) => {
  if (source.kind === 'files') {
    return `${source.files.length} file(s)`;
  }

  if (source.kind === 'text') {
    return source.title;
  }

  return `${source.websiteUrl || 'website'} (${source.urls.length} page(s))`;
};

const hasAnySource = (sources: DraftSource[]) =>
  sources.some((source) => {
    if (source.kind === 'files') return source.files.length > 0;
    if (source.kind === 'text') return source.title.trim().length > 0 && source.text.trim().length > 0;
    return source.urls.length > 0;
  });

export function CreateKnowledgeBaseModal({
  open,
  onOpenChange,
  onCreated,
}: CreateKnowledgeBaseModalProps) {
  const [knowledgeBaseName, setKnowledgeBaseName] = useState('');
  const [sources, setSources] = useState<DraftSource[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addTextOpen, setAddTextOpen] = useState(false);
  const [addWebOpen, setAddWebOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const canSave = useMemo(
    () => knowledgeBaseName.trim().length > 0 && hasAnySource(sources) && !saving,
    [knowledgeBaseName, saving, sources]
  );

  if (!open) return null;

  const appendFiles = (files: File[]) => {
    if (files.length === 0) return;

    setSources((prev) => {
      const existingIndex = prev.findIndex((item) => item.kind === 'files');
      if (existingIndex === -1) {
        return [...prev, { kind: 'files', files }];
      }

      const copy = [...prev];
      const existing = copy[existingIndex] as DraftFileSource;
      copy[existingIndex] = {
        kind: 'files',
        files: [...existing.files, ...files],
      };
      return copy;
    });
  };

  const saveKnowledgeBase = async () => {
    if (!canSave) return;

    setSaving(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('knowledgeBaseName', knowledgeBaseName.trim());

      for (const source of sources) {
        if (source.kind === 'files') {
          for (const file of source.files) {
            formData.append('knowledgeBaseFiles', file, file.name);
          }
          continue;
        }

        if (source.kind === 'text') {
          formData.append(
            'knowledgeBaseTexts',
            new Blob([JSON.stringify({ title: source.title, text: source.text })], {
              type: 'application/json',
            }),
            'knowledgeBaseText.json'
          );
          continue;
        }

        for (const url of source.urls) {
          formData.append('knowledgeBaseUrls', url);
        }
      }

      const res = await fetch('/api/knowledge-base', {
        method: 'POST',
        body: formData,
      });

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
        const message =
          typeof (parsed as ApiError | null)?.message === 'string'
            ? (parsed as { message: string }).message
            : `Request failed (HTTP ${res.status}).`;
        throw new Error(message);
      }

      if (!isKnowledgeBaseDto(parsed)) {
        throw new Error('Unexpected create response from server.');
      }

      onCreated(parsed);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create knowledge base.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onOpenChange(false);
      }}
    >
      <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-[#101528] p-5 text-white shadow-[0_30px_100px_rgba(2,4,20,0.75)] sm:p-6">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            event.currentTarget.value = '';
            appendFiles(files);
          }}
        />

        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold">Add Knowledge Base</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
            className="rounded-full px-2 py-1 text-xl text-white/70 hover:bg-white/10 hover:text-white"
          >
            x
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-white/70">Knowledge Base Name</label>
            <Input
              value={knowledgeBaseName}
              onChange={(event) => setKnowledgeBaseName(event.target.value)}
              placeholder="Enter"
              className="border-white/10 bg-black/20 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/70">Documents</label>
            {sources.length > 0 ? (
              <div className="mb-3 space-y-2">
                {sources.map((source, index) => (
                  <div
                    key={`${source.kind}-${index}`}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{sourceSummary(source)}</p>
                      {source.kind === 'files' ? (
                        <p className="mt-0.5 truncate text-xs text-white/60">
                          {source.files.map((file) => file.name).join(', ')}
                        </p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      aria-label="Remove source"
                      className="rounded p-1 text-white/60 hover:bg-white/10 hover:text-white"
                      onClick={() => {
                        setSources((prev) => prev.filter((_, sourceIndex) => sourceIndex !== index));
                      }}
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            <AddSourceMenu
              disabled={saving}
              onAddFiles={() => fileInputRef.current?.click()}
              onAddText={() => setAddTextOpen(true)}
              onAddWebPages={() => setAddWebOpen(true)}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-white/55">
            <input type="checkbox" disabled className="cursor-not-allowed" />
            Updates existing content every 24 hours (coming soon)
          </label>

          {error ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            className="border-white/20 bg-transparent text-white hover:bg-white/10"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!canSave}
            className="bg-white text-black hover:bg-white/90"
            onClick={() => void saveKnowledgeBase()}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {addTextOpen ? (
        <AddTextSourceModal
          open={addTextOpen}
          onOpenChange={setAddTextOpen}
          onSave={(source: DraftTextSource) => setSources((prev) => [...prev, source])}
        />
      ) : null}

      {addWebOpen ? (
        <AddWebPagesModal
          open={addWebOpen}
          onOpenChange={setAddWebOpen}
          onSave={(source: DraftUrlSource) => setSources((prev) => [...prev, source])}
        />
      ) : null}
    </div>
  );
}
