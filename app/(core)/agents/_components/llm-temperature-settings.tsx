'use client';

import * as React from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const MIN_TEMPERATURE = 0;
const MAX_TEMPERATURE = 1;
const TEMPERATURE_STEP = 0.01;

const clampTemperature = (value: number): number =>
  Math.max(MIN_TEMPERATURE, Math.min(MAX_TEMPERATURE, value));

type LlmTemperatureSettingsProps = {
  value?: number;
  disabled?: boolean;
  saving?: boolean;
  onSave: (nextTemperature: number) => Promise<void>;
};

export function LlmTemperatureSettings({
  value,
  disabled = false,
  saving = false,
  onSave,
}: LlmTemperatureSettingsProps) {
  const resolvedValue = clampTemperature(typeof value === 'number' ? value : 0);
  const [open, setOpen] = React.useState(false);
  const [draftValue, setDraftValue] = React.useState(resolvedValue);

  React.useEffect(() => {
    if (!open) setDraftValue(resolvedValue);
  }, [open, resolvedValue]);

  return (
    <Popover open={open} onOpenChange={(next) => (!saving ? setOpen(next) : undefined)}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          disabled={disabled}
          variant="outline"
          size="icon"
          className="rounded-xl border-white/15 bg-white/10 text-white/80 hover:bg-white/15 hover:text-white"
          aria-label="Open LLM temperature settings"
        >
          <Settings className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={10}
        className="w-[360px] rounded-2xl border-white/10 bg-black/95 p-4 text-white shadow-[0_26px_80px_rgba(0,0,0,0.55)]"
      >
        <h3 className="text-base font-semibold">LLM Temperature</h3>
        <p className="mt-1 text-sm leading-5 text-white/70">
          Lower value yields better function call results.
        </p>

        <div className="mt-4 grid gap-2">
          <div className="grid grid-cols-[1fr_auto] items-center gap-3">
            <input
              type="range"
              min={MIN_TEMPERATURE}
              max={MAX_TEMPERATURE}
              step={TEMPERATURE_STEP}
              value={draftValue}
              onChange={(e) => setDraftValue(clampTemperature(Number(e.target.value)))}
              className="w-full accent-white"
            />
            <span className="min-w-8 text-right text-md font-medium leading-none">
              {draftValue.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm text-white/45">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>

        <div className="mt-4 border-t border-white/10 pt-4">
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={saving}
              className="rounded-xl border-white/20 bg-transparent px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={async () => {
                await onSave(draftValue);
                setOpen(false);
              }}
              disabled={saving}
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
            >
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
