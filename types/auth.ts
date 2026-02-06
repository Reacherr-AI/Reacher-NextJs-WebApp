import { ChallengeType, OtpType, RoleType } from './enums';

export interface OtpVerificationRequest {
  challengeToken: string;
  otp: string;
  otpType: OtpType;
}

export interface AuthResponse {
  type: string;
}

export interface ChallengeResponse extends AuthResponse {
  challengeToken?: string;
  challengeType?: ChallengeType;
}

export interface JwtResponse extends AuthResponse {
  accessToken?: string;
  refreshToken?: string;
  userId?: string;
  username?: string;
}

export type AuthResult = ChallengeResponse | JwtResponse;

export interface SignUpRequest {
  name: string;
  username: string;
  password: string;
  roleType?: RoleType;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
