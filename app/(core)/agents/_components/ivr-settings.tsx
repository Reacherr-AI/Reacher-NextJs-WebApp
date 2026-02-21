'use client';

import { Switch } from '@/components/ui/switch';

type IvrSettingsProps = {
  ivrHangupEnabled: boolean;
  onIvrHangupEnabledChange: (enabled: boolean) => void;
};

export function IvrSettings({
  ivrHangupEnabled,
  onIvrHangupEnabledChange,
}: IvrSettingsProps) {
  return (
    <div className="grid gap-2">
      <h4 className="text-lg font-semibold text-white/95">IVR Hangup</h4>
      <p className="max-w-3xl text-sm leading-6 text-white/65">
        Hang up if an IVR system is detected in the first 3 minutes.
      </p>
      <Switch checked={ivrHangupEnabled} onCheckedChange={onIvrHangupEnabledChange} />
    </div>
  );
}
