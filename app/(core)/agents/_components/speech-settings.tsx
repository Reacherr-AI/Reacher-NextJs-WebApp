'use client';

import * as React from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';

type SpeechSettingsProps = {
  ambientSound?: string;
  ambientSoundVolume?: number;
  responsiveness?: number;
  interruptionSensitivity?: number;
  reminderTriggerTimeoutMs?: number;
  reminderMaxCount?: number;
  saving: boolean;
  dirty: boolean;
  onAmbientSoundChange: (next: string) => void;
  onAmbientSoundVolumeChange: (next: number) => void;
  onResponsivenessChange: (next: number) => void;
  onInterruptionSensitivityChange: (next: number) => void;
  onReminderTriggerTimeoutMsChange: (next: number) => void;
  onReminderMaxCountChange: (next: number) => void;
  onSave: () => void;
};

const AMBIENT_SOUND_OPTIONS = [
  { value: 'coffee-shop', label: 'Coffee Shop' },
  { value: 'convention-hall', label: 'Convention Hall' },
  { value: 'summer-outdoor', label: 'Summer Outdoor' },
  { value: 'mountain-outdoor', label: 'Mountain Outdoor' },
  { value: 'static-noise', label: 'Static Noise' },
  { value: 'call-center', label: 'Call Center' },
  { value: 'none', label: 'None' },
];

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

export function SpeechSettings({
  ambientSound,
  ambientSoundVolume,
  responsiveness,
  interruptionSensitivity,
  reminderTriggerTimeoutMs,
  reminderMaxCount,
  saving,
  dirty,
  onAmbientSoundChange,
  onAmbientSoundVolumeChange,
  onResponsivenessChange,
  onInterruptionSensitivityChange,
  onReminderTriggerTimeoutMsChange,
  onReminderMaxCountChange,
  onSave,
}: SpeechSettingsProps) {
  const selectedAmbientSound = ambientSound && ambientSound.trim().length > 0 ? ambientSound : 'coffee-shop';
  const selectedAmbientVolume = clamp01(typeof ambientSoundVolume === 'number' ? ambientSoundVolume : 1);
  const selectedResponsiveness = clamp01(typeof responsiveness === 'number' ? responsiveness : 1);
  const selectedInterruptionSensitivity = clamp01(
    typeof interruptionSensitivity === 'number' ? interruptionSensitivity : 1
  );
  const reminderSeconds = Math.max(
    0,
    Math.round((typeof reminderTriggerTimeoutMs === 'number' ? reminderTriggerTimeoutMs : 0) / 1000)
  );
  const reminderTimes = Math.max(0, Math.round(typeof reminderMaxCount === 'number' ? reminderMaxCount : 0));

  return (
    <div className="grid gap-5">
      <div className="grid gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">Background Sound</p>
        <div className="flex items-center gap-3">
          <select
            value={selectedAmbientSound}
            onChange={(e) => onAmbientSoundChange(e.target.value)}
            className="h-10 max-w-[200px] flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 text-xs text-white/90 outline-none transition focus:border-white/25"
          >
            {AMBIENT_SOUND_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="bg-black text-white">
                {option.label}
              </option>
            ))}
          </select>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-xl border-white/15 bg-white/10 text-white/80 hover:bg-white/15 hover:text-white"
                aria-label="Background sound volume settings"
              >
                <Settings className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              side="bottom"
              sideOffset={10}
              className="w-[340px] rounded-2xl border-white/10 bg-black/95 p-4 text-white shadow-[0_26px_80px_rgba(0,0,0,0.55)]"
            >
              <p className="text-sm font-semibold">Background Sound Volume</p>
              <div className="mt-4 flex items-center gap-4">
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={[selectedAmbientVolume]}
                  onValueChange={(value) =>
                    onAmbientSoundVolumeChange(clamp01(value[0] ?? selectedAmbientVolume))
                  }
                  className="w-[80%]"
                />
                <span className="text-sm font-medium">{selectedAmbientVolume.toFixed(2)}</span>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">Responsiveness</p>
        <p className="text-xs text-white/60">
          Control how fast the agent responds after users finish speaking.
        </p>
        <div className="flex items-center gap-4">
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={[selectedResponsiveness]}
            onValueChange={(value) =>
              onResponsivenessChange(clamp01(value[0] ?? selectedResponsiveness))
            }
            className="w-[80%]"
          />
          <span className="text-sm font-medium">{selectedResponsiveness.toFixed(2)}</span>
        </div>
      </div>

      <div className="grid gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">Interruption Sensitivity</p>
        <p className="text-xs text-white/60">
          Control how sensitively AI can be interrupted by human speech.
        </p>
        <div className="flex items-center gap-4">
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={[selectedInterruptionSensitivity]}
            onValueChange={(value) =>
              onInterruptionSensitivityChange(clamp01(value[0] ?? selectedInterruptionSensitivity))
            }
            className="w-[80%]"
          />
          <span className="text-sm font-medium">{selectedInterruptionSensitivity.toFixed(2)}</span>
        </div>
      </div>

      <div className="grid gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">Reminder Message Frequency</p>
        <p className="text-xs text-white/60">Control how often AI will send a reminder message.</p>
        <div className="flex flex-col items-start gap-3">
          <input
            inputMode="numeric"
            min={0}
            value={reminderSeconds}
            onChange={(e) => {
              const next = Math.max(0, Number(e.target.value || 0));
              onReminderTriggerTimeoutMsChange(Math.round(next) * 1000);
            }}
            className="h-10 w-24 rounded-xl border border-white/15 bg-black/35 px-4 text-xs text-white/90 outline-none transition focus:border-white/30"
          />
          <span className="text-xs text-white/70">seconds</span>
          <input
            inputMode="numeric"
            min={0}
            value={reminderTimes}
            onChange={(e) => {
              const next = Math.max(0, Number(e.target.value || 0));
              onReminderMaxCountChange(Math.round(next));
            }}
            className="h-10 w-24 rounded-xl border border-white/15 bg-black/35 px-4 text-xs text-white/90 outline-none transition focus:border-white/30"
          />
          <span className="text-xs text-white/70">times</span>
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
    </div>
  );
}
