import type { PhoneNumberType } from '@/types';

const PROVIDER_LABELS: Record<PhoneNumberType, string> = {
  TWILIO: 'Twilio',
  TELNYX: 'Telnyx',
  CUSTOM: 'Custom',
  PLIVO: 'Plivo',
};

export const formatProviderLabel = (provider?: PhoneNumberType) => {
  if (!provider) return 'Unknown';
  return PROVIDER_LABELS[provider] ?? provider;
};

