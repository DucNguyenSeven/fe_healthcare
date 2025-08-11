export class ApiError extends Error {
  constructor(public status: number, public detail?: unknown) {
    super(`ApiError ${status}`);
  }
}
export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers || {}) },
  });
  if (!res.ok) {
    let detail: unknown;
    try { detail = await res.json(); } catch {}
    throw new ApiError(res.status, detail);
  }
  return res.json() as Promise<T>;
}
