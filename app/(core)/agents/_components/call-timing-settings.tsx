import { Slider } from '@/components/ui/slider';

export const CALL_TIMING_MIN_MS = 10000;
export const CALL_TIMING_MAX_MS = 1800000;
export const CALL_TIMING_DEFAULT_MS = 600000;
export const CALL_TIMING_STEP_MS = 1000;

const formatDurationLabel = (ms: number): string => {
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds === 0 ? `${minutes}m` : `${minutes}m ${remainingSeconds}s`;
};

export const normalizeCallTimingMs = (value: number | undefined): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return CALL_TIMING_DEFAULT_MS;
  }
  return Math.max(CALL_TIMING_MIN_MS, Math.min(CALL_TIMING_MAX_MS, value));
};

type TimingSliderFieldProps = {
  label: string;
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
  minLabel?: string;
  maxLabel?: string;
  formatValue?: (value: number) => string;
  onChange: (next: number) => void;
};

export function TimingSliderField({
  label,
  value,
  min = CALL_TIMING_MIN_MS,
  max = CALL_TIMING_MAX_MS,
  step = CALL_TIMING_STEP_MS,
  defaultValue = CALL_TIMING_DEFAULT_MS,
  minLabel = '10s',
  maxLabel = '30m',
  formatValue = formatDurationLabel,
  onChange,
}: TimingSliderFieldProps) {
  const resolvedValue = value ?? defaultValue;

  return (
    <div className="grid gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-white/90">{label}</span>
        <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-sm text-white/85">
          {formatValue(resolvedValue)}
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[resolvedValue]}
        onValueChange={(next) => onChange(next[0] ?? resolvedValue)}
        className="py-1"
      />
      <div className="flex items-center justify-between text-xs text-white/50">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}

type CallTimingSettingsProps = {
  maxCallDurationMs?: number;
  ringTimeOutMs?: number;
  endCallAfterSilenceMs?: number;
  onMaxCallDurationChange: (next: number) => void;
  onRingTimeOutChange: (next: number) => void;
  onEndCallAfterSilenceChange: (next: number) => void;
};

export function CallTimingSettings({
  maxCallDurationMs,
  ringTimeOutMs,
  endCallAfterSilenceMs,
  onMaxCallDurationChange,
  onRingTimeOutChange,
  onEndCallAfterSilenceChange,
}: CallTimingSettingsProps) {
  return (
    <div className="grid gap-4">
      <TimingSliderField
        label="Max call duration"
        value={maxCallDurationMs}
        onChange={onMaxCallDurationChange}
      />
      <TimingSliderField label="Ring timeout" value={ringTimeOutMs} onChange={onRingTimeOutChange} />
      <TimingSliderField
        label="End call on silence"
        value={endCallAfterSilenceMs}
        onChange={onEndCallAfterSilenceChange}
      />
    </div>
  );
}
