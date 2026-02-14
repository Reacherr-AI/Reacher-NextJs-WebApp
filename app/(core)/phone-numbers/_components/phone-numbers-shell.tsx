'use client';

import * as React from 'react';
import type {
  AvailableNumberRequestDto,
  CountryCode,
  PhoneNumberRequestDto,
  PhoneNumberResposneDto,
  PhoneNumberType,
  TransportType,
} from '@/types';
import { cn } from '@/lib/utils';
import { BuyNumberModal, type ListedAvailableNumber } from './buy-number-modal';
import { SipTrunkModal } from './sip-trunk-modal';
import { formatProviderLabel } from '../_lib/phone-number-format';
import type { AgentOption } from '../_lib/phone-number-guards';
import { isPhoneNumberResponseDto } from '../_lib/phone-number-guards';

type PhoneNumbersShellProps = {
  initialOwnedNumbers: PhoneNumberResposneDto[];
  initialOwnedError: string | null;
  initialAgents: AgentOption[];
  initialAgentsError: string | null;
};

type AvailableNumbersResponse = {
  numbers: string[];
  last: boolean;
};

type NumberType = 'standard' | 'tollfree';
type LocalPhoneNumber = Omit<PhoneNumberResposneDto, 'inboundAgentId' | 'outboundAgentId'> & {
  inboundAgentId?: string | null;
  outboundAgentId?: string | null;
};

const PROVIDER: PhoneNumberType = 'TWILIO';
const DEFAULT_COUNTRY: CountryCode = 'US';
const AVAILABLE_PAGE_SIZE = 5;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const parseAvailableNumbersResponse = (value: unknown): AvailableNumbersResponse => {
  if (!isRecord(value)) return { numbers: [], last: true };

  const numbers = Array.isArray(value.numbers)
    ? value.numbers.filter((number): number is string => typeof number === 'string')
    : [];
  const last = typeof value.last === 'boolean' ? value.last : true;

  return { numbers, last };
};

const getErrorMessage = (value: unknown, fallback: string) => {
  if (isRecord(value) && typeof value.message === 'string' && value.message.trim().length > 0) {
    return value.message;
  }
  return fallback;
};

const toAvailableList = (numbers: string[]): ListedAvailableNumber[] =>
  numbers.map((number) => ({ id: number, number }));

export function PhoneNumbersShell({
  initialOwnedNumbers,
  initialOwnedError,
  initialAgents,
  initialAgentsError,
}: PhoneNumbersShellProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [ownedNumbers, setOwnedNumbers] = React.useState<LocalPhoneNumber[]>(initialOwnedNumbers);
  const [selectedNumberId, setSelectedNumberId] = React.useState<string | null>(
    initialOwnedNumbers[0]?.phoneNumber ?? null
  );

  const [buyOpen, setBuyOpen] = React.useState(false);
  const [sipOpen, setSipOpen] = React.useState(false);

  const [numberType, setNumberType] = React.useState<NumberType>('standard');
  const [outboundTransport, setOutboundTransport] = React.useState<TransportType>('TCP');

  const [availableNumbers, setAvailableNumbers] = React.useState<ListedAvailableNumber[]>([]);
  const [availablePage, setAvailablePage] = React.useState(0);
  const [availableLast, setAvailableLast] = React.useState(true);
  const [isLoadingAvailable, setIsLoadingAvailable] = React.useState(false);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [availableError, setAvailableError] = React.useState<string | null>(null);
  const [buyingNumberId, setBuyingNumberId] = React.useState<string | null>(null);

  const [ownedError, setOwnedError] = React.useState<string | null>(initialOwnedError);
  const [agentsError] = React.useState<string | null>(initialAgentsError);
  const [updateError, setUpdateError] = React.useState<string | null>(null);
  const [isUpdatingNumber, setIsUpdatingNumber] = React.useState(false);

  const availableListRef = React.useRef<HTMLDivElement | null>(null);

  const filteredNumbers = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return ownedNumbers;
    return ownedNumbers.filter((item) => (item.phoneNumber ?? '').toLowerCase().includes(query));
  }, [ownedNumbers, searchQuery]);

  const selectedNumber = React.useMemo(() => {
    if (ownedNumbers.length === 0) return null;
    return (
      ownedNumbers.find(
        (item) =>
          item.phoneNumber !== undefined &&
          item.phoneNumber === selectedNumberId
      ) ?? ownedNumbers[0]
    );
  }, [ownedNumbers, selectedNumberId]);

  React.useEffect(() => {
    if (ownedNumbers.length === 0) {
      setSelectedNumberId(null);
      return;
    }

    const exists = ownedNumbers.some((item) => item.phoneNumber === selectedNumberId);
    if (!exists) {
      setSelectedNumberId(ownedNumbers[0]?.phoneNumber ?? null);
    }
  }, [ownedNumbers, selectedNumberId]);

  const loadAvailableNumbers = React.useCallback(
    async (page: number, append: boolean) => {
      if (!append) {
        setAvailableNumbers([]);
        setAvailablePage(0);
        setAvailableLast(true);
      }

      setIsLoadingAvailable(true);
      setAvailableError(null);

      const payload: AvailableNumberRequestDto = {
        countryCode: DEFAULT_COUNTRY,
        provider: PROVIDER,
        isTollFree: numberType === 'tollfree',
      };

      try {
        const res = await fetch(
          `/api/phone-numbers/available?page=${encodeURIComponent(page)}&size=${encodeURIComponent(
            AVAILABLE_PAGE_SIZE
          )}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify(payload),
            cache: 'no-store',
          }
        );

        const data = (await res.json().catch(() => null)) as unknown;

        if (!res.ok) {
          throw new Error(getErrorMessage(data, 'Unable to load available numbers.'));
        }

        const parsed = parseAvailableNumbersResponse(data);
        const next = toAvailableList(parsed.numbers);

        setAvailableNumbers((prev) => (append ? [...prev, ...next] : next));
        setAvailableLast(parsed.last);
        setAvailablePage(page);
      } catch (error) {
        setAvailableError(error instanceof Error ? error.message : 'Unable to load available numbers.');
      } finally {
        setIsLoadingAvailable(false);
      }
    },
    [numberType]
  );

  React.useEffect(() => {
    if (!buyOpen) return;
    void loadAvailableNumbers(0, false);
  }, [buyOpen, numberType, loadAvailableNumbers]);

  const handleLoadMoreAvailable = React.useCallback(async () => {
    if (isLoadingAvailable || isLoadingMore || availableLast) return;

    setIsLoadingMore(true);
    setAvailableError(null);

    const payload: AvailableNumberRequestDto = {
      countryCode: DEFAULT_COUNTRY,
      provider: PROVIDER,
      isTollFree: numberType === 'tollfree',
    };

    const nextPage = availablePage + 1;

    try {
      const res = await fetch(
        `/api/phone-numbers/available?page=${encodeURIComponent(nextPage)}&size=${encodeURIComponent(
          AVAILABLE_PAGE_SIZE
        )}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(payload),
          cache: 'no-store',
        }
      );

      const data = (await res.json().catch(() => null)) as unknown;

      if (!res.ok) {
        throw new Error(getErrorMessage(data, 'Unable to load available numbers.'));
      }

      const parsed = parseAvailableNumbersResponse(data);
      const next = toAvailableList(parsed.numbers);

      setAvailableNumbers((prev) => [...prev, ...next]);
      setAvailableLast(parsed.last);
      setAvailablePage(nextPage);
    } catch (error) {
      setAvailableError(error instanceof Error ? error.message : 'Unable to load available numbers.');
    } finally {
      setIsLoadingMore(false);
    }
  }, [availableLast, availablePage, isLoadingAvailable, isLoadingMore, numberType]);

  const handleAvailableScroll = React.useCallback(() => {
    const el = availableListRef.current;
    if (!el || isLoadingAvailable || isLoadingMore || availableLast) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (nearBottom) void handleLoadMoreAvailable();
  }, [availableLast, handleLoadMoreAvailable, isLoadingAvailable, isLoadingMore]);

  React.useEffect(() => {
    const el = availableListRef.current;
    if (!el || isLoadingAvailable || isLoadingMore || availableLast) return;
    const needsMore = el.scrollHeight <= el.clientHeight + 8;
    if (needsMore) void handleLoadMoreAvailable();
  }, [availableNumbers, availableLast, handleLoadMoreAvailable, isLoadingAvailable, isLoadingMore]);

  const handleBuyNumber = React.useCallback(
    async (numberId: string) => {
      const selected = availableNumbers.find((item) => item.id === numberId);
      if (!selected || buyingNumberId) return;

      setBuyingNumberId(numberId);
      setAvailableError(null);

      const payload: PhoneNumberRequestDto = {
        phoneNumber: selected.number,
        phoneNumberType: PROVIDER,
        countryCode: DEFAULT_COUNTRY,
        isTollFree: numberType === 'tollfree',
      };

      try {
        const res = await fetch('/api/phone-numbers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(payload),
          cache: 'no-store',
        });
        const data = (await res.json().catch(() => null)) as unknown;

        if (!res.ok) {
          throw new Error(getErrorMessage(data, 'Unable to purchase this number.'));
        }

        if (!isPhoneNumberResponseDto(data) || !data.phoneNumber) {
          throw new Error('Unexpected create response.');
        }

        setAvailableNumbers((prev) => prev.filter((item) => item.id !== numberId));
        setOwnedNumbers((prev) => [data, ...prev]);
        setSelectedNumberId(data.phoneNumber);
        setOwnedError(null);
        setBuyOpen(false);
      } catch (error) {
        setAvailableError(error instanceof Error ? error.message : 'Unable to purchase this number.');
      } finally {
        setBuyingNumberId(null);
      }
    },
    [availableNumbers, buyingNumberId, numberType]
  );

  const handleUpdateNumber = React.useCallback(
    async (
      phoneNumber: string,
      updates: {
        inboundAgentId?: string | null;
        outboundAgentId?: string | null;
      }
    ) => {
      if (isUpdatingNumber) return;

      const current = ownedNumbers.find((item) => item.phoneNumber === phoneNumber);
      if (!current) return;

      setIsUpdatingNumber(true);
      setUpdateError(null);

      const optimistic: LocalPhoneNumber = {
        ...current,
        ...updates,
      };

      setOwnedNumbers((prev) =>
        prev.map((item) => (item.phoneNumber === phoneNumber ? optimistic : item))
      );

      try {
        const res = await fetch(`/api/phone-numbers/${encodeURIComponent(phoneNumber)}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(updates),
          cache: 'no-store',
        });
        const data = (await res.json().catch(() => null)) as unknown;

        if (!res.ok) {
          throw new Error(getErrorMessage(data, 'Unable to update phone number.'));
        }

        if (!isPhoneNumberResponseDto(data) || !data.phoneNumber) {
          throw new Error('Unexpected update response.');
        }

        setOwnedNumbers((prev) =>
          prev.map((item) => (item.phoneNumber === phoneNumber ? data : item))
        );
      } catch (error) {
        setOwnedNumbers((prev) =>
          prev.map((item) => (item.phoneNumber === phoneNumber ? current : item))
        );
        setUpdateError(error instanceof Error ? error.message : 'Unable to update phone number.');
      } finally {
        setIsUpdatingNumber(false);
      }
    },
    [isUpdatingNumber, ownedNumbers]
  );

  return (
    <>
      <div className="grid min-h-[640px] gap-5 lg:grid-cols-[340px_1fr]">
        <section className="rounded-3xl border border-white/10 bg-white/5 shadow-[0_24px_80px_rgba(10,12,35,0.55)]">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <p className="text-sm font-semibold text-white">Phone Numbers</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setBuyOpen(true)}
                className="rounded-md border border-white/15 bg-white/10 px-3 py-2 text-[11px] font-semibold text-white hover:bg-white/20"
              >
                Buy
              </button>
              <button
                type="button"
                onClick={() => setSipOpen(true)}
                className="rounded-md border border-white/15 bg-black/30 px-3 py-2 text-[11px] font-semibold text-white/80 hover:bg-white/10"
              >
                SIP
              </button>
            </div>
          </div>

          <div className="border-b border-white/10 px-4 py-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search phone numbers"
              className="w-full rounded-md border border-white/15 bg-black/35 py-2 pl-3 pr-3 text-xs font-medium text-white placeholder:text-white/45 focus:outline-none"
            />
          </div>

          <div className="h-[calc(100%-112px)] space-y-2 overflow-y-auto px-4 py-3 text-xs">
            {ownedError ? <p className="text-red-300">{ownedError}</p> : null}

            {!ownedError && filteredNumbers.length === 0 ? (
              <p className="text-white/60">No phone numbers yet.</p>
            ) : null}

            {filteredNumbers.map((item, index) => {
              const phone = item.phoneNumber ?? '';
              const isSelected = selectedNumber?.phoneNumber === item.phoneNumber;

              return (
                <button
                  key={phone || `unknown-number-${index}`}
                  type="button"
                  onClick={() => setSelectedNumberId(item.phoneNumber ?? null)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs font-semibold transition',
                    isSelected
                      ? 'border-white/30 bg-white/20 text-white'
                      : 'border-white/15 bg-white/5 text-white/85 hover:bg-white/10'
                  )}
                >
                  <span>{phone || 'Unknown number'}</span>
                  <span className="rounded-full bg-emerald-400/15 px-2 py-1 text-[10px] text-emerald-200">
                    Active
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 shadow-[0_24px_80px_rgba(10,12,35,0.55)]">
          {selectedNumber ? (
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                <div>
                  <h2 className="text-3xl font-semibold tracking-tight text-white">
                    {selectedNumber.phoneNumber ?? 'Unknown number'}
                  </h2>
                  <p className="mt-1 text-xs font-medium text-white/55">
                    Provider: {formatProviderLabel(selectedNumber.phoneNumberType)}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200">
                  Connected
                </span>
              </div>

              <div className="space-y-7 px-6 py-8">
                <div>
                  <p className="mb-2 text-lg font-semibold tracking-tight text-white">
                    Inbound call agent
                  </p>
                  <select
                    value={selectedNumber.inboundAgentId ?? ''}
                    onChange={(event) => {
                      if (!selectedNumber.phoneNumber) return;
                      void handleUpdateNumber(selectedNumber.phoneNumber, {
                        inboundAgentId: event.target.value || null,
                      });
                    }}
                    disabled={isUpdatingNumber}
                    className="h-10 w-full rounded-lg border border-white/15 bg-black/35 px-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <option value="">None (disable inbound)</option>
                    {initialAgents.map((agent) => (
                      <option key={agent.agentId} value={agent.agentId}>
                        {agent.agentName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="mb-2 text-lg font-semibold tracking-tight text-white">
                    Outbound call agent
                  </p>
                  <select
                    value={selectedNumber.outboundAgentId ?? ''}
                    onChange={(event) => {
                      if (!selectedNumber.phoneNumber) return;
                      void handleUpdateNumber(selectedNumber.phoneNumber, {
                        outboundAgentId: event.target.value || null,
                      });
                    }}
                    disabled={isUpdatingNumber}
                    className="h-10 w-full rounded-lg border border-white/15 bg-black/35 px-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <option value="">None (disable outbound)</option>
                    {initialAgents.map((agent) => (
                      <option key={agent.agentId} value={agent.agentId}>
                        {agent.agentName}
                      </option>
                    ))}
                  </select>
                </div>

                {agentsError ? <p className="text-sm font-medium text-red-300">{agentsError}</p> : null}
                {updateError ? <p className="text-sm font-medium text-red-300">{updateError}</p> : null}
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center p-8">
              <p className="text-sm text-white/60">
                {ownedError ? 'Unable to display phone details.' : "You don't have any phone numbers yet."}
              </p>
            </div>
          )}
        </section>
      </div>

      <BuyNumberModal
        open={buyOpen}
        onClose={() => setBuyOpen(false)}
        numberType={numberType}
        onNumberTypeChange={setNumberType}
        outboundTransport={outboundTransport}
        onOutboundTransportChange={setOutboundTransport}
        availableNumbers={availableNumbers}
        availableError={availableError}
        isLoadingAvailable={isLoadingAvailable}
        isLoadingMore={isLoadingMore}
        buyingNumberId={buyingNumberId}
        availableListRef={availableListRef}
        onAvailableScroll={handleAvailableScroll}
        onBuyNumber={handleBuyNumber}
      />

      <SipTrunkModal
        open={sipOpen}
        onClose={() => setSipOpen(false)}
        outboundTransport={outboundTransport}
        onOutboundTransportChange={setOutboundTransport}
      />
    </>
  );
}
