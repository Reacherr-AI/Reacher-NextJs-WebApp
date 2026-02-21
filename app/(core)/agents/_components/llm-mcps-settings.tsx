'use client';

import * as React from 'react';
import type { ReacherrLlmDto } from '@/types';
import { Pencil, Plus, Trash2 } from 'lucide-react';

type McpEntry = NonNullable<ReacherrLlmDto['mcps']>[number];

type PairRow = {
  id: string;
  key: string;
  value: string;
};

type McpDraft = {
  name: string;
  url: string;
  timeoutMs: string;
  headers: PairRow[];
  queryParams: PairRow[];
};

const makeRow = (key = '', value = ''): PairRow => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  key,
  value,
});

const recordToRows = (value: unknown): PairRow[] => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [makeRow()];
  const entries = Object.entries(value as Record<string, unknown>).map(([k, v]) =>
    makeRow(k, typeof v === 'string' ? v : String(v ?? ''))
  );
  return entries.length > 0 ? entries : [makeRow()];
};

const rowsToRecord = (rows: PairRow[]): Record<string, string> | undefined => {
  const out: Record<string, string> = {};
  for (const row of rows) {
    const key = row.key.trim();
    if (!key) continue;
    out[key] = row.value;
  }
  return Object.keys(out).length > 0 ? out : undefined;
};

const toDraft = (mcp?: McpEntry): McpDraft => {
  const timeoutRaw =
    typeof mcp?.timeoutMs === 'number'
      ? mcp.timeoutMs
      : typeof mcp?.timeout_ms === 'number'
        ? mcp.timeout_ms
        : 10000;
  return {
    name: typeof mcp?.name === 'string' ? mcp.name : '',
    url: typeof mcp?.url === 'string' ? mcp.url : '',
    timeoutMs: String(timeoutRaw),
    headers: recordToRows(mcp?.headers),
    queryParams: recordToRows(mcp?.queryParams ?? mcp?.query_params),
  };
};

const sanitizeMcpDraft = (draft: McpDraft): { error: string | null; mcp: McpEntry | null } => {
  const name = draft.name.trim();
  const url = draft.url.trim();
  if (!name) return { error: 'MCP name is required.', mcp: null };
  if (!url) return { error: 'MCP URL is required.', mcp: null };
  const timeoutMs = Number(draft.timeoutMs.trim());
  if (!Number.isFinite(timeoutMs) || timeoutMs < 0) {
    return { error: 'Timeout must be a valid non-negative number.', mcp: null };
  }

  const headers = rowsToRecord(draft.headers);
  const queryParams = rowsToRecord(draft.queryParams);

  return {
    error: null,
    mcp: {
      name,
      url,
      timeoutMs: Math.floor(timeoutMs),
      ...(headers ? { headers } : {}),
      ...(queryParams ? { queryParams } : {}),
    },
  };
};

type LlmMcpsSettingsProps = {
  mcps: NonNullable<ReacherrLlmDto['mcps']>;
  saving: boolean;
  dirty: boolean;
  onMcpsChange: (next: NonNullable<ReacherrLlmDto['mcps']>) => void;
  onSave: () => void;
};

export function LlmMcpsSettings({
  mcps,
  saving,
  dirty,
  onMcpsChange,
  onSave,
}: LlmMcpsSettingsProps) {
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  const [draft, setDraft] = React.useState<McpDraft>(toDraft());
  const [formError, setFormError] = React.useState<string | null>(null);

  const openCreate = () => {
    setEditingIndex(null);
    setDraft(toDraft());
    setFormError(null);
    setEditorOpen(true);
  };

  const openEdit = (index: number) => {
    const existing = mcps[index];
    if (!existing) return;
    setEditingIndex(index);
    setDraft(toDraft(existing));
    setFormError(null);
    setEditorOpen(true);
  };

  const removeMcp = (index: number) => {
    onMcpsChange(mcps.filter((_, idx) => idx !== index));
  };

  const updatePair = (
    field: 'headers' | 'queryParams',
    rowId: string,
    next: Partial<Pick<PairRow, 'key' | 'value'>>
  ) => {
    setDraft((prev) => ({
      ...prev,
      [field]: prev[field].map((row) => (row.id === rowId ? { ...row, ...next } : row)),
    }));
  };

  const addPair = (field: 'headers' | 'queryParams') => {
    setDraft((prev) => ({ ...prev, [field]: [...prev[field], makeRow()] }));
  };

  const removePair = (field: 'headers' | 'queryParams', rowId: string) => {
    setDraft((prev) => {
      const next = prev[field].filter((row) => row.id !== rowId);
      return { ...prev, [field]: next.length > 0 ? next : [makeRow()] };
    });
  };

  const saveMcp = () => {
    const { error, mcp } = sanitizeMcpDraft(draft);
    if (error || !mcp) {
      setFormError(error ?? 'Invalid MCP configuration.');
      return;
    }
    const next = [...mcps];
    if (editingIndex === null) next.push(mcp);
    else next.splice(editingIndex, 1, mcp);
    onMcpsChange(next);
    setEditorOpen(false);
  };

  return (
    <div className="grid gap-4">
      <p className="text-sm text-white/60">
        Configure MCP servers for this LLM. MCPs are saved in `llm.mcps` and sent to the LLM update API.
      </p>

      <div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
        >
          <Plus className="size-4" />
          Add MCP
        </button>
      </div>

      {mcps.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-sm text-white/60">
          No MCP servers configured yet.
        </div>
      ) : (
        <div className="grid gap-2">
          {mcps.map((mcp, index) => {
            const timeout =
              typeof mcp.timeoutMs === 'number'
                ? mcp.timeoutMs
                : typeof mcp.timeout_ms === 'number'
                  ? mcp.timeout_ms
                  : undefined;
            return (
              <div
                key={`mcp-${index}-${mcp.name ?? 'unnamed'}`}
                className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white/90">{mcp.name || 'Unnamed MCP'}</p>
                  <p className="truncate text-xs text-white/55">{mcp.url || 'No URL'}</p>
                  <p className="text-[11px] text-white/45">
                    Timeout: {timeout ?? 10000} ms
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(index)}
                    className="rounded-lg border border-white/10 bg-black/40 p-2 text-white/70 transition hover:border-white/20 hover:text-white"
                    aria-label={`Edit ${mcp.name || 'MCP'}`}
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeMcp(index)}
                    className="rounded-lg border border-white/10 bg-black/40 p-2 text-white/70 transition hover:border-white/20 hover:text-white"
                    aria-label={`Delete ${mcp.name || 'MCP'}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-2">
        <button
          type="button"
          onClick={onSave}
          disabled={saving || !dirty}
          className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Saving llm…' : 'Save llm'}
        </button>
      </div>

      {editorOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Add MCP"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setEditorOpen(false);
          }}
        >
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#0c1224] p-6 text-white shadow-[0_50px_160px_rgba(0,0,0,0.55)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xl font-semibold">{editingIndex === null ? 'Add MCP' : 'Edit MCP'}</p>
                <p className="mt-1 text-sm text-white/60">
                  Add the MCP server to your workspace by filling in the fields below.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                className="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <span className="text-xl leading-none">x</span>
              </button>
            </div>

            {formError ? (
              <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {formError}
              </div>
            ) : null}

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-white/85">MCP Name</span>
                <input
                  value={draft.name}
                  onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
                  className="h-12 rounded-2xl border border-white/15 bg-black/35 px-4 text-sm text-white/90 outline-none transition focus:border-white/30"
                  placeholder="Enter the name of the MCP"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-white/85">MCP URL</span>
                <input
                  value={draft.url}
                  onChange={(e) => setDraft((prev) => ({ ...prev, url: e.target.value }))}
                  className="h-12 rounded-2xl border border-white/15 bg-black/35 px-4 text-sm text-white/90 outline-none transition focus:border-white/30"
                  placeholder="Enter the URL of the MCP"
                />
              </label>
            </div>

            <div className="mt-4">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-white/85">Timeout (ms)</span>
                <input
                  value={draft.timeoutMs}
                  onChange={(e) => setDraft((prev) => ({ ...prev, timeoutMs: e.target.value }))}
                  className="h-12 rounded-2xl border border-white/15 bg-black/35 px-4 text-sm text-white/90 outline-none transition focus:border-white/30"
                  placeholder="10000"
                />
              </label>
            </div>

            <div className="mt-6 grid gap-5">
              {(['headers', 'queryParams'] as const).map((field) => (
                <div key={`mcp-field-${field}`} className="grid gap-2">
                  <p className="text-sm font-semibold text-white/85">
                    {field === 'headers' ? 'Headers' : 'Query Parameters'}
                  </p>
                  <div className="grid gap-2">
                    {draft[field].map((row) => (
                      <div key={row.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                        <input
                          value={row.key}
                          onChange={(e) => updatePair(field, row.id, { key: e.target.value })}
                          className="h-12 w-full rounded-xl border border-white/15 bg-black/35 px-4 text-sm text-white/90 outline-none transition focus:border-white/30"
                          placeholder="Key"
                        />
                        <input
                          value={row.value}
                          onChange={(e) => updatePair(field, row.id, { value: e.target.value })}
                          className="h-12 w-full rounded-xl border border-white/15 bg-black/35 px-4 text-sm text-white/90 outline-none transition focus:border-white/30"
                          placeholder="Value"
                        />
                        <button
                          type="button"
                          onClick={() => removePair(field, row.id)}
                          className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/15 bg-black/35 text-white/70 transition hover:bg-white/10 hover:text-white"
                          aria-label="Remove key value pair"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => addPair(field)}
                    className="w-fit rounded-xl border border-white/15 bg-black/35 px-3 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/10"
                  >
                    + New key value pair
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                className="rounded-2xl border border-white/15 bg-black/40 px-4 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveMcp}
                className="rounded-2xl border border-white/15 bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
