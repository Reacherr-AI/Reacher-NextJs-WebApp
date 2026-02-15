export type JwtPayload = Record<string, unknown>;

// Best-effort decode of JWT payload. We don't verify signatures here because we only
// use this for UI display (name/email) from an already-authenticated cookie.
export function decodeJwtPayload(token: string): JwtPayload | null {
  const parts = token.split('.');
  if (parts.length < 2) return null;

  try {
    const base64Url = parts[1] ?? '';
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json = Buffer.from(padded, 'base64').toString('utf8');
    const parsed = JSON.parse(json) as unknown;
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed as JwtPayload;
  } catch {
    return null;
  }
}

