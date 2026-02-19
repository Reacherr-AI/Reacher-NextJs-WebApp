import * as React from 'react';
import { CheckCircle2, Hash, ListChecks, Pencil, Plus, Text, Trash2 } from 'lucide-react';
import { KNOWN_POST_CALL_FIELD_TYPES, type KnownPostCallFieldType, type PostCallField } from '@/types';
import { LlmModelSelect } from './llm-model-select';

export type PostCallDraft = PostCallField & { choices?: string[]; examples?: string[] };

const DEFAULT_POST_CALL_ANALYSIS_MODEL = 'gpt-4.1';

const postCallIcon = (type: string) => {
  switch (type) {
    case 'boolean':
      return <CheckCircle2 className="size-5 text-white/70" />;
    case 'enum':
      return <ListChecks className="size-5 text-white/70" />;
    case 'number':
      return <Hash className="size-5 text-white/70" />;
    case 'string':
    default:
      return <Text className="size-5 text-white/70" />;
  }
};

type PostCallSettingsProps = {
  fields: PostCallField[];
  postCallAnalysisModel?: string;
  postCallAnalysisModelOptions: Array<{ label: string; value: string }>;
  saving: boolean;
  dirty: boolean;
  editorOpen: boolean;
  editingIndex: number | null;
  draft: PostCallDraft;
  onOpenCreate: () => void;
  onOpenEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onModelChange: (value: string) => void;
  onSave: () => void;
  onCloseEditor: () => void;
  onDraftChange: React.Dispatch<React.SetStateAction<PostCallDraft>>;
  onSaveField: () => void;
};

export function PostCallSettings({
  fields,
  postCallAnalysisModel,
  postCallAnalysisModelOptions,
  saving,
  dirty,
  editorOpen,
  editingIndex,
  draft,
  onOpenCreate,
  onOpenEdit,
  onDelete,
  onModelChange,
  onSave,
  onCloseEditor,
  onDraftChange,
  onSaveField,
}: PostCallSettingsProps) {
  return (
    <div className="grid gap-5">
      <div>
        <h3 className="text-base font-semibold">Post Call Data Retrieval</h3>
        <p className="mt-2 text-sm text-white/60">
          Define the information you need to extract from the call.
          <span className="text-white/40"> (Learn more)</span>
        </p>
      </div>

      <div className="grid gap-3">
        {fields.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-sm text-white/60">
            No post-call fields yet. Add fields like call summary, success, or tags.
          </div>
        ) : (
          <div className="grid gap-3">
            {fields.map((field, idx) => {
              const title =
                (typeof field.name === 'string' && field.name.trim().length > 0
                  ? field.name.trim()
                  : null) ?? `Field ${idx + 1}`;
              return (
                <div
                  key={`post-call-field-${idx}-${field.type}-${title}`}
                  className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                      {postCallIcon(field.type)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white/90">{title}</p>
                      <p className="truncate text-xs text-white/50">
                        {field.description ? `${field.description}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenEdit(idx)}
                      className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                      aria-label="Edit field"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(idx)}
                      className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                      aria-label="Delete field"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button
          type="button"
          onClick={onOpenCreate}
          className="inline-flex w-fit items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-black/30">
            <Plus className="size-5" />
          </span>
          Add
        </button>
        <div className="max-w-[360px] min-w-[240px]">
          <LlmModelSelect
            value={postCallAnalysisModel ?? DEFAULT_POST_CALL_ANALYSIS_MODEL}
            options={postCallAnalysisModelOptions}
            onValueChange={onModelChange}
            placeholder="Post-call model"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        <button
          type="button"
          onClick={onSave}
          disabled={saving || !dirty}
          className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Saving agent…' : 'Save agent'}
        </button>
      </div>

      {editorOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Edit post-call field"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onCloseEditor();
          }}
        >
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(900px_circle_at_70%_0%,rgba(248,248,248,0.08)_0%,rgba(56,66,218,0.25)_30%,rgba(12,14,55,0.85)_58%,rgba(0,0,0,1)_100%)] text-white shadow-[0_50px_160px_rgba(0,0,0,0.55)]">
            <div className="flex items-start justify-between gap-6 border-b border-white/10 px-7 py-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">
                  Post-Call Field
                </p>
                <h2 className="mt-3 text-2xl font-semibold">
                  {editingIndex === null ? 'Add field' : 'Edit field'}
                </h2>
              </div>
              <button
                type="button"
                className="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                onClick={onCloseEditor}
                aria-label="Close"
              >
                <span className="text-xl leading-none">×</span>
              </button>
            </div>

            <div className="grid gap-5 px-7 py-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                    Type
                  </span>
                  <select
                    value={draft.type}
                    onChange={(e) =>
                      onDraftChange((prev) => ({
                        ...prev,
                        type: e.target.value as KnownPostCallFieldType,
                        choices:
                          e.target.value === 'enum' ? prev.choices : undefined,
                        examples:
                          e.target.value === 'string' ? prev.examples : undefined,
                      }))
                    }
                    className="h-11 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white/90 outline-none transition focus:border-white/25"
                  >
                    {KNOWN_POST_CALL_FIELD_TYPES.map((t) => (
                      <option key={`postcall-type-${t}`} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                    Name
                  </span>
                  <input
                    value={draft.name ?? ''}
                    onChange={(e) =>
                      onDraftChange((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="h-11 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white/90 outline-none transition focus:border-white/25"
                    placeholder="Call Summary"
                  />
                </label>
              </div>

              <label className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                  Description
                </span>
                <textarea
                  value={draft.description ?? ''}
                  onChange={(e) =>
                    onDraftChange((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="min-h-28 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/90 outline-none transition focus:border-white/25"
                  placeholder="What should the model extract?"
                />
              </label>

              {draft.type === 'enum' ? (
                <label className="grid gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                    Choices (one per line)
                  </span>
                  <textarea
                    value={draft.choices?.join('\n') ?? ''}
                    onChange={(e) => {
                      const choices = e.target.value
                        .split('\n')
                        .map((s) => s.trim())
                        .filter(Boolean);
                      onDraftChange((prev) => ({ ...prev, choices, examples: undefined }));
                    }}
                    className="min-h-24 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-xs text-white/85 outline-none transition focus:border-white/25"
                    placeholder="successful\nunsuccessful\nunknown"
                  />
                </label>
              ) : null}

              {draft.type === 'string' ? (
                <label className="grid gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                    Examples (one per line)
                  </span>
                  <textarea
                    value={draft.examples?.join('\n') ?? ''}
                    onChange={(e) => {
                      const examples = e.target.value
                        .split('\n')
                        .map((s) => s.trim())
                        .filter(Boolean);
                      onDraftChange((prev) => ({ ...prev, examples, choices: undefined }));
                    }}
                    className="min-h-24 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-xs text-white/85 outline-none transition focus:border-white/25"
                    placeholder="Customer requested reschedule\nAsked about pricing"
                  />
                </label>
              ) : null}

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onCloseEditor}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onSaveField}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/15 px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_60px_rgba(12,14,55,0.55)] transition hover:bg-white/20"
                >
                  <CheckCircle2 className="size-4" />
                  Save field
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
