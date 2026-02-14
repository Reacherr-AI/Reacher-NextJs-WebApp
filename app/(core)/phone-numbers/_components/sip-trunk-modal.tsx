'use client';

import * as React from 'react';
import type { TransportType } from '@/types';

type SipTrunkModalProps = {
  open: boolean;
  onClose: () => void;
  outboundTransport: TransportType;
  onOutboundTransportChange: (nextTransport: TransportType) => void;
};

export function SipTrunkModal({
  open,
  onClose,
  outboundTransport,
  onOutboundTransportChange,
}: SipTrunkModalProps) {
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [terminationUri, setTerminationUri] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [nickname, setNickname] = React.useState('');

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Connect number via SIP trunking"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="max-h-[calc(100vh-3rem)] w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(1000px_circle_at_70%_0%,rgba(248,248,248,0.08)_0%,rgba(56,66,218,0.35)_30%,rgba(12,14,55,0.85)_58%,rgba(0,0,0,1)_100%)] text-white shadow-[0_50px_160px_rgba(0,0,0,0.55)]">
        <div className="flex items-start justify-between gap-6 border-b border-white/10 px-7 py-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">
              Phone Numbers
            </p>
            <h3 className="mt-3 text-2xl font-semibold sm:text-3xl">
              Connect via SIP trunking
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            aria-label="Close"
          >
            <span className="text-xl leading-none">×</span>
          </button>
        </div>

        <div className="grid max-h-[calc(100vh-14rem)] gap-6 overflow-y-auto px-7 py-6">
          <div className="space-y-3">
            <Field label="Phone Number">
              <input
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                placeholder="Enter phone number"
                className="h-10 w-full rounded-md border border-white/15 bg-white/5 px-3 text-xs font-medium text-white placeholder:text-white/40"
              />
            </Field>

            <Field label="Termination URI">
              <input
                value={terminationUri}
                onChange={(event) => setTerminationUri(event.target.value)}
                placeholder="Enter termination URI"
                className="h-10 w-full rounded-md border border-white/15 bg-white/5 px-3 text-xs font-medium text-white placeholder:text-white/40"
              />
            </Field>

            <Field label="SIP Trunk Username (Optional)">
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter SIP trunk username"
                className="h-10 w-full rounded-md border border-white/15 bg-white/5 px-3 text-xs font-medium text-white placeholder:text-white/40"
              />
            </Field>

            <Field label="SIP Trunk Password (Optional)">
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter SIP trunk password"
                className="h-10 w-full rounded-md border border-white/15 bg-white/5 px-3 text-xs font-medium text-white placeholder:text-white/40"
              />
            </Field>

            <Field label="Nickname (Optional)">
              <input
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                placeholder="Enter nickname"
                className="h-10 w-full rounded-md border border-white/15 bg-white/5 px-3 text-xs font-medium text-white placeholder:text-white/40"
              />
            </Field>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-white/70">
            <span>Outbound Transport:</span>
            <select
              value={outboundTransport}
              onChange={(event) => onOutboundTransportChange(event.target.value as TransportType)}
              className="h-8 rounded-md border border-white/15 bg-white/5 px-2 text-xs font-semibold text-white"
            >
              <option value="TCP">TCP</option>
              <option value="UDP">UDP</option>
              <option value="TLS">TLS</option>
              <option value="AUTO">AUTO</option>
            </select>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60">
            SIP submit is intentionally disabled in this iteration.
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-white/10 px-7 py-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-full bg-white/30 px-5 py-2.5 text-sm font-semibold text-black/80"
            title="SIP submit is intentionally disabled in this iteration."
          >
            Save (Coming Soon)
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-white/70">{label}</label>
      {children}
    </div>
  );
}
