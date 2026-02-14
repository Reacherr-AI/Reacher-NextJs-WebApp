import { apiFetch } from '@/lib/api';
import { parseJsonResponse } from '@/lib/route-helpers';
import { PhoneNumbersShell } from './_components/phone-numbers-shell';
import { parseAgentOptions, parsePhoneNumberList } from './_lib/phone-number-guards';

const AGENTS_PAGE_SIZE = 200;

const getOwnedPhoneNumbers = async () => {
  const res = await apiFetch('/api/v1/list-phone-number', { method: 'POST' });
  const parsed = await parseJsonResponse<unknown>(res);

  if (!parsed.ok) {
    const message =
      typeof parsed.data === 'object' &&
      parsed.data !== null &&
      'message' in parsed.data &&
      typeof parsed.data.message === 'string'
        ? parsed.data.message
        : 'Unable to load your phone numbers.';

    return {
      ownedNumbers: [],
      error: message,
    };
  }

  return {
    ownedNumbers: parsePhoneNumberList(parsed.data),
    error: null as string | null,
  };
};

const getAgents = async () => {
  const res = await apiFetch(
    `/api/v1/list-agent-dashboard?page=0&size=${AGENTS_PAGE_SIZE}`,
    { method: 'GET' }
  );
  const parsed = await parseJsonResponse<unknown>(res);

  if (!parsed.ok) {
    const message =
      typeof parsed.data === 'object' &&
      parsed.data !== null &&
      'message' in parsed.data &&
      typeof parsed.data.message === 'string'
        ? parsed.data.message
        : 'Unable to load agents.';

    return {
      agents: [],
      error: message,
    };
  }

  return {
    agents: parseAgentOptions(parsed.data),
    error: null as string | null,
  };
};

export default async function PhoneNumbersPage() {
  const [
    { ownedNumbers, error: ownedError },
    { agents, error: agentsError },
  ] = await Promise.all([getOwnedPhoneNumbers(), getAgents()]);

  return (
    <div className="min-h-screen bg-black pb-16 text-white">
      <div
        role="main"
        className="mx-auto h-full w-full max-w-378 rounded-b-[26px] bg-[radial-gradient(1200px_circle_at_75%_10%,rgba(248,248,248,0.08)_0%,rgba(56,66,218,0.35)_32%,rgba(12,14,55,0.75)_60%,rgba(0,0,0,1)_100%)] px-6 pb-12 pt-10 shadow-[0_40px_120px_rgba(6,7,33,0.45)] sm:px-10"
      >
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">
            Phone Numbers
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-5xl">
            Manage routing, purchases, and assignments
          </h1>
          <p className="mt-4 max-w-3xl text-sm text-white/60 sm:text-base">
            View your provisioned numbers, buy new ones, and assign inbound and outbound
            call agents from one place.
          </p>
        </header>

        <PhoneNumbersShell
          initialOwnedNumbers={ownedNumbers}
          initialOwnedError={ownedError}
          initialAgents={agents}
          initialAgentsError={agentsError}
        />
      </div>
    </div>
  );
}
