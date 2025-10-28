import api from '@/lib/api/client';
import type { GetLatestHealthMetricsResponse } from '@/types/dashboard';

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

  /**
   * Lấy panel chỉ số theo patientId và ngày cụ thể
   * API: GET /api/v1/health-metrics/by-patient-and-date?patientId={patientId}&measuredAt={date}
   */
  getPanelsByPatientAndDate(params: { patientId: string; measuredAt: string }) {
    const query = new URLSearchParams({ 
      patientId: params.patientId,
      measuredAt: params.measuredAt 
    });
    return api
      .get<ApiEnvelope<Array<{
        id?: string;
        measuredAt: string;
        metrics: Array<{ name: string; value: number | string; unit: string }>;
      }>>>(`/api/v1/health-metrics/by-patient-and-date?${query.toString()}`)
      .then((r) => r.data);
  },

  /**
   * Lấy chỉ số sức khỏe mới nhất của bệnh nhân
   * API: GET /api/v1/health-metrics/get-health-metrics-latest/{patientId}
   * Trả về: eGFR, Creatinine, Blood Pressure, Weight
   */
  async getLatestHealthMetrics(patientId: string): Promise<GetLatestHealthMetricsResponse> {
    try {
      console.log('🔍 [API] Fetching health metrics for patient:', patientId);

      const response = await api.get<GetLatestHealthMetricsResponse>(
        `/api/v1/health-metrics/get-health-metrics-latest/${patientId}`
      );

      console.log('🔍 [API] Raw Axios Response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers
      });

      // ✅ FIX: Handle different response structures
      // If API returns array directly (no wrapper)
      if (Array.isArray(response.data)) {
        console.log('🔍 [API] Response is array, wrapping it');
        return {
          code: 200,
          message: 'Success',
          success: true,
          data: response.data
        };
      }

      // If API returns wrapped response { code, message, data }
      console.log('🔍 [API] Response is object, returning as-is');
      return response.data;

    } catch (error: any) {
      console.error('❌ [API] Error fetching health metrics:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.response?.data?.message,
        data: error.response?.data
      });

      throw {
        code: error.response?.status || 500,
        message: error.response?.data?.message || error.message || 'Không thể tải chỉ số sức khỏe',
        success: false,
        data: []
      };
    }
  }
};

export default HealthMetricsApi;


