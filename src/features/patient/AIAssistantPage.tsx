"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Activity, Droplets, Heart, Calculator, TrendingUp, Shield, AlertCircle, ChevronRight, ChevronLeft, BarChart3, Calendar, ChevronDown, AlertTriangle, FileText } from 'lucide-react';
import { User as UserType } from './HealthcarePlusApp';
import { getAccessToken } from '@/utils/auth/token';
import { predictCKD, savePredictHistory, CreateHealthMetricRequest, getPredictCurrentTrends } from '@/lib/api/predict';
import type { PredictCurrentTrendsResponse } from '@/types/predict';
import { FirstPredictionBanner } from '@/components/predict/FirstPredictionBanner';
import { PredictionTrendCard } from '@/components/predict/PredictionTrendCard';
import { usePatientHealthPanels } from '@/hooks/health-metrics/usePatientPanels';
import { usePanelByDate } from '@/hooks/health-metrics/usePanelByDate';
import { format } from 'date-fns';
interface AIAssistantPageProps {
  user: UserType;
  onNavigate?: (page: 'appointments') => void;
}

interface CKDFormData {
  // Numerical features
  serum_creatinine: number;
  gfr: number;
  bun: number;
  serum_calcium: number;
  c3_c4: number;
  oxalate_levels: number;
  urine_ph: number;
  blood_pressure_systolic: number;
  blood_pressure_diastolic: number;
  water_intake: number;
  months: number;
  cluster: number;

  // Binary features
  ana: boolean;
  hematuria: boolean;
  smoking: boolean;
  painkiller_usage: boolean;
  family_history: boolean;

  // Categorical features
  physical_activity: 'daily' | 'weekly' | 'rarely' | '';
  diet: 'high protein' | 'low salt' | 'balanced' | '';
  alcohol: 'daily' | 'occasionally' | 'never' | '';
  weight_changes: 'stable' | 'loss' | 'gain' | '';
  stress_level: number; // 1-3
}
export function AIAssistantPage({
  user,
  onNavigate
}: AIAssistantPageProps) {
  const [currentTab, setCurrentTab] = useState(1);

  // Fetch real health metrics panels
  const { panels, loading: panelsLoading } = usePatientHealthPanels(user.id);

  // State for selected date
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Fetch panel data for selected date
  const { data: selectedPanelData, isLoading: isLoadingPanel } = usePanelByDate(user.id, selectedDate);

  // Create dropdown options from real panels
  const availableDates = useMemo(() => {
    if (!panels || panels.length === 0) return [];

    return panels
      .map(panel => {
        const creatinineValue = panel.metrics.serum_creatinine?.value || panel.metrics.Serum_Creatinine?.value || 'N/A';
        const gfrValue = panel.metrics.gfr?.value || panel.metrics.GFR?.value || 'N/A';

        return {
          id: panel.id,
          date: panel.measuredAt,
          displayDate: format(new Date(panel.measuredAt), 'dd/MM/yyyy'),
          preview: `Creatinin: ${creatinineValue} mg/dL • eGFR: ${gfrValue} ml/min`,
          timestamp: new Date(panel.measuredAt).getTime()
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp) // Newest first
      .map((item, index) => ({
        ...item,
        isLatest: index === 0
      }));
  }, [panels]);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedPanel, setSelectedPanel] = useState<string>('manual');

  // CKD Prediction state with exact 21 features
  const [ckdFormData, setCkdFormData] = useState<CKDFormData>({
    // Numerical features
    serum_creatinine: user.lastCreatinine || 1.2,
    gfr: user.lastEgfr || 60,
    bun: 20,
    serum_calcium: 9.5,
    c3_c4: 120,
    oxalate_levels: 2.5,
    urine_ph: 6.0,
    blood_pressure_systolic: 120,
    blood_pressure_diastolic: 80,
    water_intake: 2.0,
    months: 6,
    cluster: 0,
    // Binary features
    ana: false,
    hematuria: false,
    smoking: false,
    painkiller_usage: false,
    family_history: false,
    // Categorical features
    physical_activity: '',
    diet: '',
    alcohol: '',
    weight_changes: '',
    stress_level: 2
  });
  const [predictionResult, setPredictionResult] = useState<{
    risk: 'low' | 'moderate' | 'high';
    percentage: number;
    stage: string;
    stageNumber: number;
    recommendations: string[];
  } | null>(null);

  const [isCalculatingPrediction, setIsCalculatingPrediction] = useState(false);

  // Trend comparison state
  const [trendData, setTrendData] = useState<PredictCurrentTrendsResponse | null>(null);
  const [isLoadingTrend, setIsLoadingTrend] = useState(false);

  // Function to map API panel data to CKD form
  const mapApiPanelToCKDForm = (panel: any) => {
    console.log('🧮 Mapping panel data for date:', panel?.measuredAt);

    // panel.metrics is now a Record<string, { value, unit }>
    const metrics = panel?.metrics || {};

    // Helper function to get metric value
    const getMetricValue = (key: string) => {
      // Try both lowercase and original case
      const lowerKey = key.toLowerCase();
      return metrics[lowerKey]?.value || metrics[key]?.value;
    };

    // Create the mapped object
    const mappedResult = {
      serum_creatinine: getMetricValue('serum_creatinine') || ckdFormData.serum_creatinine,
      gfr: getMetricValue('gfr') || ckdFormData.gfr,
      bun: getMetricValue('bun') || ckdFormData.bun,
      serum_calcium: getMetricValue('serum_calcium') || ckdFormData.serum_calcium,
      c3_c4: getMetricValue('c3_c4') || ckdFormData.c3_c4,
      oxalate_levels: getMetricValue('oxalate_levels') || ckdFormData.oxalate_levels,
      urine_ph: getMetricValue('urine_ph') || ckdFormData.urine_ph,
      ana: getMetricValue('ana') === 1 || getMetricValue('ana') === true,
      hematuria: getMetricValue('hematuria') === 1 || getMetricValue('hematuria') === true,
      // Keep other values unchanged
      blood_pressure_systolic: ckdFormData.blood_pressure_systolic,
      blood_pressure_diastolic: ckdFormData.blood_pressure_diastolic,
      water_intake: ckdFormData.water_intake,
      months: ckdFormData.months,
      cluster: ckdFormData.cluster,
      smoking: ckdFormData.smoking,
      painkiller_usage: ckdFormData.painkiller_usage,
      family_history: ckdFormData.family_history,
      physical_activity: ckdFormData.physical_activity,
      diet: ckdFormData.diet,
      alcohol: ckdFormData.alcohol,
      weight_changes: ckdFormData.weight_changes,
      stress_level: ckdFormData.stress_level
    };

    console.log('✅ Mapped values:', {
      creatinine: mappedResult.serum_creatinine,
      gfr: mappedResult.gfr,
      bun: mappedResult.bun,
      ana: mappedResult.ana,
      hematuria: mappedResult.hematuria
    });

    return mappedResult;
  };

  // Function to handle test selection from dropdown
  const handleTestSelection = (panelId: string) => {
    console.log('🔄 Selecting test data for panel ID:', panelId);

    if (panelId === 'manual') {
      // Reset to default values for manual input
      const manualData = {
        serum_creatinine: 1.2,
        gfr: 60,
        bun: 20,
        serum_calcium: 9.5,
        c3_c4: 120,
        oxalate_levels: 2.5,
        urine_ph: 6.0,
        ana: false,
        hematuria: false,
        blood_pressure_systolic: ckdFormData.blood_pressure_systolic,
        blood_pressure_diastolic: ckdFormData.blood_pressure_diastolic,
        water_intake: ckdFormData.water_intake,
        months: ckdFormData.months,
        cluster: ckdFormData.cluster,
        smoking: ckdFormData.smoking,
        painkiller_usage: ckdFormData.painkiller_usage,
        family_history: ckdFormData.family_history,
        physical_activity: ckdFormData.physical_activity,
        diet: ckdFormData.diet,
        alcohol: ckdFormData.alcohol,
        weight_changes: ckdFormData.weight_changes,
        stress_level: ckdFormData.stress_level
      };
      setCkdFormData(manualData);
      setSelectedPanel('manual');
      setSelectedDate(null);
      console.log('✅ Manual input selected');
    } else {
      // Find the selected panel to get its measuredAt date
      const selectedPanelInfo = availableDates.find(d => d.id === panelId);
      if (selectedPanelInfo) {
        setSelectedPanel(panelId);
        setSelectedDate(selectedPanelInfo.date); // Use measuredAt for API query
        console.log('✅ Selected panel:', panelId, 'Date:', selectedPanelInfo.date);
      } else {
        console.error('❌ Panel not found:', panelId);
      }
    }
    setIsDropdownOpen(false);
  };

  // Auto-fill form when panel data is loaded
  useEffect(() => {
    if (selectedPanelData && selectedPanel !== 'manual') {
      console.log('📊 Panel data loaded, updating form:', selectedPanelData);
      const mappedData = mapApiPanelToCKDForm(selectedPanelData);
      setCkdFormData(mappedData);
      console.log('✅ Form data updated from API');
    }
  }, [selectedPanelData, selectedPanel]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest('.dropdown-container')) {
          setIsDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const handleBookAppointment = () => {
    // Navigate to appointments page
    // Note: Prediction is already saved to database in calculateCKDRisk()
    if (onNavigate) {
      onNavigate('appointments');
    }
  };

  // Transform flat health metrics object to array format for Backend
  // ⚠️ ONLY save 9 LAB TEST fields (exclude lifestyle and medical history)
  const transformHealthMetricsToArray = (
    formData: any,
    patientId: string
  ): CreateHealthMetricRequest[] => {
    const measuredAt = new Date().toISOString();
    const metrics: CreateHealthMetricRequest[] = [];

    // 🔬 ONLY 9 LAB TEST FIELDS (exclude lifestyle, health status, medical history)
    const LAB_TEST_FIELDS = [
      'serum_creatinine',  // mg/dL
      'gfr',               // mL/min/1.73m²
      'bun',               // mg/dL
      'serum_calcium',     // mg/dL
      'ana',               // boolean
      'c3_c4',             // mg/dL
      'hematuria',         // boolean
      'oxalate_levels',    // mg/day
      'urine_ph'           // pH
    ];

    // Define metric mappings ONLY for lab test fields
    const metricMappings: Record<string, { unit: string }> = {
      serum_creatinine: { unit: 'mg/dL' },
      gfr: { unit: 'mL/min/1.73m²' },
      bun: { unit: 'mg/dL' },
      serum_calcium: { unit: 'mg/dL' },
      ana: { unit: 'boolean' },
      c3_c4: { unit: 'mg/dL' },
      hematuria: { unit: 'boolean' },
      oxalate_levels: { unit: 'mg/day' },
      urine_ph: { unit: 'pH' }
    };

    // Transform ONLY lab test fields to metric objects
    LAB_TEST_FIELDS.forEach((key) => {
      const value = formData[key];
      if (value != null) {
        // Convert value to number
        let numericValue: number;
        if (typeof value === 'number') {
          numericValue = value;
        } else if (typeof value === 'boolean') {
          numericValue = value ? 1 : 0;
        } else if (typeof value === 'string') {
          numericValue = parseFloat(value) || 0;
        } else {
          numericValue = 0;
        }

        metrics.push({
          patientId: patientId,
          metricName: key,
          metricValue: numericValue,
          unit: metricMappings[key].unit,
          measuredAt: measuredAt
        });
      }
    });

    console.log(`✅ Transformed ${metrics.length} lab test metrics (expected: 9)`);
    if (metrics.length !== 9) {
      console.warn(`⚠️ Expected 9 lab test metrics but got ${metrics.length}`);
    }

    return metrics;
  };

  // Validate complete 21-field data structure for backend
  const validateCompleteFormData = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Required numerical fields
    if (!ckdFormData.serum_creatinine || ckdFormData.serum_creatinine <= 0) {
      errors.push('Creatinin huyết thanh không hợp lệ');
    }
    if (!ckdFormData.gfr || ckdFormData.gfr <= 0) {
      errors.push('eGFR không hợp lệ');
    }
    if (!ckdFormData.bun || ckdFormData.bun <= 0) {
      errors.push('BUN không hợp lệ');
    }
    if (!ckdFormData.serum_calcium || ckdFormData.serum_calcium <= 0) {
      errors.push('Canxi huyết thanh không hợp lệ');
    }
    if (!ckdFormData.blood_pressure_systolic || ckdFormData.blood_pressure_systolic <= 0) {
      errors.push('Huyết áp tâm thu không hợp lệ');
    }
    if (!ckdFormData.blood_pressure_diastolic || ckdFormData.blood_pressure_diastolic <= 0) {
      errors.push('Huyết áp tâm trương không hợp lệ');
    }
    if (!ckdFormData.water_intake || ckdFormData.water_intake <= 0) {
      errors.push('Lượng nước uống không hợp lệ');
    }

    // Required categorical fields
    if (!ckdFormData.physical_activity) {
      errors.push('Chưa chọn mức độ hoạt động thể chất');
    }
    if (!ckdFormData.diet) {
      errors.push('Chưa chọn chế độ ăn uống');
    }
    if (!ckdFormData.alcohol) {
      errors.push('Chưa chọn tình trạng uống rượu');
    }
    if (!ckdFormData.weight_changes) {
      errors.push('Chưa chọn thay đổi cân nặng');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Format data for backend API (21 fields matching Swagger schema)
  const formatDataForBackend = () => {
    return {
      // Make sure all values are proper types based on schema
      serum_creatinine: Number(ckdFormData.serum_creatinine) || 1.0,
      gfr: Number(ckdFormData.gfr) || 95.0,
      bun: Number(ckdFormData.bun) || 15.0,
      serum_calcium: Number(ckdFormData.serum_calcium) || 10.0,
      ana: ckdFormData.ana ? 1 : 0,
      c3_c4: Number(ckdFormData.c3_c4) || 130.0,
      hematuria: ckdFormData.hematuria ? 1 : 0,
      oxalate_levels: Number(ckdFormData.oxalate_levels) || 2.0,
      urine_ph: Number(ckdFormData.urine_ph) || 7.0,
      blood_pressure: Number(ckdFormData.blood_pressure_systolic) || 120.0,
      water_intake: Number(ckdFormData.water_intake) || 2.5,
      months: Number(ckdFormData.months) || 6,
      cluster: Number(ckdFormData.cluster) || 1,
      physical_activity: ckdFormData.physical_activity || 'daily',
      diet: ckdFormData.diet || 'balanced',
      smoking: ckdFormData.smoking ? 'yes' : 'no',
      alcohol: ckdFormData.alcohol || 'never',
      painkiller_usage: ckdFormData.painkiller_usage ? 'yes' : 'no',
      family_history: ckdFormData.family_history ? 'yes' : 'no',
      weight_changes: ckdFormData.weight_changes || 'stable',
      stress_level: ckdFormData.stress_level === 1 ? 'low' : ckdFormData.stress_level === 2 ? 'moderate' : 'high'
    };
  };

  // Fetch trend comparison data after successful prediction
  const fetchTrendComparison = async () => {
    setIsLoadingTrend(true);
    setTrendData(null); // Reset previous data

    try {
      console.log('📊 Fetching trend comparison for patient:', user.id);
      const trends = await getPredictCurrentTrends(user.id);
      console.log('✅ Received trend data:', trends);
      setTrendData(trends);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.log('⚠️ Trend comparison not available:', message);

      // Set INSUFFICIENT_HISTORY state if no previous prediction exists
      // This is not an error, just means first prediction
      setTrendData({
        trend: {
          classification: 'INSUFFICIENT_HISTORY',
          stagePrevious: null,
          stageCurrent: null,
          confidenceChange: null,
          metricPrevious: null,
          metricCurrent: null,
          metricChangePct: null,
          metricName: null,
          summary: 'Chưa có dữ liệu lịch sử để so sánh.'
        },
        metricComparisons: []
      });
    } finally {
      setIsLoadingTrend(false);
    }
  };

  const calculateCKDRisk = async () => {
    // First validate the complete form data
    const validation = validateCompleteFormData();

    if (!validation.isValid) {
      alert(`Vui lòng hoàn thiện thông tin:\n${validation.errors.join('\n')}`);
      return;
    }

    setIsCalculatingPrediction(true);

    try {
      // Format data for backend (21 fields matching API schema)
      const backendData = formatDataForBackend();

      console.log('🔬 Sending data to AI service via Gateway:', backendData);
      console.log('🌐 API Endpoint: Gateway:8080 -> /api/v1/analysis/ckd-prediction');

      // Step 1: Call prediction API through Gateway (port 8080)
      const aiResult = await predictCKD(backendData);
      console.log('Received AI prediction result:', aiResult);

      // Parse AI service response and format for UI
      const aiPredictionResult = parseAIServiceResponse(aiResult);

      // Display result to user
      setPredictionResult(aiPredictionResult);
      setCurrentTab(5); // Move to results tab

      // ✅ Step 2: SAVE TO DATABASE immediately (follow Mobile flow)
      try {
        console.log('💾 Saving prediction to database...');

        // Transform 9 lab test metrics to array format
        const healthMetrics = transformHealthMetricsToArray(backendData, user.id);

        // Prepare save request - use parsed stageNumber from prediction result
        const saveRequest = {
          patientId: user.id,
          stage: aiPredictionResult.stageNumber,
          confidence: aiResult.confidence,
          recommendations: aiResult.recommendations || [],
          healthMetrics: healthMetrics
        };

        console.log('📊 Saving with stage:', saveRequest.stage);

        await savePredictHistory(saveRequest);

        console.log('✅ Prediction saved successfully:', {
          stage: saveRequest.stage,
          confidence: saveRequest.confidence,
          metricsCount: healthMetrics.length
        });
      } catch (saveError) {
        console.error('⚠️ Failed to save prediction:', saveError);
        // Don't block user flow, but show warning
        alert('⚠️ Không thể lưu kết quả dự đoán. Dữ liệu có thể không được lưu vào hệ thống.');
      }

      // ✅ Step 3: Fetch trend comparison AFTER save (correct order)
      await fetchTrendComparison();

    } catch (error: unknown) {
      // Show error message to user - NO local fallback calculation
      const message = error instanceof Error ? error.message : String(error);
      console.error('❌ AI prediction service failed:', message);

      alert(
        '❌ Dịch vụ dự đoán AI đang gặp vấn đề.\n\n' +
        'Vui lòng thử lại sau hoặc liên hệ bộ phận hỗ trợ.\n\n' +
        `Chi tiết lỗi: ${message}`
      );

      // Do NOT move to results tab, stay on current form tab
      // User can retry or contact support
    } finally {
      setIsCalculatingPrediction(false);
    }
  };

  // Parse AI service response to our UI format
  const parseAIServiceResponse = (aiResult: any) => {
    console.log('🔍 Parsing AI response:', aiResult);

    // Extract stage NUMBER properly with type checking
    let predictedStage: number;
    if (typeof aiResult.predicted_stage === 'number') {
      predictedStage = aiResult.predicted_stage;
    } else if (typeof aiResult.predicted_stage === 'string') {
      // Extract number from "Stage 3" or "3"
      const match = aiResult.predicted_stage.match(/\d+/);
      predictedStage = match ? parseInt(match[0]) : 3;
    } else {
      predictedStage = aiResult.stage || 3;
    }

    const confidence = aiResult.confidence || 0.5;
    const riskLevel = aiResult.risk_level || 'moderate';
    const stageDescription = aiResult.stage_description || 'Cần đánh giá thêm';
    const recommendations = aiResult.recommendations || [];

    // Convert predicted_stage and risk_level to our UI format
    let risk: 'low' | 'moderate' | 'high';
    let percentage: number;

    // Map based on predicted_stage and risk_level
    if (predictedStage <= 2 || riskLevel === 'low') {
      risk = 'low';
      percentage = Math.round(confidence * 30); // 0-30% for low risk
    } else if (predictedStage >= 4 || riskLevel === 'critical' || riskLevel === 'high') {
      risk = 'high';
      percentage = Math.round(70 + confidence * 25); // 70-95% for high risk
    } else {
      risk = 'moderate';
      percentage = Math.round(30 + confidence * 40); // 30-70% for moderate risk
    }

    // Use the stage_description directly from AI service (already in Vietnamese)
    const formattedStage = stageDescription;

    // Use recommendations directly from AI service (already in Vietnamese)
    const formattedRecommendations = Array.isArray(recommendations)
      ? recommendations.slice(0, 8)
      : [];

    console.log('✅ Parsed result:', {
      risk,
      percentage,
      stage: formattedStage,
      stageNumber: predictedStage,
      recommendations: formattedRecommendations,
      originalStage: predictedStage,
      originalRiskLevel: riskLevel,
      originalConfidence: confidence
    });

    return {
      risk,
      percentage,
      stage: formattedStage,
      stageNumber: predictedStage,
      recommendations: formattedRecommendations
    };
  };

  const nextTab = () => {
    if (currentTab < 4) setCurrentTab(currentTab + 1);
  };
  const prevTab = () => {
    if (currentTab > 1) setCurrentTab(currentTab - 1);
  };
  const resetPrediction = () => {
    setPredictionResult(null);
    setTrendData(null); // Reset trend data
    setCurrentTab(1);
  };
  const validateCurrentTab = (): boolean => {
    switch (currentTab) {
      case 1:
        return ckdFormData.serum_creatinine > 0 && ckdFormData.gfr > 0 && ckdFormData.bun > 0 && ckdFormData.serum_calcium > 0;
      case 2:
        return ckdFormData.blood_pressure_systolic > 0 && ckdFormData.blood_pressure_diastolic > 0 && ckdFormData.water_intake > 0;
      case 3:
        return ckdFormData.physical_activity !== '' && ckdFormData.diet !== '' && ckdFormData.alcohol !== '';
      case 4:
        return ckdFormData.weight_changes !== '';
      default:
        return true;
    }
  };
  const renderCKDPrediction = () => <div className="max-w-6xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white" style={{
      background: "linear-gradient(90deg, oklch(0.546 0.245 262.881) 0%, oklch(0.558 0.288 302.321) 100%)",
      display: "none"
    }}>
        <div className="flex items-center space-x-3 mb-4">
          <Calculator className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold">Dự đoán nguy cơ CKD</h1>
            <p className="text-blue-100">Đánh giá nguy cơ bệnh thận mạn dựa trên 21 yếu tố chính xác</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-4">
            {[1, 2, 3, 4, 5].map(tab => <div key={tab} className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${currentTab === tab ? 'bg-blue-100 text-blue-700' : tab === 5 ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${currentTab === tab ? 'bg-blue-600 text-white' : tab === 5 ? 'bg-purple-600 text-white' : 'bg-gray-400 text-gray-100'}`}>
                  {tab === 5 ? <BarChart3 className="w-3 h-3" /> : tab}
                </div>
                <span className="text-sm font-medium">
                  {tab === 1 && 'Xét nghiệm'}
                  {tab === 2 && 'Sức khỏe'}
                  {tab === 3 && 'Lối sống'}
                  {tab === 4 && 'Tiền sử'}
                  {tab === 5 && 'Kết quả'}
                </span>
              </div>)}
          </div>
          <div className="text-sm text-gray-500">
            Bước {currentTab}/5
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[500px]">
          {/* Tab 1: Lab Results */}
          {currentTab === 1 && <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🔬</span>
                  <h3 className="text-xl font-semibold text-gray-900">Kết quả xét nghiệm gần nhất</h3>
                </div>

                {/* History Dropdown */}
                <div className="relative dropdown-container">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 transition-colors"
                    disabled={panelsLoading || isLoadingPanel}
                  >
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {panelsLoading ? 'Đang tải...' :
                       isLoadingPanel ? 'Đang tải dữ liệu...' :
                       selectedPanel === 'manual' ? 'Nhập thủ công' :
                       selectedPanel ? `${availableDates.find(date => date.id === selectedPanel)?.displayDate || selectedPanel}` :
                       'Chọn từ lịch sử'}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-64 overflow-y-auto">
                      <div className="p-2">
                        {/* Manual Input Option */}
                        <button
                          onClick={() => handleTestSelection('manual')}
                          className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors ${
                            selectedPanel === 'manual' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <div>
                              <div className="font-medium">Nhập thủ công</div>
                              <div className="text-xs text-gray-500">Nhập dữ liệu mới</div>
                            </div>
                          </div>
                        </button>

                        {/* Historical Data Options */}
                        {panelsLoading ? (
                          <div className="px-3 py-2 text-sm text-gray-500 text-center">
                            Đang tải lịch sử...
                          </div>
                        ) : availableDates && availableDates.length > 0 ? (
                          <>
                            <div className="border-t border-gray-100 my-2"></div>
                            {availableDates.map((dateOption) => (
                              <button
                                key={dateOption.id}
                                onClick={() => handleTestSelection(dateOption.id)}
                                className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors ${
                                  selectedPanel === dateOption.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                }`}
                                disabled={isLoadingPanel}
                              >
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <div>
                                    <div className="font-medium">
                                      {dateOption.displayDate}
                                      {dateOption.isLatest && ' (Mới nhất)'}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {dateOption.preview}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </>
                        ) : (
                          <div className="px-3 py-2 text-sm text-gray-500 text-center">
                            Chưa có dữ liệu lịch sử
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Creatinin huyết thanh (mg/dL) *
                    </label>
                    <input type="number" step="0.1" value={ckdFormData.serum_creatinine} onChange={e => setCkdFormData({
                  ...ckdFormData,
                  serum_creatinine: parseFloat(e.target.value)
                })} placeholder="VD: 1.8" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    <small className="text-gray-500">Bình thường: 0.6-1.2 mg/dL</small>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      eGFR (mL/min/1.73m²) *
                    </label>
                    <input type="number" value={ckdFormData.gfr} onChange={e => setCkdFormData({
                  ...ckdFormData,
                  gfr: parseInt(e.target.value)
                })} placeholder="VD: 45" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    <small className="text-gray-500">Bình thường: &gt;90 mL/min/1.73m²</small>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ure máu (BUN) (mg/dL) *
                    </label>
                    <input type="number" value={ckdFormData.bun} onChange={e => setCkdFormData({
                  ...ckdFormData,
                  bun: parseInt(e.target.value)
                })} placeholder="VD: 28" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    <small className="text-gray-500">Bình thường: 7-20 mg/dL</small>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Canxi huyết thanh (mg/dL) *
                    </label>
                    <input type="number" step="0.1" value={ckdFormData.serum_calcium} onChange={e => setCkdFormData({
                  ...ckdFormData,
                  serum_calcium: parseFloat(e.target.value)
                })} placeholder="VD: 9.5" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    <small className="text-gray-500">Bình thường: 8.5-10.5 mg/dL</small>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bổ thể C3/C4 (mg/dL)
                    </label>
                    <input type="number" value={ckdFormData.c3_c4} onChange={e => setCkdFormData({
                  ...ckdFormData,
                  c3_c4: parseInt(e.target.value)
                })} placeholder="VD: 120" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <small className="text-gray-500">Bình thường: 90-180 mg/dL</small>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nồng độ oxalat (mg/day)
                    </label>
                    <input type="number" step="0.1" value={ckdFormData.oxalate_levels} onChange={e => setCkdFormData({
                  ...ckdFormData,
                  oxalate_levels: parseFloat(e.target.value)
                })} placeholder="VD: 2.5" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      pH nước tiểu
                    </label>
                    <input type="number" min="4" max="8" step="0.1" value={ckdFormData.urine_ph} onChange={e => setCkdFormData({
                  ...ckdFormData,
                  urine_ph: parseFloat(e.target.value)
                })} placeholder="VD: 6.0" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <small className="text-gray-500">Bình thường: 4.0-8.0 (4.0 chua - 8.0 kiềm)</small>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ANA
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" checked={ckdFormData.ana} onChange={e => setCkdFormData({
                    ...ckdFormData,
                    ana: e.target.checked
                  })} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="text-sm font-medium text-gray-700">Kháng thể kháng nhân (ANA) dương tính</span>
                    </label>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Đái máu
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" checked={ckdFormData.hematuria} onChange={e => setCkdFormData({
                    ...ckdFormData,
                    hematuria: e.target.checked
                  })} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="text-sm font-medium text-gray-700">Có máu trong nước tiểu</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>}

          {/* Tab 2: Health Status */}
          {currentTab === 2 && <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl">🩺</span>
                <h3 className="text-xl font-semibold text-gray-900">Tình trạng sức khỏe hiện tại</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Huyết áp (mmHg) *
                    </label>
                    <div className="flex items-center space-x-2">
                      <input type="number" value={ckdFormData.blood_pressure_systolic} onChange={e => setCkdFormData({
                    ...ckdFormData,
                    blood_pressure_systolic: parseInt(e.target.value)
                  })} placeholder="120" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                      <span className="text-gray-500">/</span>
                      <input type="number" value={ckdFormData.blood_pressure_diastolic} onChange={e => setCkdFormData({
                    ...ckdFormData,
                    blood_pressure_diastolic: parseInt(e.target.value)
                  })} placeholder="80" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <small className="text-gray-500">Bình thường: &lt;130/80 mmHg</small>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lượng nước uống hàng ngày (L) *
                    </label>
                    <input
                      type="number"
                      min="0.5"
                      max="5"
                      step="0.1"
                      value={ckdFormData.water_intake}
                      onChange={e => setCkdFormData({
                        ...ckdFormData,
                        water_intake: parseFloat(e.target.value)
                      })}
                      placeholder="2.0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <small className="text-gray-500">Khuyến nghị: 2-3L/ngày</small>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thời gian theo dõi bệnh (tháng)
                    </label>
                    <input type="number" value={ckdFormData.months} onChange={e => setCkdFormData({
                  ...ckdFormData,
                  months: parseInt(e.target.value)
                })} placeholder="6" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nhóm phân loại (Cluster)
                    </label>
                    <select value={ckdFormData.cluster} onChange={e => setCkdFormData({
                  ...ckdFormData,
                  cluster: parseInt(e.target.value)
                })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value={0}>Cluster 0 - Nguy cơ thấp</option>
                      <option value={1}>Cluster 1 - Nguy cơ trung bình</option>
                      <option value={2}>Cluster 2 - Nguy cơ cao</option>
                      <option value={3}>Cluster 3 - Nguy cơ rất cao</option>
                      <option value={4}>Cluster 4 - Cần theo dõi đặc biệt</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>}

          {/* Tab 3: Lifestyle */}
          {currentTab === 3 && <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl">🏃‍♂️</span>
                <h3 className="text-xl font-semibold text-gray-900">Thông tin lối sống</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Mức độ hoạt động thể chất *
                    </label>
                    <div className="space-y-2">
                      {[{
                    value: 'daily',
                    label: '🏃 Hàng ngày',
                    desc: 'Tập thể dục mỗi ngày'
                  }, {
                    value: 'weekly',
                    label: '🚶 Hàng tuần',
                    desc: 'Tập 3-4 lần/tuần'
                  }, {
                    value: 'rarely',
                    label: '😴 Hiếm khi',
                    desc: 'Ít vận động'
                  }].map(option => <label key={option.value} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input type="radio" name="physical_activity" value={option.value} checked={ckdFormData.physical_activity === option.value} onChange={e => setCkdFormData({
                      ...ckdFormData,
                      physical_activity: e.target.value as any
                    })} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" required />
                          <div>
                            <div className="font-medium text-gray-900">{option.label}</div>
                            <div className="text-xs text-gray-500">{option.desc}</div>
                          </div>
                        </label>)}
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Chế độ ăn uống *
                    </label>
                    <div className="space-y-2">
                      {[{
                    value: 'high protein',
                    label: '🥩 Nhiều protein',
                    desc: 'Thịt, cá, trứng nhiều'
                  }, {
                    value: 'low salt',
                    label: '🧂 Ít muối',
                    desc: 'Hạn chế muối và sodium'
                  }, {
                    value: 'balanced',
                    label: '⚖️ Cân bằng',
                    desc: 'Đa dạng các nhóm thực phẩm'
                  }].map(option => <label key={option.value} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input type="radio" name="diet" value={option.value} checked={ckdFormData.diet === option.value} onChange={e => setCkdFormData({
                      ...ckdFormData,
                      diet: e.target.value as any
                    })} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" required />
                          <div>
                            <div className="font-medium text-gray-900">{option.label}</div>
                            <div className="text-xs text-gray-500">{option.desc}</div>
                          </div>
                        </label>)}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" checked={ckdFormData.smoking} onChange={e => setCkdFormData({
                    ...ckdFormData,
                    smoking: e.target.checked
                  })} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="text-sm font-medium text-gray-700">🚬 Có hút thuốc</span>
                    </label>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Tình trạng uống rượu *
                    </label>
                    <div className="space-y-2">
                      {[{
                    value: 'daily',
                    label: '🍺 Hàng ngày'
                  }, {
                    value: 'occasionally',
                    label: '🍷 Thỉnh thoảng'
                  }, {
                    value: 'never',
                    label: '❌ Không bao giờ'
                  }].map(option => <label key={option.value} className="flex items-center space-x-3 p-2 hover:bg-gray-50 cursor-pointer">
                          <input type="radio" name="alcohol" value={option.value} checked={ckdFormData.alcohol === option.value} onChange={e => setCkdFormData({
                      ...ckdFormData,
                      alcohol: e.target.value as any
                    })} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" required />
                          <span className="text-sm text-gray-700">{option.label}</span>
                        </label>)}
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" checked={ckdFormData.painkiller_usage} onChange={e => setCkdFormData({
                    ...ckdFormData,
                    painkiller_usage: e.target.checked
                  })} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="text-sm font-medium text-gray-700">💊 Có sử dụng thuốc giảm đau</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>}

          {/* Tab 4: Medical History & Psychology */}
          {currentTab === 4 && <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl">👨‍👩‍👧‍👦</span>
                <h3 className="text-xl font-semibold text-gray-900">Tiền sử bệnh & tình trạng tâm lý</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" checked={ckdFormData.family_history} onChange={e => setCkdFormData({
                    ...ckdFormData,
                    family_history: e.target.checked
                  })} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="text-sm font-medium text-gray-700">👨‍👩‍👧‍👦 Tiền sử gia đình bị suy thận</span>
                    </label>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Thay đổi cân nặng gần đây *
                    </label>
                    <div className="space-y-2">
                      {[{
                    value: 'stable',
                    label: '⚖️ Ổn định',
                    desc: 'Cân nặng không thay đổi'
                  }, {
                    value: 'loss',
                    label: '⬇️ Giảm cân',
                    desc: 'Giảm >5% trong 6 tháng'
                  }, {
                    value: 'gain',
                    label: '⬆️ Tăng cân',
                    desc: 'Tăng >5% trong 6 tháng'
                  }].map(option => <label key={option.value} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input type="radio" name="weight_changes" value={option.value} checked={ckdFormData.weight_changes === option.value} onChange={e => setCkdFormData({
                      ...ckdFormData,
                      weight_changes: e.target.value as any
                    })} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" required />
                          <div>
                            <div className="font-medium text-gray-900">{option.label}</div>
                            <div className="text-xs text-gray-500">{option.desc}</div>
                          </div>
                        </label>)}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Mức độ stress hiện tại *
                    </label>
                    <div className="space-y-2">
                      {[{
                    value: 1,
                    label: '😊 Thấp',
                    desc: 'Cảm thấy bình thường'
                  }, {
                    value: 2,
                    label: '😐 Vừa',
                    desc: 'Thỉnh thoảng cảm thấy căng thẳng'
                  }, {
                    value: 3,
                    label: '😰 Cao',
                    desc: 'Thường xuyên căng thẳng'
                  }].map(option => <label key={option.value} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input type="radio" name="stress_level" value={option.value} checked={ckdFormData.stress_level === option.value} onChange={e => setCkdFormData({
                      ...ckdFormData,
                      stress_level: parseInt(e.target.value)
                    })} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" required />
                          <div>
                            <div className="font-medium text-gray-900">{option.label}</div>
                            <div className="text-xs text-gray-500">{option.desc}</div>
                          </div>
                        </label>)}
                    </div>
                  </div>
                </div>
              </div>
            </div>}

          {/* Tab 5: Results */}
          {currentTab === 5 && predictionResult && <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-6">
                <span className="text-2xl">📊</span>
                <h3 className="text-xl font-semibold text-gray-900">Kết quả dự đoán bệnh thận</h3>
              </div>

              {/* CKD Stage - Color-coded by Severity */}
              <div className={`rounded-2xl shadow-lg p-8 text-white ${
                predictionResult.stageNumber <= 1
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                  : predictionResult.stageNumber === 2
                  ? 'bg-gradient-to-br from-yellow-500 to-amber-600'
                  : predictionResult.stageNumber === 3
                  ? 'bg-gradient-to-br from-orange-500 to-orange-600'
                  : 'bg-gradient-to-br from-red-500 to-red-600'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white/90 mb-2">🏥 TÌNH TRẠNG THẬN CỦA BẠN</p>
                    <div className="flex items-baseline space-x-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-5xl">
                          {predictionResult.stageNumber <= 1
                            ? '🟢'
                            : predictionResult.stageNumber === 2
                            ? '🟡'
                            : predictionResult.stageNumber === 3
                            ? '🟠'
                            : '🔴'}
                        </span>
                        <div>
                          <div className="flex items-baseline space-x-2">
                            <span className="text-6xl font-bold tracking-tight">
                              {predictionResult.stageNumber}
                            </span>
                            <span className="text-2xl font-semibold text-white/90">/ 5</span>
                          </div>
                          <p className="text-sm text-white/80 mt-1">GIAI ĐOẠN</p>
                        </div>
                      </div>
                    </div>
                    <p className="mt-4 text-white/95 font-medium text-lg">
                      {predictionResult.stage}
                    </p>
                    <p className="mt-2 text-sm text-white/80">
                      {predictionResult.stageNumber <= 1
                        ? 'Thận hoạt động tốt (≥90%)'
                        : predictionResult.stageNumber === 2
                        ? 'Thận hoạt động ở mức 60-89%'
                        : predictionResult.stageNumber === 3
                        ? 'Thận hoạt động ở mức 30-59%'
                        : 'Thận hoạt động dưới 30%'}
                    </p>
                  </div>
                  <div className="hidden md:block">
                    <div className="w-32 h-32 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <span className="text-7xl">🏥</span>
                    </div>
                  </div>
                </div>

                {/* Confidence Score */}
                <div className="mt-6 pt-6 border-t border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white/90">Độ chính xác của dự đoán</span>
                    <span className="text-lg font-bold">{predictionResult.percentage}% ✅</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full bg-white transition-all duration-500"
                      style={{ width: `${predictionResult.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Risk Level */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Mức độ nguy cơ</h2>

                  <div className={`p-6 rounded-2xl mb-4 ${predictionResult.risk === 'low' ? 'bg-green-50 border border-green-200' : predictionResult.risk === 'moderate' ? 'bg-yellow-50 border border-yellow-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex items-center space-x-3 mb-3">
                      {predictionResult.risk === 'low' ? <Shield className="w-8 h-8 text-green-600" /> : predictionResult.risk === 'moderate' ? <AlertTriangle className="w-8 h-8 text-yellow-600" /> : <AlertCircle className="w-8 h-8 text-red-600" />}
                      <div>
                        <h3 className={`text-xl font-bold ${predictionResult.risk === 'low' ? 'text-green-800' : predictionResult.risk === 'moderate' ? 'text-yellow-800' : 'text-red-800'}`}>
                          Nguy cơ {predictionResult.risk === 'low' ? 'Thấp' : predictionResult.risk === 'moderate' ? 'Trung bình' : 'Cao'}
                        </h3>
                        <p className={`text-sm ${predictionResult.risk === 'low' ? 'text-green-600' : predictionResult.risk === 'moderate' ? 'text-yellow-600' : 'text-red-600'}`}>
                          Mức độ nguy hiểm của tình trạng hiện tại
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 p-4 bg-white rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Thang đánh giá nguy cơ:</p>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 h-2 rounded-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500"></div>
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-gray-500">
                        <span>Thấp</span>
                        <span>Trung bình</span>
                        <span>Cao</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <span className="text-2xl">💊</span>
                    <span>BẠN NÊN LÀM GÌ?</span>
                  </h3>

                  <ul className="space-y-3">
                    {predictionResult.recommendations.map((rec, index) => <li key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          <span className="text-green-600 font-bold text-lg">✓</span>
                        </div>
                        <span className="text-gray-700 text-sm">{rec}</span>
                      </li>)}
                  </ul>
                </div>
              </div>

              {/* Trend Comparison Section */}
              {isLoadingTrend ? (
                <div className="mt-6 bg-gray-50 border-2 border-gray-200 rounded-xl p-6 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 rounded w-48 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                </div>
              ) : trendData ? (
                trendData.trend.classification === 'INSUFFICIENT_HISTORY' ? (
                  <FirstPredictionBanner />
                ) : (
                  <PredictionTrendCard trendData={trendData} />
                )
              ) : null}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6">
                <button onClick={resetPrediction} className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                  <span>🔄 Làm lại</span>
                </button>
                <button className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                  <FileText className="w-4 h-4" />
                  <span>📄 In kết quả</span>
                </button>
                <button onClick={handleBookAppointment} className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl hover:from-blue-600 hover:to-green-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  <Calendar className="w-4 h-4" />
                  <span>📅 Đặt khám bác sĩ</span>
                </button>
              </div>
            </div>}
        </div>

        {/* Navigation Buttons - Only show for steps 1-4 */}
        {currentTab < 5 && <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <button onClick={prevTab} disabled={currentTab === 1} className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>

            {currentTab < 4 ? <button onClick={nextTab} disabled={!validateCurrentTab()} className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                <span>Tiếp tục</span>
                <ChevronRight className="w-4 h-4" />
              </button> : <button
                onClick={calculateCKDRisk}
                disabled={isCalculatingPrediction}
                className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
              >
                {isCalculatingPrediction ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>🤖 ĐANG XỬ LÝ...</span>
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4" />
                    <span>🔮 DỰ ĐOÁN KẾT QUẢ</span>
                  </>
                )}
              </button>}
          </div>}
      </div>

      {/* Disclaimer */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">Lưu ý quan trọng</p>
            <p className="text-xs text-blue-800 mt-1">
              Kết quả này chỉ mang tính chất tham khảo dựa trên 21 yếu tố khoa học được xác thực. Hệ thống đã kiểm tra tính toàn vẹn của dữ liệu trước khi xử lý. Vui lòng tham khảo ý kiến bác sĩ chuyên khoa để được chẩn đoán và điều trị chính xác.
            </p>
          </div>
        </div>
      </div>
    </div>;
  return <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Simplified Header - NO TABS */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Dự đoán CKD</h1>
            <p className="text-xs text-gray-500">Đánh giá nguy cơ bệnh thận mạn</p>
          </div>
        </div>
      </div>

      {/* Content - ONLY CKD prediction */}
      <div className="flex-1 p-4 lg:p-6 overflow-auto">
        {renderCKDPrediction()}
      </div>
    </div>;
}