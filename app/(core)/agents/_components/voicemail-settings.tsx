'use client';

import { Switch } from '@/components/ui/switch';

type VoiceMailActionType = 'hangup' | 'prompt' | 'static_text';

type VoicemailSettingsProps = {
  enabled: boolean;
  optionType?: VoiceMailActionType;
  text?: string;
  ivrHangupEnabled: boolean;
  saving: boolean;
  dirty: boolean;
  onEnabledChange: (enabled: boolean) => void;
  onOptionTypeChange: (nextType: VoiceMailActionType) => void;
  onTextChange: (text: string) => void;
  onIvrHangupEnabledChange: (enabled: boolean) => void;
  onSave: () => void;
};

export function VoicemailSettings({
  enabled,
  optionType,
  text,
  ivrHangupEnabled,
  saving,
  dirty,
  onEnabledChange,
  onOptionTypeChange,
  onTextChange,
  onIvrHangupEnabledChange,
  onSave,
}: VoicemailSettingsProps) {
  const resolvedType: VoiceMailActionType = optionType ?? 'hangup';
  const isLeaveMessage = resolvedType === 'prompt' || resolvedType === 'static_text';

  return (
    <div className="grid gap-5">
      <div className="grid gap-2">
        <h3 className="text-lg font-semibold text-white/95">Voicemail Detection</h3>
        <p className="max-w-3xl text-sm leading-6 text-white/65">
          Hang up or leave a voicemail if a voicemail is detected.
        </p>
        <Switch checked={enabled} onCheckedChange={onEnabledChange} />
      </div>

      {enabled ? (
        <div className="rounded-3xl border border-white/10 bg-[#040c1d] p-5">
          <h4 className="text-base font-semibold text-white/95">Voicemail Response</h4>

          <div className="mt-4 grid gap-4">
            <label className="flex cursor-pointer items-start gap-3 text-white/70">
              <input
                type="radio"
                name="vm-response"
                checked={resolvedType === 'hangup'}
                onChange={() => onOptionTypeChange('hangup')}
                className="mt-1 h-5 w-5 accent-white"
              />
              <span className="text-sm leading-6">Hang up if reaching voicemail</span>
            </label>

            <label className="flex cursor-pointer items-start gap-3 text-white/70">
              <input
                type="radio"
                name="vm-response"
                checked={isLeaveMessage}
                onChange={() => onOptionTypeChange('static_text')}
                className="mt-1 h-5 w-5 accent-white"
              />
              <span className="text-sm leading-6">Leave a message if reaching voicemail</span>
            </label>
          </div>

          {isLeaveMessage ? (
            <>
              <div className="mt-5 inline-flex rounded-2xl bg-white/15 p-1">
                <button
                  type="button"
                  onClick={() => onOptionTypeChange('prompt')}
                  className={[
                    'rounded-xl px-4 py-2 text-sm leading-none transition',
                    resolvedType === 'prompt' ? 'bg-black text-white' : 'text-white/65 hover:text-white/90',
                  ].join(' ')}
                >
                  Prompt
                </button>
                <button
                  type="button"
                  onClick={() => onOptionTypeChange('static_text')}
                  className={[
                    'rounded-xl px-4 py-2 text-sm leading-none transition',
                    resolvedType === 'static_text' ? 'bg-black text-white' : 'text-white/65 hover:text-white/90',
                  ].join(' ')}
                >
                  Static Sentence
                </button>
              </div>

              <textarea
                value={text ?? ''}
                onChange={(e) => onTextChange(e.target.value)}
                className="mt-4 min-h-32 w-full rounded-2xl border border-white/20 bg-[#141a2d] px-4 py-3 text-sm leading-6 text-white/95 outline-none transition focus:border-white/40"
                placeholder="Hey {{user_name}}, sorry we could not reach you directly. Please give us a callback if you can."
              />
            </>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-2">
        <h4 className="text-lg font-semibold text-white/95">IVR Hangup</h4>
        <p className="max-w-3xl text-sm leading-6 text-white/65">
          Hang up if an IVR system is detected in the first 3 minutes.
        </p>
        <Switch checked={ivrHangupEnabled} onCheckedChange={onIvrHangupEnabledChange} />
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
