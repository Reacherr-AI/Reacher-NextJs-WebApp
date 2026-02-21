'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2 } from 'lucide-react';

type DynamicVariablesSettingsProps = {
  variables?: Record<string, string>;
  disabled?: boolean;
  onSave: (nextVariables: Record<string, string>) => void;
};

type DynamicVariableRow = {
  id: string;
  name: string;
  value: string;
};

const toRows = (variables: Record<string, string> | undefined): DynamicVariableRow[] =>
  Object.entries(variables ?? {}).map(([name, value], index) => ({
    id: `dynamic-var-${index}-${name}`,
    name,
    value: String(value ?? ''),
  }));

const toRecord = (rows: DynamicVariableRow[]): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const row of rows) {
    const key = row.name.trim();
    if (!key) continue;
    out[key] = row.value;
  }
  return out;
};

const createRow = (): DynamicVariableRow => ({
  id: `dynamic-var-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name: '',
  value: '',
});

export function DynamicVariablesSettings({
  variables,
  disabled = false,
  onSave,
}: DynamicVariablesSettingsProps) {
  const [open, setOpen] = React.useState(false);
  const [rows, setRows] = React.useState<DynamicVariableRow[]>([]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      const initialRows = toRows(variables);
      setRows(initialRows.length > 0 ? initialRows : [createRow()]);
    }
    setOpen(nextOpen);
  };

  const updateRow = (id: string, field: 'name' | 'value', nextValue: string) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: nextValue } : row))
    );
  };

  const removeRow = (id: string) => {
    setRows((prev) => {
      const next = prev.filter((row) => row.id !== id);
      return next.length > 0 ? next : [createRow()];
    });
  };

  const applySave = () => {
    onSave(toRecord(rows));
    setOpen(false);
  };

  return (
    <div className="grid gap-3">
      <button
        type="button"
        disabled={disabled}
        onClick={() => handleOpenChange(true)}
        className="inline-flex w-fit items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Set Dynamic Variables
      </button>
      {disabled ? (
        <p className="text-xs text-white/55">Link a Reacherr LLM to configure dynamic variables.</p>
      ) : null}

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-[radial-gradient(900px_circle_at_70%_0%,rgba(248,248,248,0.08)_0%,rgba(56,66,218,0.25)_30%,rgba(12,14,55,0.85)_58%,rgba(0,0,0,1)_100%)] p-0 text-white shadow-[0_50px_160px_rgba(0,0,0,0.55)] sm:max-w-[1000px]"
        >
          <div className="px-7 py-6">
            <div className="border-b border-white/10 pb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">
                LLM Tests
              </p>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-white">
                Dynamic Variables
              </p>
            </div>

            <div className="mt-6 grid gap-5">
              <p className="text-sm font-medium text-white/65">
                Set dynamic variables for dashboard audio and llm tests
              </p>

              <div className="rounded-2xl border border-white/10 bg-black/30">
                <div className="overflow-x-auto">
                  <div className="min-w-[680px]">
                    <div className="grid grid-cols-[1fr_1fr_56px] border-b border-white/10 rounded-t-2xl bg-[#041028] px-4 py-3 text-base font-medium text-white/65">
                      <span>Variable Name</span>
                      <span>Test Value</span>
                      <span />
                    </div>

                    <div className="grid gap-3 p-4">
                      {rows.map((row) => (
                        <div key={row.id} className="grid grid-cols-[1fr_1fr_56px] items-center gap-3">
                          <input
                            value={row.name}
                            onChange={(e) => updateRow(row.id, 'name', e.target.value)}
                            placeholder="Enter the variable name"
                            className="h-14 rounded-2xl border border-white/10 bg-black/30 px-5 text-base text-white/90 outline-none transition focus:border-white/25"
                          />
                          <input
                            value={row.value}
                            onChange={(e) => updateRow(row.id, 'value', e.target.value)}
                            placeholder="Enter the value"
                            className="h-14 rounded-2xl border border-white/10 bg-black/30 px-5 text-base text-white/90 outline-none transition focus:border-white/25"
                          />
                          <button
                            type="button"
                            onClick={() => removeRow(row.id)}
                            className="inline-flex size-12 items-center justify-center rounded-xl border border-transparent text-white/80 transition hover:border-white/10 hover:bg-white/5 hover:text-white"
                            aria-label="Remove variable row"
                          >
                            <Trash2 className="size-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="px-4 pb-5">
                  <button
                    type="button"
                    onClick={() => setRows((prev) => [...prev, createRow()])}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
                  >
                    <Plus className="size-4" />
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-end gap-3 border-t border-white/10 pt-6">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-2xl border border-white/15 bg-black/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applySave}
                className="rounded-2xl border border-white/20 bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                Save
              </button>
            </div>
          </div>
          <DialogTitle className="sr-only">Dynamic Variables</DialogTitle>
        </DialogContent>
      </Dialog>
    </div>
  );
}
