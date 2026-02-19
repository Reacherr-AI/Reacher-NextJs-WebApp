import type { StartSpeaker } from '@/types';
import { Switch } from '@/components/ui/switch';

const SLIDER_MIN_SECONDS = 0.2;
const SLIDER_MAX_SECONDS = 19.8;
const SLIDER_STEP_SECONDS = 0.2;
const DEFAULT_DELAY_MS = 10000;

const formatSecondsLabel = (seconds: number): string =>
  Number.isInteger(seconds) ? `${seconds}s` : `${seconds.toFixed(1)}s`;

type BeginMessageSettingsProps = {
  startSpeaker?: StartSpeaker;
  beginMessageDelay?: number;
  beginMessage?: string;
  onStartSpeakerChange: (value: StartSpeaker) => void;
  onBeginMessageDelayChange: (value: number) => void;
  onBeginMessageChange: (value: string | undefined) => void;
};

export function BeginMessageSettings({
  startSpeaker,
  beginMessageDelay,
  beginMessage,
  onStartSpeakerChange,
  onBeginMessageDelayChange,
  onBeginMessageChange,
}: BeginMessageSettingsProps) {
  const resolvedStartSpeaker: StartSpeaker = startSpeaker ?? 'user';
  const rawDelayMs = typeof beginMessageDelay === 'number' && beginMessageDelay >= 0 ? beginMessageDelay : 0;
  const delayMs = Math.min(rawDelayMs, Math.round(SLIDER_MAX_SECONDS * 1000));
  const delaySeconds = delayMs / 1000;
  const sliderSeconds = Math.max(SLIDER_MIN_SECONDS, delaySeconds || 0);
  const isAiAfterSilenceEnabled = resolvedStartSpeaker === 'user' ? delayMs > 0 : true;
  const hasCustomBeginMessage = (beginMessage ?? '').trim().length > 0;
  const messageMode = hasCustomBeginMessage ? 'static' : 'dynamic';

  return (
    <div className="grid gap-3">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">Welcome Message</p>

      <label className="grid gap-2">
        <select
          value={startSpeaker ?? 'user'}
          onChange={(e) => onStartSpeakerChange(e.target.value as StartSpeaker)}
          className="h-11 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white/90 outline-none transition focus:border-white/25"
        >
          <option value="user" className="bg-black text-white">
            User speaks first
          </option>
          <option value="ai" className="bg-black text-white">
            AI speaks first
          </option>
        </select>
      </label>

      {resolvedStartSpeaker === 'user' ? (
        <div className="grid gap-2">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <span className="text-sm font-semibold text-white/90">AI starts speaking after silence</span>
            <Switch
              checked={isAiAfterSilenceEnabled}
              onCheckedChange={(checked) =>
                onBeginMessageDelayChange(checked ? Math.max(delayMs, DEFAULT_DELAY_MS) : 0)
              }
            />
          </div>
          {isAiAfterSilenceEnabled ? (
            <div className="grid gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">AI Entry Timeout</span>
                <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-sm text-white/85">
                  Silence Time: {formatSecondsLabel(delaySeconds)}
                </span>
              </div>
              <input
                type="range"
                min={SLIDER_MIN_SECONDS}
                max={SLIDER_MAX_SECONDS}
                step={SLIDER_STEP_SECONDS}
                value={sliderSeconds}
                onChange={(e) => {
                  const nextSeconds = Number(e.target.value);
                  const safeSeconds = Number.isFinite(nextSeconds)
                    ? Math.max(SLIDER_MIN_SECONDS, Math.min(SLIDER_MAX_SECONDS, nextSeconds))
                    : 0;
                  onBeginMessageDelayChange(Math.round(safeSeconds * 1000));
                }}
                className="w-full accent-white"
              />
            </div>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">Pause Before Speaking</span>
            <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-sm text-white/85">
              Pause Before Speaking: {formatSecondsLabel(delaySeconds)}
            </span>
          </div>
          <input
            type="range"
            min={SLIDER_MIN_SECONDS}
            max={SLIDER_MAX_SECONDS}
            step={SLIDER_STEP_SECONDS}
            value={sliderSeconds}
            onChange={(e) => {
              const nextSeconds = Number(e.target.value);
              const safeSeconds = Number.isFinite(nextSeconds)
                ? Math.max(SLIDER_MIN_SECONDS, Math.min(SLIDER_MAX_SECONDS, nextSeconds))
                : 0;
              onBeginMessageDelayChange(Math.round(safeSeconds * 1000));
            }}
            className="w-full accent-white"
          />
        </div>
      )}

      {(resolvedStartSpeaker === 'ai' || isAiAfterSilenceEnabled) ? (
        <div className="grid gap-2">
          <label className="grid gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">Message Type</span>
            <select
              value={messageMode}
              onChange={(e) => {
                const nextMode = e.target.value;
                if (nextMode === 'dynamic') {
                  onBeginMessageChange(undefined);
                } else if (!hasCustomBeginMessage) {
                  onBeginMessageChange('Hello, how can I help you?');
                }
              }}
              className="h-11 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white/90 outline-none transition focus:border-white/25"
            >
              <option value="static" className="bg-black text-white">
                Static message
              </option>
              <option value="dynamic" className="bg-black text-white">
                Dynamic message based on prompt
              </option>
            </select>
          </label>

          {messageMode === 'static' ? (
            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">Begin Message</span>
              <textarea
                value={beginMessage ?? ''}
                onChange={(e) => onBeginMessageChange(e.target.value)}
                className="min-h-28 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/90 outline-none transition focus:border-white/25"
                placeholder="Hello, how can I help you today?"
              />
            </label>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
