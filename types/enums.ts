export type OtpType = 'EMAIL' | 'PHONE';

export type ChallengeType = 'EMAIL' | 'PHONE' | 'ADD_PHONE';

export type CountryCode = 'US' | 'CA' | 'IN' | 'IT' | 'FR';

export type PhoneNumberType = 'TWILIO' | 'CUSTOM' | 'TELNYX' | 'PLIVO';

export type TransportType = 'UDP' | 'TCP' | 'TLS' | 'AUTO';

export type CallType = 'WEB_CALL' | 'PHONE_CALL';

export type CallStatus = 'REGISTERED' | 'ONGOING' | 'ENDED' | 'ERROR';

export type PiiMode = 'post_call' | 'POST_CALL';

export type PiiCategory =
  | 'PERSON_NAME'
  | 'ADDRESS'
  | 'EMAIL'
  | 'PHONE_NUMBER'
  | 'SSN'
  | 'PASSPORT'
  | 'DRIVER_LICENSE'
  | 'CREDIT_CARD'
  | 'BANK_ACCOUNT'
  | 'PASSWORD'
  | 'PIN'
  | 'MEDICAL_ID'
  | 'DATE_OF_BIRTH'
  | 'CUSTOMER_ACCOUNT_NUMBER';

export type LanguageCode =
  | 'bn'
  | 'de'
  | 'en'
  | 'es'
  | 'fr'
  | 'gu'
  | 'hi'
  | 'it'
  | 'ja'
  | 'kn'
  | 'ko'
  | 'ml'
  | 'mr'
  | 'pa'
  | 'pt'
  | 'ta'
  | 'te'
  | 'zh';

export type RoleType = 'OWNER' | 'MEMBER' | 'VIEWER';

export type S2SModel =
  | 'gpt-4o-realtime'
  | 'gpt-4o-mini-realtime'
  | 'gpt-realtime'
  | 'gpt-realtime-mini';

export type StartSpeaker = 'user' | 'ai';

export type AgentTemplateType = 'single-prompt' | 'conversational-flow' | 'custom';
