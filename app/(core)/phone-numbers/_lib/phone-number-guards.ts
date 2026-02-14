import type { AgentDashBoardDto, CountryCode, PhoneNumberResposneDto, PhoneNumberType } from '@/types';

export type AgentOption = {
  agentId: string;
  agentName: string;
};

const COUNTRY_CODES: CountryCode[] = ['US', 'CA', 'IN', 'IT', 'FR'];
const PHONE_NUMBER_TYPES: PhoneNumberType[] = ['TWILIO', 'CUSTOM', 'TELNYX', 'PLIVO'];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isCountryCode = (value: unknown): value is CountryCode =>
  typeof value === 'string' && COUNTRY_CODES.some((countryCode) => countryCode === value);

const isPhoneNumberType = (value: unknown): value is PhoneNumberType =>
  typeof value === 'string' && PHONE_NUMBER_TYPES.some((provider) => provider === value);

export const isPhoneNumberResponseDto = (value: unknown): value is PhoneNumberResposneDto => {
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

export const parsePhoneNumberList = (value: unknown): PhoneNumberResposneDto[] => {
  if (!Array.isArray(value)) return [];
  return value.filter(isPhoneNumberResponseDto);
};

const isAgentDashboardDto = (value: unknown): value is AgentDashBoardDto => {
  if (!isRecord(value)) return false;
  if (value.agentId !== undefined && typeof value.agentId !== 'string') return false;
  if (value.agentName !== undefined && typeof value.agentName !== 'string') return false;
  return true;
};

export const parseAgentOptions = (value: unknown): AgentOption[] => {
  if (!Array.isArray(value)) return [];

  const seenIds = new Set<string>();
  const options: AgentOption[] = [];

  for (const item of value) {
    if (!isAgentDashboardDto(item)) continue;
    if (!isNonEmptyString(item.agentId)) continue;
    if (!isNonEmptyString(item.agentName)) continue;
    if (seenIds.has(item.agentId)) continue;

    options.push({ agentId: item.agentId, agentName: item.agentName });
    seenIds.add(item.agentId);
  }

  return options;
};

