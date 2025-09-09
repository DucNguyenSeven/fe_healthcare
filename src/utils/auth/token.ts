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
