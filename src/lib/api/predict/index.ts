/**
 * Prediction API Service
 * Backend endpoints:
 * - POST /api/v1/analysis/ckd-prediction (AI Service - Direct connection port 8086)
 * - POST /api/v1/analysis/predict-current-trends (AI Service - Trend comparison port 8086)
 * - POST /api/v1/predicts/create-predict (Gateway - Save history to DB port 8080)
 */

import { api } from '../client';  // Gateway client for saving history
import { createAIClient } from '../createAIClient';  // AI Service client for predictions
import type { PredictCurrentTrendsResponse } from '@/types/predict';

const aiClient = createAIClient();

// Request/Response types for CKD prediction
export interface CKDPredictionRequest {
  serum_creatinine: number;
  gfr: number;
  bun: number;
  serum_calcium: number;
  ana: number; // 0 or 1
  c3_c4: number;
  hematuria: number; // 0 or 1
  oxalate_levels: number;
  urine_ph: number;
  blood_pressure: number;
  water_intake: number;
  months: number;
  cluster: number;
  physical_activity: string; // 'daily' | 'weekly' | 'rarely'
  diet: string; // 'high protein' | 'low salt' | 'balanced'
  smoking: string; // 'yes' | 'no'
  alcohol: string; // 'daily' | 'occasionally' | 'never'
  painkiller_usage: string; // 'yes' | 'no'
  family_history: string; // 'yes' | 'no'
  weight_changes: string; // 'stable' | 'loss' | 'gain'
  stress_level: string; // 'low' | 'moderate' | 'high'
}

export interface CKDPredictionResponse {
  predicted_stage: number; // 1-5
  confidence: number; // 0.0 - 1.0
  stage_description: string;
  recommendations: string[];
  risk_level: string; // 'low' | 'moderate' | 'high' | 'critical'
}

export interface CreateHealthMetricRequest {
  patientId: string;
  metricName: string;
  metricValue: number;
  unit: string;
  recordId?: string;
  measuredAt: string; // ISO date string
}

export interface SavePredictHistoryRequest {
  patientId: string;
  stage: number;
  confidence: number;
  recommendations: string[];
  healthMetrics: CreateHealthMetricRequest[];
}

export interface SavePredictHistoryResponse {
  id: string;
  user_id: string;
  predicted_stage: number;
  confidence: number;
  risk_level: string;
  created_at: string;
  message: string;
}

// Health Metric interface for Get Predict response
export interface HealthMetric {
  metricId: string;
  patientId: string;
  metricName: string;
  metricValue: number;
  unit: string;
  medicalRecordId?: string | null;
  measuredAt: string;
}

// Get Predict Response
export interface PredictData {
  predictId: string;
  patientId: string;
  stage: number;
  recommendations: string[];
  confidence: number;
  healthMetrics: HealthMetric[];
}

export interface GetPredictResponse {
  statusCode: number;
  message: string;
  success: boolean;
  data: PredictData | null;
}

/**
 * Gọi AI API để dự đoán CKD (trực tiếp đến AI Service)
 * Endpoint: POST /api/v1/analysis/ckd-prediction
 *
 * @param request - Request chứa 21 health metrics
 * @returns Response chứa predicted stage, confidence, recommendations
 */
export async function predictCKD(request: CKDPredictionRequest): Promise<CKDPredictionResponse> {
  const response = await aiClient.post<CKDPredictionResponse>(
    '/api/v1/analysis/ckd-prediction',
    request
  );
  return response.data;
}

/**
 * Lưu lịch sử dự đoán vào database (qua Gateway)
 * Endpoint: POST /api/v1/predicts/create-predict
 *
 * @param request - Request chứa kết quả dự đoán và health metrics
 * @returns Response chứa id và thông tin đã lưu
 */
export async function savePredictHistory(request: SavePredictHistoryRequest): Promise<SavePredictHistoryResponse> {
  const response = await api.post<SavePredictHistoryResponse>(
    '/api/v1/predicts/create-predict',
    request
  );
  return response.data;
}

/**
 * Lấy thông tin dự đoán mới nhất của bệnh nhân (qua Gateway)
 * Endpoint: GET /api/v1/predicts/get-predict/{patientId}
 *
 * @param patientId - ID của bệnh nhân
 * @returns Response chứa thông tin dự đoán và health metrics
 */
export async function getPredict(patientId: string): Promise<GetPredictResponse> {
  const response = await api.get<GetPredictResponse>(
    `/api/v1/predicts/get-predict/${patientId}`
  );
  return response.data;
}

/**
 * Lấy so sánh xu hướng giữa dự đoán hiện tại và lần trước (trực tiếp đến AI Service)
 * Endpoint: POST /api/v1/analysis/predict-current-trends
 *
 * @param patientId - ID của bệnh nhân
 * @param predictData - Dữ liệu prediction hiện tại (predictId, stage, confidence, recommendations, timestamps)
 * @returns Response chứa thông tin xu hướng và so sánh metrics
 * @throws Error nếu chưa có đủ dữ liệu lịch sử (< 2 predictions)
 */
export async function getPredictCurrentTrends(
  patientId: string,
  predictData: {
    predictId: string;
    stage: number;
    confidence: number;
    recommendations: string[];
    createdAt: string;
    updatedAt: string;
  }
): Promise<PredictCurrentTrendsResponse> {
  const response = await aiClient.post<PredictCurrentTrendsResponse>(
    '/api/v1/analysis/predict-current-trends',
    {
      predictId: predictData.predictId,
      patientId: patientId,
      stage: predictData.stage,
      recommendations: predictData.recommendations,
      confidence: predictData.confidence,
      createdAt: predictData.createdAt,
      updatedAt: predictData.updatedAt
    }
  );

  // Normalize response: ensure metricComparisons exists
  const data = response.data;
  return {
    trend: data.trend,
    metricComparisons: data.metricComparisons || []
  };
}

export default {
  predictCKD,
  savePredictHistory,
  getPredict,
  getPredictCurrentTrends
};
