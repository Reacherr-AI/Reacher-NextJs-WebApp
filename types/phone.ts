import { CountryCode, PhoneNumberType, TransportType } from './enums';

export interface PhoneNumberRequestDto {
  phoneNumber: string;
  isTollFree?: boolean;
  countryCode?: CountryCode;
  nickname?: string;
  inboundWebhookUrl?: string;
  areaCode?: number;
  allowedInboundCountry?: CountryCode[];
  allowedOutboundCountry?: CountryCode[];
  phoneNumberType?: PhoneNumberType;
  terminationUri?: string;
  authUserName?: string;
  authPassword?: string;
  transportType?: TransportType;
  inboundAgentId?: string;
  outboundAgentId?: string;
}

export interface SipTrunkDto {
  terminationUri?: string;
  authUsername?: string;
  authPassword?: string;
  transportType?: TransportType;
}

export interface PhoneNumberResposneDto {
  phoneNumber?: string;
  countryCode?: CountryCode;
  nickname?: string;
  inboundWebhookUrl?: string;
  areaCode?: number;
  allowedInboundCountry?: CountryCode[];
  allowedOutboundCountry?: CountryCode[];
  phoneNumberType?: PhoneNumberType;
  inboundAgentId?: string;
  outboundAgentId?: string;
  sipTrunkConfig?: SipTrunkDto;
  tollFree?: boolean;
}

export interface AddPhoneRequest {
  phone: string;
  challengeToken: string;
}

export interface AvailableNumberRequestDto {
  countryCode: CountryCode;
  provider: PhoneNumberType;
  contains?: string;
  isTollFree: boolean;
}

export interface Pageable {
  page?: number;
  size?: number;
  sort?: string[];
}

export interface AvailableNumberResponse {
  numbers?: string[];
  last?: boolean;
}
