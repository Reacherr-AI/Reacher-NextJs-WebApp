import { NextResponse } from 'next/server';
import type { PhoneNumberRequestDto, PhoneNumberResposneDto } from '@/types';
import { apiFetch } from '@/lib/api';
import { parseJsonResponse } from '@/lib/route-helpers';

type UpdatePhoneNumberBody = Omit<
  Partial<PhoneNumberRequestDto>,
  'inboundAgentId' | 'outboundAgentId'
> & {
  inboundAgentId?: string | null;
  outboundAgentId?: string | null;
};

const COUNTRY_CODES = ['US', 'CA', 'IN', 'IT', 'FR'] as const;
const PHONE_NUMBER_TYPES = ['TWILIO', 'CUSTOM', 'TELNYX', 'PLIVO'] as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isNullableString = (value: unknown): value is string | null =>
  value === null || typeof value === 'string';

const isCountryCodeArray = (value: unknown): value is (typeof COUNTRY_CODES)[number][] =>
  Array.isArray(value) && value.every((countryCode) => isCountryCode(countryCode));

const isCountryCode = (value: unknown): value is (typeof COUNTRY_CODES)[number] =>
  typeof value === 'string' &&
  COUNTRY_CODES.some((countryCode) => countryCode === value);

const isPhoneNumberType = (value: unknown): value is (typeof PHONE_NUMBER_TYPES)[number] =>
  typeof value === 'string' &&
  PHONE_NUMBER_TYPES.some((phoneNumberType) => phoneNumberType === value);

const isPhoneNumberResponseDto = (value: unknown): value is PhoneNumberResposneDto => {
  if (!isRecord(value)) return false;
  if (value.phoneNumber !== undefined && !isNonEmptyString(value.phoneNumber)) return false;
  if (value.countryCode !== undefined && !isCountryCode(value.countryCode)) return false;
  if (value.nickname !== undefined && typeof value.nickname !== 'string') return false;
  if (value.inboundWebhookUrl !== undefined && typeof value.inboundWebhookUrl !== 'string') return false;
  if (value.areaCode !== undefined && typeof value.areaCode !== 'number') return false;
  if (
    value.allowedInboundCountry !== undefined &&
    (!Array.isArray(value.allowedInboundCountry) ||
      value.allowedInboundCountry.some((countryCode) => !isCountryCode(countryCode)))
  ) {
    return false;
  }
  if (
    value.allowedOutboundCountry !== undefined &&
    (!Array.isArray(value.allowedOutboundCountry) ||
      value.allowedOutboundCountry.some((countryCode) => !isCountryCode(countryCode)))
  ) {
    return false;
  }
  if (value.phoneNumberType !== undefined && !isPhoneNumberType(value.phoneNumberType)) return false;
  if (value.inboundAgentId !== undefined && typeof value.inboundAgentId !== 'string') return false;
  if (value.outboundAgentId !== undefined && typeof value.outboundAgentId !== 'string') return false;
  if (value.tollFree !== undefined && typeof value.tollFree !== 'boolean') return false;
  return true;
};

const isUpdatePhoneNumberBody = (value: unknown): value is UpdatePhoneNumberBody => {
  if (!isRecord(value)) return false;
  if (value.phoneNumber !== undefined && !isNonEmptyString(value.phoneNumber)) return false;
  if (value.isTollFree !== undefined && typeof value.isTollFree !== 'boolean') return false;
  if (value.countryCode !== undefined && !isCountryCode(value.countryCode)) return false;
  if (value.nickname !== undefined && typeof value.nickname !== 'string') return false;
  if (value.inboundWebhookUrl !== undefined && typeof value.inboundWebhookUrl !== 'string') return false;
  if (value.areaCode !== undefined && typeof value.areaCode !== 'number') return false;
  if (
    value.allowedInboundCountry !== undefined &&
    !isCountryCodeArray(value.allowedInboundCountry)
  ) {
    return false;
  }
  if (
    value.allowedOutboundCountry !== undefined &&
    !isCountryCodeArray(value.allowedOutboundCountry)
  ) {
    return false;
  }
  if (value.phoneNumberType !== undefined && !isPhoneNumberType(value.phoneNumberType)) return false;
  if (value.terminationUri !== undefined && typeof value.terminationUri !== 'string') return false;
  if (value.authUserName !== undefined && typeof value.authUserName !== 'string') return false;
  if (value.authPassword !== undefined && typeof value.authPassword !== 'string') return false;
  if (
    value.transportType !== undefined &&
    value.transportType !== 'UDP' &&
    value.transportType !== 'TCP' &&
    value.transportType !== 'TLS' &&
    value.transportType !== 'AUTO'
  ) {
    return false;
  }
  if (
    value.inboundAgentId !== undefined &&
    !isNullableString(value.inboundAgentId)
  ) {
    return false;
  }
  if (
    value.outboundAgentId !== undefined &&
    !isNullableString(value.outboundAgentId)
  ) {
    return false;
  }
  return true;
};

export async function PATCH(
  req: Request,
  context: { params: Promise<{ phoneNumber: string }> }
) {
  const { phoneNumber } = await context.params;

  if (!isNonEmptyString(phoneNumber)) {
    return NextResponse.json({ message: 'Invalid phoneNumber.' }, { status: 400 });
  }

  const raw = (await req.json().catch(() => null)) as unknown;
  if (!isUpdatePhoneNumberBody(raw)) {
    return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
  }

  const payload: UpdatePhoneNumberBody & { phoneNumber: string } = {
    ...raw,
    phoneNumber,
  };

  const res = await apiFetch(`/api/v1/update-phone-number/${encodeURIComponent(phoneNumber)}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const parsed = await parseJsonResponse<unknown>(res);

  if (!parsed.ok) {
    return NextResponse.json(parsed.data, { status: parsed.status });
  }

  if (!isPhoneNumberResponseDto(parsed.data)) {
    return NextResponse.json({ message: 'Unexpected update response from backend.' }, { status: 502 });
  }

  return NextResponse.json(parsed.data);
}
