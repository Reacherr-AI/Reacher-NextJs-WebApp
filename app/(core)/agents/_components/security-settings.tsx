'use client';

import { Switch } from '@/components/ui/switch';

type PiiCategoryOption = {
  value: string;
  label: string;
};

type PiiCategoryGroup = {
  title: string;
  items: PiiCategoryOption[];
};

type SecuritySettingsProps = {
  allowUserDtmf: boolean;
  digitLimit?: number;
  terminationKey?: string;
  timeoutMs: number;
  timeoutMinMs: number;
  timeoutMaxMs: number;
  timeoutStepMs: number;
  terminationKeys: readonly string[];
  piiSelectedCategories: string[];
  piiCategoryGroups: PiiCategoryGroup[];
  piiEditorOpen: boolean;
  saving: boolean;
  dirty: boolean;
  onAllowUserDtmfChange: (enabled: boolean) => void;
  onDigitLimitEnabledChange: (enabled: boolean) => void;
  onDigitLimitChange: (value: number) => void;
  onTerminationKeyEnabledChange: (enabled: boolean) => void;
  onTerminationKeyChange: (value: string) => void;
  onTimeoutMsChange: (value: number) => void;
  onEnsurePiiMode: () => void;
  onOpenPiiEditor: () => void;
  onClosePiiEditor: () => void;
  onTogglePiiCategory: (category: string, checked: boolean) => void;
  onSave: () => void;
};

export function SecuritySettings({
  allowUserDtmf,
  digitLimit,
  terminationKey,
  timeoutMs,
  timeoutMinMs,
  timeoutMaxMs,
  timeoutStepMs,
  terminationKeys,
  piiSelectedCategories,
  piiCategoryGroups,
  piiEditorOpen,
  saving,
  dirty,
  onAllowUserDtmfChange,
  onDigitLimitEnabledChange,
  onDigitLimitChange,
  onTerminationKeyEnabledChange,
  onTerminationKeyChange,
  onTimeoutMsChange,
  onEnsurePiiMode,
  onOpenPiiEditor,
  onClosePiiEditor,
  onTogglePiiCategory,
  onSave,
}: SecuritySettingsProps) {
  const isDigitLimitEnabled = typeof digitLimit === 'number';
  const isTerminationEnabled = Boolean((terminationKey ?? '').trim());

  return (
    <div className="grid gap-5">
      <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
        <span className="text-sm font-semibold">Allow User DTMF</span>
        <Switch
          checked={allowUserDtmf}
          onCheckedChange={(checked) => onAllowUserDtmfChange(Boolean(checked))}
          aria-label="Allow User DTMF"
        />
      </label>

      <div className="grid gap-4">
        <label className="grid gap-2">
          <span className="text-base font-semibold text-white/90">Digit Limit</span>
          <p className="text-xs text-white/65">
            The AI responds immediately after the caller enters the configured number of digits.
          </p>
          <div className="mt-1">
            <Switch
              disabled={!allowUserDtmf}
              checked={isDigitLimitEnabled}
              onCheckedChange={(checked) => onDigitLimitEnabledChange(Boolean(checked))}
              aria-label="Enable digit limit"
            />
          </div>
          {isDigitLimitEnabled ? (
            <div className="mt-2 flex h-14 items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-6">
              <button
                type="button"
                disabled={!allowUserDtmf || (digitLimit ?? 1) <= 1}
                onClick={() => onDigitLimitChange(Math.max(1, (digitLimit ?? 10) - 1))}
                className="text-xl leading-none text-white/70 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Decrease digit limit"
              >
                −
              </button>
              <span className="text-base font-semibold text-white/95">{digitLimit}</span>
              <button
                type="button"
                disabled={!allowUserDtmf || (digitLimit ?? 50) >= 50}
                onClick={() => onDigitLimitChange(Math.min(50, (digitLimit ?? 10) + 1))}
                className="text-xl leading-none text-white/70 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Increase digit limit"
              >
                +
              </button>
            </div>
          ) : null}
        </label>

        <label className="grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
            Termination Key
          </span>
          <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-white/65">
                The agent will respond when user presses a configured key.
              </p>
              <Switch
                disabled={!allowUserDtmf}
                checked={isTerminationEnabled}
                onCheckedChange={(checked) => onTerminationKeyEnabledChange(Boolean(checked))}
                aria-label="Enable termination key"
              />
            </div>

            {isTerminationEnabled ? (
              <select
                disabled={!allowUserDtmf}
                value={(terminationKey ?? '#').trim() || '#'}
                onChange={(e) => onTerminationKeyChange(e.target.value)}
                className="mt-3 h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-sm text-white/90 outline-none transition focus:border-white/25 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {terminationKeys.map((key) => (
                  <option key={`dtmf-termination-${key}`} value={key} className="bg-black text-white">
                    {key}
                  </option>
                ))}
              </select>
            ) : null}
          </div>
        </label>

        <label className="grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
            Timeout ({(timeoutMs / 1000).toFixed(1)}s)
          </span>
          <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
            <input
              type="range"
              min={timeoutMinMs}
              max={timeoutMaxMs}
              step={timeoutStepMs}
              disabled={!allowUserDtmf}
              value={timeoutMs}
              onChange={(e) => onTimeoutMsChange(Number(e.target.value))}
              className="w-full accent-white disabled:cursor-not-allowed disabled:opacity-40"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-white/50">
              <span>1.0s</span>
              <span>10.0s</span>
            </div>
          </div>
        </label>
      </div>

      <label className="grid gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">PII Mode</span>
        <select
          value="POST_CALL"
          onChange={onEnsurePiiMode}
          className="h-11 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white/90 outline-none transition focus:border-white/25"
        >
          <option value="POST_CALL">POST_CALL</option>
        </select>
      </label>

      <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Personal Info Redaction (PII)</p>
            <p className="mt-1 text-xs text-white/55">Select sensitive categories to redact.</p>
          </div>
          <button
            type="button"
            onClick={onOpenPiiEditor}
            className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
          >
            Set up
          </button>
        </div>
        <p className="mt-3 text-xs text-white/60">
          {piiSelectedCategories.length > 0
            ? `${piiSelectedCategories.length} categories selected`
            : 'No categories selected'}
        </p>
      </div>

      {piiEditorOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Set PII categories"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClosePiiEditor();
          }}
        >
          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-black p-6 text-white shadow-[0_50px_160px_rgba(0,0,0,0.55)]">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold">Set PII Categories</h3>
              <button
                type="button"
                onClick={onClosePiiEditor}
                className="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <span className="text-xl leading-none">×</span>
              </button>
            </div>

            <div className="mt-4 grid max-h-[60vh] gap-4 overflow-y-auto pr-1">
              {piiCategoryGroups.map((group) => (
                <div key={`pii-group-${group.title}`} className="grid gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">{group.title}</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {group.items.map((item) => (
                      <label
                        key={`pii-category-${item.value}`}
                        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={piiSelectedCategories.includes(item.value)}
                          onChange={(e) => onTogglePiiCategory(item.value, e.target.checked)}
                          className="h-4 w-4"
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={onClosePiiEditor}
                className="rounded-2xl border border-white/15 bg-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      ) : null}

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
    </div>
  );
}
