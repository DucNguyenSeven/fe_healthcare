export type RegisterPayload = { email: string; password: string };
export type VerifyPayload = { email: string; otp: string };
export type LoginPayload = { email: string; password: string };

export interface UseLogoutReturn {
  logout: () => void;
}
