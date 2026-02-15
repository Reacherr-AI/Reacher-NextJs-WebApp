'use client';

import { useRef, useState } from 'react';
import type { KnowledgeBaseDto, KnowledgeBaseSourceDto } from '@/types';
import { Button } from '@/components/ui/button';
import { AddSourceMenu } from './add-source-menu';
import { AddTextSourceModal } from './add-text-source-modal';
import { AddWebPagesModal } from './add-web-pages-modal';
import type { DraftTextSource, DraftUrlSource } from './types';

type KnowledgeBaseDetailPanelProps = {
  knowledgeBase: KnowledgeBaseDto | null;
  busy: boolean;
  onDeleteKnowledgeBase: (knowledgeBaseId: string) => Promise<void>;
  onDeleteSource: (knowledgeBaseId: string, sourceId: string) => Promise<void>;
  onAddFiles: (knowledgeBaseId: string, files: File[]) => Promise<void>;
  onAddText: (knowledgeBaseId: string, textSource: DraftTextSource) => Promise<void>;
  onAddUrls: (knowledgeBaseId: string, urlSource: DraftUrlSource) => Promise<void>;
};

const fixedDateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
  timeZone: 'UTC',
});

const formatDate = (epochMs: number) => {
  if (!Number.isFinite(epochMs)) return 'Unknown';
  return `${fixedDateFormatter.format(new Date(epochMs))} UTC`;
};

const sourceTitle = (source: KnowledgeBaseSourceDto) =>
  source.filename || source.title || source.url || `Source ${source.sourceId.slice(0, 8)}`;

const sourceMeta = (source: KnowledgeBaseSourceDto) => {
  if (source.type === 'FILE') return source.fileUrl || '';
  if (source.type === 'TEXT') return source.contentUrl || '';
  return source.url || '';
};

export function KnowledgeBaseDetailPanel({
  knowledgeBase,
  busy,
  onDeleteKnowledgeBase,
  onDeleteSource,
  onAddFiles,
  onAddText,
  onAddUrls,
}: KnowledgeBaseDetailPanelProps) {
  const [addTextOpen, setAddTextOpen] = useState(false);
  const [addWebOpen, setAddWebOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const sourceCount = knowledgeBase?.knowledgeBaseSources.length ?? 0;

  if (!knowledgeBase) {
    return (
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex min-h-[24rem] items-center justify-center rounded-2xl border border-dashed border-white/15 bg-black/25 px-6 py-10 text-center text-white/60">
          Select a knowledge base from the left panel to view and manage its sources.
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          event.currentTarget.value = '';

          if (files.length === 0) return;

          void (async () => {
            setActionError(null);
            try {
              await onAddFiles(knowledgeBase.knowledgeBaseId, files);
            } catch (error) {
              setActionError(error instanceof Error ? error.message : 'Unable to add files.');
            }
          })();
        }}
      />

      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h2 className="text-2xl font-semibold">{knowledgeBase.knowledgeBaseName}</h2>
          <p className="mt-2 text-sm text-white/60">Last updated: {formatDate(knowledgeBase.lastUpdatedTime)}</p>
        </div>

        <div className="flex items-center gap-2">
          <AddSourceMenu
            disabled={busy}
            onAddFiles={() => fileInputRef.current?.click()}
            onAddText={() => setAddTextOpen(true)}
            onAddWebPages={() => setAddWebOpen(true)}
          />
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            className="border-red-400/35 bg-red-400/10 text-red-200 hover:bg-red-500/20"
            onClick={() => {
              void (async () => {
                setActionError(null);
                try {
                  await onDeleteKnowledgeBase(knowledgeBase.knowledgeBaseId);
                } catch (error) {
                  setActionError(error instanceof Error ? error.message : 'Unable to delete knowledge base.');
                }
              })();
            }}
          >
            Delete KB
          </Button>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-sm font-medium text-white/80">Sources ({sourceCount})</p>

        {knowledgeBase.knowledgeBaseSources.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-dashed border-white/15 bg-black/20 px-4 py-6 text-sm text-white/60">
            No sources yet. Use the Add button to include files, web pages, or text.
          </div>
        ) : (
          <div className="mt-3 max-h-[32rem] space-y-3 overflow-y-auto pr-1">
            {knowledgeBase.knowledgeBaseSources.map((source) => {
              const meta = sourceMeta(source);

              return (
                <div
                  key={source.sourceId}
                  className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[11px] uppercase tracking-[0.16em] text-white/70">
                        {source.type}
                      </span>
                      <p className="truncate text-sm font-medium">{sourceTitle(source)}</p>
                    </div>

                    {meta ? (
                      source.type === 'URL' ? (
                        <a
                          href={meta}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 block truncate text-xs text-blue-200/90 underline-offset-2 hover:underline"
                        >
                          {meta}
                        </a>
                      ) : (
                        <a
                          href={meta}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 block truncate text-xs text-blue-200/90 underline-offset-2 hover:underline"
                        >
                          Open source asset
                        </a>
                      )
                    ) : (
                      <p className="mt-1 text-xs text-white/50">No source preview URL</p>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={busy}
                    className="border-white/20 bg-transparent text-white/80 hover:bg-white/10"
                    onClick={() => {
                      void (async () => {
                        setActionError(null);
                        try {
                          await onDeleteSource(knowledgeBase.knowledgeBaseId, source.sourceId);
                        } catch (error) {
                          setActionError(error instanceof Error ? error.message : 'Unable to delete source.');
                        }
                      })();
                    }}
                  >
                    Remove
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {actionError ? (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {actionError}
        </div>
      ) : null}

      {addTextOpen ? (
        <AddTextSourceModal
          open={addTextOpen}
          onOpenChange={setAddTextOpen}
          onSave={(source) => {
            void (async () => {
              setActionError(null);
              try {
                await onAddText(knowledgeBase.knowledgeBaseId, source);
              } catch (error) {
                setActionError(error instanceof Error ? error.message : 'Unable to add text source.');
              }
            })();
          }}
        />
      ) : null}

      {addWebOpen ? (
        <AddWebPagesModal
          open={addWebOpen}
          onOpenChange={setAddWebOpen}
          onSave={(source) => {
            void (async () => {
              setActionError(null);
              try {
                await onAddUrls(knowledgeBase.knowledgeBaseId, source);
              } catch (error) {
                setActionError(error instanceof Error ? error.message : 'Unable to add URL sources.');
              }
            })();
          }}
        />
      ) : null}
    </section>
  );
}
