'use client';

import type { KnowledgeBaseDto } from '@/types';
import { Button } from '@/components/ui/button';

type KnowledgeBaseListPanelProps = {
  knowledgeBases: KnowledgeBaseDto[];
  selectedKnowledgeBaseId: string | null;
  onSelect: (knowledgeBaseId: string) => void;
  onCreateClick: () => void;
};

export function KnowledgeBaseListPanel({
  knowledgeBases,
  selectedKnowledgeBaseId,
  onSelect,
  onCreateClick,
}: KnowledgeBaseListPanelProps) {
  return (
    <section className="flex min-h-[28rem] flex-col rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Knowledge Bases</h2>
        <Button
          type="button"
          onClick={onCreateClick}
          className="h-8 rounded-lg bg-white px-3 text-xs font-semibold text-black hover:bg-white/90"
        >
          + New
        </Button>
      </div>

      {knowledgeBases.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 px-4 py-6 text-center text-sm text-white/60">
          No knowledge bases yet.
        </div>
      ) : (
        <div className="space-y-2 overflow-y-auto pr-1">
          {knowledgeBases.map((kb) => {
            const active = kb.knowledgeBaseId === selectedKnowledgeBaseId;

            return (
              <button
                key={kb.knowledgeBaseId}
                type="button"
                onClick={() => onSelect(kb.knowledgeBaseId)}
                className={[
                  'w-full rounded-xl border px-3 py-3 text-left transition',
                  active
                    ? 'border-white/30 bg-white/15 shadow-[0_14px_50px_rgba(10,12,35,0.5)]'
                    : 'border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/10',
                ].join(' ')}
              >
                <p className="truncate text-sm font-medium">{kb.knowledgeBaseName}</p>
                <p className="mt-1 text-xs text-white/60">{kb.knowledgeBaseSources.length} source(s)</p>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
