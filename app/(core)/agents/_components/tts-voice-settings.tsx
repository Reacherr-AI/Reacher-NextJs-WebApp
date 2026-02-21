'use client';

import * as React from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const MIN_VOICE_SPEED = 0.5;
const MAX_VOICE_SPEED = 2;
const MIN_VOICE_TEMPERATURE = 0;
const MAX_VOICE_TEMPERATURE = 2;
const MIN_VOLUME = 0;
const MAX_VOLUME = 2;
const STEP = 0.01;

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

type TtsVoiceSettingsProps = {
  voiceSpeed: number;
  voiceTemperature: number;
  volume: number;
  disabled?: boolean;
  onSave: (next: { voiceSpeed: number; voiceTemperature: number; volume: number }) => Promise<void> | void;
};

export function TtsVoiceSettings({
  voiceSpeed,
  voiceTemperature,
  volume,
  disabled = false,
  onSave,
}: TtsVoiceSettingsProps) {
  const resolvedSpeed = clamp(voiceSpeed, MIN_VOICE_SPEED, MAX_VOICE_SPEED);
  const resolvedTemperature = clamp(voiceTemperature, MIN_VOICE_TEMPERATURE, MAX_VOICE_TEMPERATURE);
  const resolvedVolume = clamp(volume, MIN_VOLUME, MAX_VOLUME);

  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [draftSpeed, setDraftSpeed] = React.useState(resolvedSpeed);
  const [draftTemperature, setDraftTemperature] = React.useState(resolvedTemperature);
  const [draftVolume, setDraftVolume] = React.useState(resolvedVolume);

  React.useEffect(() => {
    if (!open) {
      setDraftSpeed(resolvedSpeed);
      setDraftTemperature(resolvedTemperature);
      setDraftVolume(resolvedVolume);
    }
  }, [open, resolvedSpeed, resolvedTemperature, resolvedVolume]);

  return (
    <Popover open={open} onOpenChange={(next) => (!saving ? setOpen(next) : undefined)}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          disabled={disabled}
          variant="outline"
          size="icon"
          className="rounded-xl border-white/15 bg-white/10 text-white/80 hover:bg-white/15 hover:text-white"
          aria-label="Open TTS voice settings"
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
        <h3 className="text-base font-semibold">TTS Voice Settings</h3>
        <p className="mt-1 text-sm leading-5 text-white/70">Adjust speed, temperature, and volume for the selected voice.</p>

        <div className="mt-4 grid gap-3">
          <label className="grid gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
              Voice Speed
            </span>
            <div className="grid grid-cols-[1fr_auto] items-center gap-3">
              <input
                type="range"
                min={MIN_VOICE_SPEED}
                max={MAX_VOICE_SPEED}
                step={STEP}
                value={draftSpeed}
                onChange={(e) => setDraftSpeed(clamp(Number(e.target.value), MIN_VOICE_SPEED, MAX_VOICE_SPEED))}
                className="w-full accent-white"
              />
              <span className="min-w-10 text-right text-sm font-medium">{draftSpeed.toFixed(2)}</span>
            </div>
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
              Voice Temperature
            </span>
            <div className="grid grid-cols-[1fr_auto] items-center gap-3">
              <input
                type="range"
                min={MIN_VOICE_TEMPERATURE}
                max={MAX_VOICE_TEMPERATURE}
                step={STEP}
                value={draftTemperature}
                onChange={(e) =>
                  setDraftTemperature(clamp(Number(e.target.value), MIN_VOICE_TEMPERATURE, MAX_VOICE_TEMPERATURE))
                }
                className="w-full accent-white"
              />
              <span className="min-w-10 text-right text-sm font-medium">
                {draftTemperature.toFixed(2)}
              </span>
            </div>
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
              Volume
            </span>
            <div className="grid grid-cols-[1fr_auto] items-center gap-3">
              <input
                type="range"
                min={MIN_VOLUME}
                max={MAX_VOLUME}
                step={STEP}
                value={draftVolume}
                onChange={(e) => setDraftVolume(clamp(Number(e.target.value), MIN_VOLUME, MAX_VOLUME))}
                className="w-full accent-white"
              />
              <span className="min-w-10 text-right text-sm font-medium">{draftVolume.toFixed(2)}</span>
            </div>
          </label>
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
                setSaving(true);
                try {
                  await onSave({
                    voiceSpeed: clamp(draftSpeed, MIN_VOICE_SPEED, MAX_VOICE_SPEED),
                    voiceTemperature: clamp(draftTemperature, MIN_VOICE_TEMPERATURE, MAX_VOICE_TEMPERATURE),
                    volume: clamp(draftVolume, MIN_VOLUME, MAX_VOLUME),
                  });
                  setOpen(false);
                } finally {
                  setSaving(false);
                }
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
