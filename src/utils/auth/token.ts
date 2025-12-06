export const ACCESS = 'accessToken';
export const REFRESH = 'refreshToken';

export function setAccessToken(token?: string | null) {
  if (typeof window === 'undefined') return;
  if (!token) return localStorage.removeItem(ACCESS);
  localStorage.setItem(ACCESS, token);
}
export function setRefreshToken(token?: string | null) {
  if (typeof window === 'undefined') return;
  if (!token) return localStorage.removeItem(REFRESH);
  localStorage.setItem(REFRESH, token);
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  try { return localStorage.getItem(ACCESS); } catch { return null; }
}
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  try { return localStorage.getItem(REFRESH); } catch { return null; }
}

export function clearTokens() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS);
  localStorage.removeItem(REFRESH);
}

// JWT decode functions
export function decodeJWT(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1];
    const decodedPayload = atob(payload);
    return JSON.parse(decodedPayload);
  } catch (error) {
    // Unable to decode JWT
    return null;
  }
}

export function getRoleFromToken(token?: string | null): string | null {
  const accessToken = token || getAccessToken();
  if (!accessToken) return null;

  const decoded = decodeJWT(accessToken);
  return decoded?.role as string || null;
}

export function getUserIdFromToken(token?: string | null): string | null {
  const accessToken = token || getAccessToken();
  if (!accessToken) return null;

  const decoded = decodeJWT(accessToken);
  return decoded?.userId as string || null;
}

export function getEmailFromToken(token?: string | null): string | null {
  const accessToken = token || getAccessToken();
  if (!accessToken) return null;

  const decoded = decodeJWT(accessToken);
  return decoded?.email as string || null;
}

// Token validation functions
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return true;

    const expirationTime = (decoded.exp as number) * 1000; // Convert to milliseconds
    const currentTime = Date.now();

    return currentTime >= expirationTime;
  } catch {
    return true; // If unable to decode, consider it expired
  }
}

export function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  return !isTokenExpired(token);
}

export function isTokenExpiringSoon(token: string, thresholdMinutes: number = 5): boolean {
  try {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return true;

    const expirationTime = (decoded.exp as number) * 1000;
    const currentTime = Date.now();
    const thresholdMs = thresholdMinutes * 60 * 1000;

    return (expirationTime - currentTime) <= thresholdMs;
  } catch {
    return true;
  }
}
