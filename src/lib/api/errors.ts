import { AxiosError } from 'axios';

export type ParsedApiError = { code: string; message: string; status?: number };

export function parseApiError(err: unknown): ParsedApiError {
  if ((err as AxiosError)?.isAxiosError) {
    const ax = err as AxiosError<{ code?: string; message?: string }>;
    const status = ax.response?.status;
    const code = String(ax.response?.data?.code ?? status ?? 'UNKNOWN');
    const message =
      ax.response?.data?.message ??
      (status === 0 ? 'Mất kết nối. Kiểm tra mạng và thử lại.' : 'Có lỗi từ hệ thống. Vui lòng thử lại.');
    return { code, message, status };
  }
  return { code: 'UNKNOWN', message: 'Có lỗi xảy ra. Vui lòng thử lại.' };
}
