export type JwtResponse = {
  accessToken: string;
  refreshToken: string;
  userId: string;
  username: string;
  type?: string;
};

export type ChallengeResponse = {
  challengeToken: string;
  challengeType: 'EMAIL' | 'PHONE' | 'ADD_PHONE';
};

export type AuthResponse = JwtResponse | ChallengeResponse;

export const isJwtResponse = (data: AuthResponse): data is JwtResponse => {
  return typeof (data as JwtResponse).accessToken === 'string';
};
