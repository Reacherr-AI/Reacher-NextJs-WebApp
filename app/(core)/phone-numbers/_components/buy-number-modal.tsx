'use client';

import type { TransportType } from '@/types';
import { cn } from '@/lib/utils';
import { AvailableNumberSkeleton } from './available-number-skeleton';

export type ListedAvailableNumber = {
  id: string;
  number: string;
};

type BuyNumberModalProps = {
  open: boolean;
  onClose: () => void;
  numberType: 'standard' | 'tollfree';
  onNumberTypeChange: (nextType: 'standard' | 'tollfree') => void;
  outboundTransport: TransportType;
  onOutboundTransportChange: (nextTransport: TransportType) => void;
  availableNumbers: ListedAvailableNumber[];
  availableError: string | null;
  isLoadingAvailable: boolean;
  isLoadingMore: boolean;
  buyingNumberId: string | null;
  availableListRef: React.RefObject<HTMLDivElement | null>;
  onAvailableScroll: () => void;
  onBuyNumber: (numberId: string) => void;
};

export function BuyNumberModal({
  open,
  onClose,
  numberType,
  onNumberTypeChange,
  outboundTransport,
  onOutboundTransportChange,
  availableNumbers,
  availableError,
  isLoadingAvailable,
  isLoadingMore,
  buyingNumberId,
  availableListRef,
  onAvailableScroll,
  onBuyNumber,
}: BuyNumberModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Buy phone number"
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
            <h3 className="mt-3 text-2xl font-semibold sm:text-3xl">Buy Phone Number</h3>
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
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
              Number Type
            </p>
            <div className="mt-4 flex items-center gap-6 text-xs font-semibold text-white/70">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="numberType"
                  checked={numberType === 'standard'}
                  onChange={() => onNumberTypeChange('standard')}
                />
                <span>Standard ($2/month)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="numberType"
                  checked={numberType === 'tollfree'}
                  onChange={() => onNumberTypeChange('tollfree')}
                />
                <span>Toll-free ($5/month)</span>
              </label>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
              Available Numbers
            </p>
            <div
              ref={availableListRef}
              onScroll={onAvailableScroll}
              className="mt-3 max-h-[320px] space-y-2 overflow-y-auto rounded-2xl border border-white/10 bg-black/30 p-3"
            >
              {isLoadingAvailable ? (
                <AvailableNumberSkeleton count={5} />
              ) : availableError ? (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                  {availableError}
                </div>
              ) : availableNumbers.length === 0 ? (
                <div className="text-xs font-medium text-white/60">No numbers found.</div>
              ) : (
                <>
                  {availableNumbers.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                    >
                      <div>
                        <div className="text-xs font-semibold text-white">{item.number}</div>
                        <div className="text-[11px] font-medium text-white/60">
                          {numberType === 'tollfree' ? '$5/month' : '$2/month'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onBuyNumber(item.id)}
                        disabled={buyingNumberId === item.id}
                        className={cn(
                          'rounded-full border border-white/15 bg-white/5 px-3 py-2 text-[10px] font-semibold text-white/80 hover:bg-white/10',
                          buyingNumberId === item.id && 'cursor-not-allowed opacity-60'
                        )}
                      >
                        {buyingNumberId === item.id ? 'Creating...' : 'Buy number'}
                      </button>
                    </div>
                  ))}
                  {isLoadingMore ? <AvailableNumberSkeleton count={2} /> : null}
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-white/70">
            <span>Outbound Transport:</span>
            <select
              value={outboundTransport}
              onChange={(event) => onOutboundTransportChange(event.target.value as TransportType)}
              className="h-8 rounded-md border border-white/15 bg-black px-2 text-xs font-semibold text-white"
            >
              <option value="TCP">TCP</option>
              <option value="UDP">UDP</option>
              <option value="TLS">TLS</option>
              <option value="AUTO">AUTO</option>
            </select>
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
            onClick={onClose}
            className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-[0_18px_50px_rgba(16,20,64,0.35)] transition hover:bg-white/90"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
