import api from '@/lib/api/client';

export interface CreateHealthMetricPanelRequest {
  patientId: string;
  recordId?: string | null;
  measuredAt: string; // ISO string
  metrics: Array<{
    name: string;
    value: number | string;
    unit: string;
  }>;
}

export interface ApiEnvelope<T = any> {
  data: T;
  message?: string;
  success?: boolean;
}

export const HealthMetricsApi = {
  createPanel(payload: CreateHealthMetricPanelRequest) {
    return api
      .post<ApiEnvelope<boolean>>('/api/v1/health-metrics/create-panel', payload)
      .then((r) => r.data);
  },
  /**
   * Danh sách panel chỉ số theo patientId
   */
  getPanelsByPatient(params: { patientId: string; page?: number; size?: number }) {
    const query = new URLSearchParams({ patientId: params.patientId });
    return api
      .get<ApiEnvelope<Array<{
        id?: string;
        measuredAt: string;
        metrics: Array<{ name: string; value: number | string; unit: string }>;
      }>>>(`/api/v1/health-metrics/by-patient?${query.toString()}`)
      .then((r) => r.data);
  },
};

export default HealthMetricsApi;


