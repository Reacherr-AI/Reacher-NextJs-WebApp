import { NextResponse } from 'next/server';
import type { AvailableNumberRequestDto, AvailableNumberResponse } from '@/types';
import { apiFetch } from '@/lib/api';
import { parseJsonResponse } from '@/lib/route-helpers';

const COUNTRY_CODES = ['US', 'CA', 'IN', 'IT', 'FR'] as const;
const PHONE_NUMBER_TYPES = ['TWILIO', 'CUSTOM', 'TELNYX', 'PLIVO'] as const;

const clampInt = (value: string | null, fallback: number, min: number, max: number) => {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  const rounded = Math.floor(parsed);
  if (rounded < min) return min;
  if (rounded > max) return max;
  return rounded;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isCountryCode = (value: unknown): value is (typeof COUNTRY_CODES)[number] =>
  typeof value === 'string' &&
  COUNTRY_CODES.some((countryCode) => countryCode === value);

const isPhoneNumberType = (value: unknown): value is (typeof PHONE_NUMBER_TYPES)[number] =>
  typeof value === 'string' &&
  PHONE_NUMBER_TYPES.some((phoneNumberType) => phoneNumberType === value);

const isAvailableNumberRequestDto = (value: unknown): value is AvailableNumberRequestDto => {
  if (!isRecord(value)) return false;
  if (!isCountryCode(value.countryCode)) return false;
  if (!isPhoneNumberType(value.provider)) return false;
  if (value.contains !== undefined && typeof value.contains !== 'string') return false;
  if (typeof value.isTollFree !== 'boolean') return false;
  return true;
};

const parseAvailableResponse = (value: unknown): AvailableNumberResponse => {
  if (!isRecord(value)) {
    return { numbers: [], last: true };
  }

  const numbers = Array.isArray(value.numbers)
    ? value.numbers.filter((number): number is string => typeof number === 'string')
    : [];

  const last = typeof value.last === 'boolean' ? value.last : true;

  return { numbers, last };
};

export async function POST(req: Request) {
  const url = new URL(req.url);
  const page = clampInt(url.searchParams.get('page'), 0, 0, 10_000);
  const size = clampInt(url.searchParams.get('size'), 5, 1, 200);

  const raw = (await req.json().catch(() => null)) as unknown;

  if (!isAvailableNumberRequestDto(raw)) {
    return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
  }

  const res = await apiFetch(`/api/v1/list-available-numbers?page=${page}&size=${size}`, {
    method: 'POST',
    body: JSON.stringify(raw),
  });
  const parsed = await parseJsonResponse<unknown>(res);

  if (!parsed.ok) {
    return NextResponse.json(parsed.data, { status: parsed.status });
  }

  return NextResponse.json(parseAvailableResponse(parsed.data));
}
