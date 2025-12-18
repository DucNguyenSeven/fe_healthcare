/**
 * Types for CKD Prediction Trend Comparison API
 * Backend endpoint: GET /api/v1/analysis/predict-current-trends/{patientId}
 */

/**
 * Classification of overall trend between current and previous prediction
 */
export type TrendClassification =
  | 'IMPROVING'           // Tình trạng cải thiện
  | 'STABLE'              // Tình trạng ổn định
  | 'WORSENING'           // Tình trạng xấu đi
  | 'INSUFFICIENT_HISTORY'; // Chưa đủ dữ liệu lịch sử (< 2 predictions)

/**
 * Status of individual metric comparison
 */
export type MetricComparisonStatus =
  | 'WARNING'    // Thay đổi ≥10% theo hướng xấu
  | 'NORMAL'     // Thay đổi <10% (không đáng kể)
  | 'IMPROVING';  // Thay đổi ≥10% theo hướng tốt

/**
 * Detailed comparison for a single health metric
 */
export interface MetricComparison {
  /** Tên metric (e.g., "Serum Creatinine", "GFR", "BUN") */
  metric: string;

  /** Giá trị lần dự đoán trước */
  previousValue: number;

  /** Giá trị lần dự đoán hiện tại */
  currentValue: number;

  /** Đơn vị đo (e.g., "mg/dL", "mL/min/1.73m²") */
  unit: string;

  /** Phần trăm thay đổi (currentValue - previousValue) / previousValue * 100 */
  changePct: number;

  /** Trạng thái đánh giá của metric này */
  status: MetricComparisonStatus;

  /** Thông báo chi tiết về sự thay đổi */
  message: string;
}

/**
 * Overview of trend analysis between two predictions
 */
export interface TrendOverview {
  /** Phân loại xu hướng tổng thể */
  classification: TrendClassification;

  /** Stage của lần dự đoán trước (1-5) */
  stagePrevious: number | null;

  /** Stage của lần dự đoán hiện tại (1-5) */
  stageCurrent: number | null;

  /** Thay đổi độ tin cậy (confidence hiện tại - confidence trước) */
  confidenceChange: number | null;

  /** Giá trị của metric chính lần trước (thường là GFR) */
  metricPrevious?: number | null;

  /** Giá trị của metric chính hiện tại */
  metricCurrent?: number | null;

  /** Phần trăm thay đổi của metric chính */
  metricChangePct?: number | null;

  /** Tên metric chính được dùng để đánh giá (ưu tiên: GFR > Creatinine > BUN) */
  metricName?: string | null;

  /** Tóm tắt xu hướng bằng văn bản */
  summary: string;
}

/**
 * Complete response from predict-current-trends API
 */
export interface PredictCurrentTrendsResponse {
  /** Thông tin tổng quan về xu hướng */
  trend: TrendOverview;

  /** Danh sách so sánh chi tiết từng metric */
  metricComparisons?: MetricComparison[];
}

/**
 * Helper type for component props
 */
export interface PredictionTrendData {
  classification: TrendClassification;
  stagePrevious: number | null;
  stageCurrent: number | null;
  confidenceChange: number | null;
  summary: string;
  metricComparisons: MetricComparison[];
}
