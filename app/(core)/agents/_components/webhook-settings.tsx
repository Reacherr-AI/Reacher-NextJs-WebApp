import { TimingSliderField } from './call-timing-settings';

const WEBHOOK_TIMEOUT_MIN_MS = 1000;
const WEBHOOK_TIMEOUT_MAX_MS = 30000;
const WEBHOOK_TIMEOUT_DEFAULT_MS = 15000;

type WebhookSettingsProps = {
  webhookUrl?: string;
  webhookTimeoutMs?: number;
  saving: boolean;
  dirty: boolean;
  onWebhookUrlChange: (value: string) => void;
  onWebhookTimeoutMsChange: (value: number) => void;
  onSave: () => void;
};

export function WebhookSettings({
  webhookUrl,
  webhookTimeoutMs,
  saving,
  dirty,
  onWebhookUrlChange,
  onWebhookTimeoutMsChange,
  onSave,
}: WebhookSettingsProps) {
  const timeoutMs =
    typeof webhookTimeoutMs === 'number' && Number.isFinite(webhookTimeoutMs)
      ? Math.max(WEBHOOK_TIMEOUT_MIN_MS, Math.min(WEBHOOK_TIMEOUT_MAX_MS, webhookTimeoutMs))
      : WEBHOOK_TIMEOUT_DEFAULT_MS;

  return (
    <div className="grid gap-4">
      <label className="grid gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
          Webhook URL
        </span>
        <input
          value={webhookUrl ?? ''}
          onChange={(e) => onWebhookUrlChange(e.target.value)}
          className="h-11 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white/90 outline-none transition focus:border-white/25"
          placeholder="https://example.com/webhook"
        />
      </label>

      <TimingSliderField
        label="Webhook Timeout"
        value={timeoutMs}
        min={WEBHOOK_TIMEOUT_MIN_MS}
        max={WEBHOOK_TIMEOUT_MAX_MS}
        step={1000}
        defaultValue={WEBHOOK_TIMEOUT_DEFAULT_MS}
        minLabel="1s"
        maxLabel="30s"
        formatValue={(value) => `${Math.round(value / 1000)}s`}
        onChange={onWebhookTimeoutMsChange}
      />

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
