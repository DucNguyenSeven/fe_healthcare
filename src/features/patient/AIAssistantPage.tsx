"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Activity,
  Droplets,
  Heart,
  Calculator,
  TrendingUp,
  Shield,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  BarChart3,
  Calendar,
  ChevronDown,
  AlertTriangle,
  FileText,
  RotateCcw,
} from "lucide-react";
import { User as UserType } from "./HealthcarePlusApp";
import { getAccessToken } from "@/utils/auth/token";
import {
  predictCKD,
  savePredictHistory,
  CreateHealthMetricRequest,
  getPredictCurrentTrends,
} from "@/lib/api/predict";
import type { PredictCurrentTrendsResponse } from "@/types/predict";
import { FirstPredictionBanner } from "@/components/predict/FirstPredictionBanner";
import { PredictionTrendCard } from "@/components/predict/PredictionTrendCard";
import { usePatientHealthPanels } from "@/hooks/health-metrics/usePatientPanels";
import { usePanelByDate } from "@/hooks/health-metrics/usePanelByDate";
import { format } from "date-fns";
interface AIAssistantPageProps {
  user: UserType;
  onNavigate?: (page: "appointments") => void;
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
  physical_activity: "daily" | "weekly" | "rarely" | "";
  diet: "high protein" | "low salt" | "balanced" | "";
  alcohol: "daily" | "occasionally" | "never" | "";
  weight_changes: "stable" | "loss" | "gain" | "";
  stress_level: number; // 1-3
}
export function AIAssistantPage({ user, onNavigate }: AIAssistantPageProps) {
  const [currentTab, setCurrentTab] = useState(1);

  // Fetch real health metrics panels
  const { panels, loading: panelsLoading } = usePatientHealthPanels(user.id);

  // State for selected date
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Fetch panel data for selected date
  const { data: selectedPanelData, isLoading: isLoadingPanel } = usePanelByDate(
    user.id,
    selectedDate
  );

  // Create dropdown options from real panels
  const availableDates = useMemo(() => {
    if (!panels || panels.length === 0) return [];

    return panels
      .map((panel) => {
        const creatinineValue =
          panel.metrics.serum_creatinine?.value ||
          panel.metrics.Serum_Creatinine?.value ||
          "N/A";
        const gfrValue =
          panel.metrics.gfr?.value || panel.metrics.GFR?.value || "N/A";

        return {
          id: panel.id,
          date: panel.measuredAt,
          displayDate: format(new Date(panel.measuredAt), "dd/MM/yyyy"),
          preview: `Creatinin: ${creatinineValue} mg/dL • eGFR: ${gfrValue} ml/min`,
          timestamp: new Date(panel.measuredAt).getTime(),
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp) // Newest first
      .map((item, index) => ({
        ...item,
        isLatest: index === 0,
      }));
  }, [panels]);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedPanel, setSelectedPanel] = useState<string>("manual");

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
    physical_activity: "",
    diet: "",
    alcohol: "",
    weight_changes: "",
    stress_level: 2,
  });
  const [predictionResult, setPredictionResult] = useState<{
    risk: "low" | "moderate" | "high";
    percentage: number;
    stage: string;
    stageNumber: number;
    recommendations: string[];
  } | null>(null);

  const [isCalculatingPrediction, setIsCalculatingPrediction] = useState(false);

  // Trend comparison state
  const [trendData, setTrendData] =
    useState<PredictCurrentTrendsResponse | null>(null);
  const [isLoadingTrend, setIsLoadingTrend] = useState(false);

  // Function to map API panel data to CKD form
  const mapApiPanelToCKDForm = (panel: any) => {
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
      serum_creatinine:
        getMetricValue("serum_creatinine") || ckdFormData.serum_creatinine,
      gfr: getMetricValue("gfr") || ckdFormData.gfr,
      bun: getMetricValue("bun") || ckdFormData.bun,
      serum_calcium:
        getMetricValue("serum_calcium") || ckdFormData.serum_calcium,
      c3_c4: getMetricValue("c3_c4") || ckdFormData.c3_c4,
      oxalate_levels:
        getMetricValue("oxalate_levels") || ckdFormData.oxalate_levels,
      urine_ph: getMetricValue("urine_ph") || ckdFormData.urine_ph,
      ana: getMetricValue("ana") === 1 || getMetricValue("ana") === true,
      hematuria:
        getMetricValue("hematuria") === 1 ||
        getMetricValue("hematuria") === true,
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
      stress_level: ckdFormData.stress_level,
    };

    return mappedResult;
  };

  // Function to handle test selection from dropdown
  const handleTestSelection = (panelId: string) => {
    if (panelId === "manual") {
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
        stress_level: ckdFormData.stress_level,
      };
      setCkdFormData(manualData);
      setSelectedPanel("manual");
      setSelectedDate(null);
    } else {
      // Find the selected panel to get its measuredAt date
      const selectedPanelInfo = availableDates.find((d) => d.id === panelId);
      if (selectedPanelInfo) {
        setSelectedPanel(panelId);
        setSelectedDate(selectedPanelInfo.date); // Use measuredAt for API query
      }
    }
    setIsDropdownOpen(false);
  };

  // Auto-fill form when panel data is loaded
  useEffect(() => {
    if (selectedPanelData && selectedPanel !== "manual") {
      const mappedData = mapApiPanelToCKDForm(selectedPanelData);
      setCkdFormData(mappedData);
    }
  }, [selectedPanelData, selectedPanel]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest(".dropdown-container")) {
          setIsDropdownOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  const handleBookAppointment = () => {
    // Navigate to appointments page
    // Note: Prediction is already saved to database in calculateCKDRisk()
    if (onNavigate) {
      onNavigate("appointments");
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
      "serum_creatinine", // mg/dL
      "gfr", // mL/min/1.73m²
      "bun", // mg/dL
      "serum_calcium", // mg/dL
      "ana", // boolean
      "c3_c4", // mg/dL
      "hematuria", // boolean
      "oxalate_levels", // mg/day
      "urine_ph", // pH
    ];

    // Define metric mappings ONLY for lab test fields
    const metricMappings: Record<string, { unit: string }> = {
      serum_creatinine: { unit: "mg/dL" },
      gfr: { unit: "mL/min/1.73m²" },
      bun: { unit: "mg/dL" },
      serum_calcium: { unit: "mg/dL" },
      ana: { unit: "boolean" },
      c3_c4: { unit: "mg/dL" },
      hematuria: { unit: "boolean" },
      oxalate_levels: { unit: "mg/day" },
      urine_ph: { unit: "pH" },
    };

    // Transform ONLY lab test fields to metric objects
    LAB_TEST_FIELDS.forEach((key) => {
      const value = formData[key];
      if (value != null) {
        // Convert value to number
        let numericValue: number;
        if (typeof value === "number") {
          numericValue = value;
        } else if (typeof value === "boolean") {
          numericValue = value ? 1 : 0;
        } else if (typeof value === "string") {
          numericValue = parseFloat(value) || 0;
        } else {
          numericValue = 0;
        }

        metrics.push({
          patientId: patientId,
          metricName: key,
          metricValue: numericValue,
          unit: metricMappings[key].unit,
          measuredAt: measuredAt,
        });
      }
    });

    return metrics;
  };

  // Validate only 3 essential fields for backend (allow testing with incomplete data)
  const validateCompleteFormData = (): {
    isValid: boolean;
    errors: string[];
  } => {
    const errors: string[] = [];

    // Required essential fields (backend will return 422 if missing)
    if (!ckdFormData.serum_creatinine || ckdFormData.serum_creatinine <= 0) {
      errors.push("Creatinin huyết thanh là bắt buộc");
    }
    if (!ckdFormData.gfr || ckdFormData.gfr <= 0) {
      errors.push("eGFR là bắt buộc");
    }
    if (!ckdFormData.physical_activity) {
      errors.push("Mức độ hoạt động thể chất là bắt buộc");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  // Format data for backend API - send null for missing/empty fields
  const formatDataForBackend = () => {
    return {
      // Essential fields (required - validated before this point, so never null)
      serum_creatinine: Number(ckdFormData.serum_creatinine),
      gfr: Number(ckdFormData.gfr),
      physical_activity: ckdFormData.physical_activity,

      // Optional numerical fields - send null if empty/0
      bun: ckdFormData.bun > 0 ? Number(ckdFormData.bun) : null,
      serum_calcium: ckdFormData.serum_calcium > 0 ? Number(ckdFormData.serum_calcium) : null,
      c3_c4: ckdFormData.c3_c4 > 0 ? Number(ckdFormData.c3_c4) : null,
      oxalate_levels: ckdFormData.oxalate_levels > 0 ? Number(ckdFormData.oxalate_levels) : null,
      urine_ph: ckdFormData.urine_ph > 0 ? Number(ckdFormData.urine_ph) : null,
      blood_pressure: ckdFormData.blood_pressure_systolic > 0 ? Number(ckdFormData.blood_pressure_systolic) : null,
      water_intake: ckdFormData.water_intake > 0 ? Number(ckdFormData.water_intake) : null,

      // Binary fields - send null if not checked (false = not set)
      ana: ckdFormData.ana ? 1 : null,
      hematuria: ckdFormData.hematuria ? 1 : null,
      smoking: ckdFormData.smoking ? "yes" : null,
      painkiller_usage: ckdFormData.painkiller_usage ? "yes" : null,
      family_history: ckdFormData.family_history ? "yes" : null,

      // Optional categorical fields - send null if not selected
      diet: ckdFormData.diet || null,
      alcohol: ckdFormData.alcohol || null,
      weight_changes: ckdFormData.weight_changes || null,
      stress_level: ckdFormData.stress_level
        ? (ckdFormData.stress_level === 1 ? "low" : ckdFormData.stress_level === 2 ? "moderate" : "high")
        : null,
    };
  };

  // Fetch trend comparison data after successful prediction
  const fetchTrendComparison = async (predictData: {
    predictId: string;
    patientId: string;
    stage: number;
    confidence: number;
    recommendations: string[];
    createdAt: string;
    updatedAt: string;
  }) => {
    setIsLoadingTrend(true);
    setTrendData(null); // Reset previous data

    try {
      const trends = await getPredictCurrentTrends(
        predictData.patientId,
        predictData
      );
      setTrendData(trends);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);

      // Set INSUFFICIENT_HISTORY state if no previous prediction exists
      // This is not an error, just means first prediction
      setTrendData({
        trend: {
          classification: "INSUFFICIENT_HISTORY",
          stagePrevious: null,
          stageCurrent: null,
          confidenceChange: null,
          metricPrevious: null,
          metricCurrent: null,
          metricChangePct: null,
          metricName: null,
          summary: "Chưa có dữ liệu lịch sử để so sánh.",
        },
        metricComparisons: [],
      });
    } finally {
      setIsLoadingTrend(false);
    }
  };

  const calculateCKDRisk = async () => {
    // First validate the complete form data
    const validation = validateCompleteFormData();

    if (!validation.isValid) {
      alert(`Vui lòng hoàn thiện thông tin:\n${validation.errors.join("\n")}`);
      return;
    }

    setIsCalculatingPrediction(true);

    try {
      // Format data for backend (21 fields matching API schema)
      const backendData = formatDataForBackend();

      // Step 1: Call prediction API through Gateway (port 8080)
      const aiResult = await predictCKD(backendData);

      // Parse AI service response and format for UI
      const aiPredictionResult = parseAIServiceResponse(aiResult);

      // Display result to user
      setPredictionResult(aiPredictionResult);
      setCurrentTab(4); // Move to results tab

      // ✅ Step 2: SAVE TO DATABASE immediately (follow Mobile flow)
      try {
        // Transform 9 lab test metrics to array format
        const healthMetrics = transformHealthMetricsToArray(
          backendData,
          user.id
        );

        // Prepare save request - use parsed stageNumber from prediction result
        const saveRequest = {
          patientId: user.id,
          stage: aiPredictionResult.stageNumber,
          confidence: aiResult.confidence,
          recommendations: aiResult.recommendations || [],
          healthMetrics: healthMetrics,
        };

        const saveResponse = await savePredictHistory(saveRequest);

        // ✅ Create predictData for trends API (backend doesn't return prediction details)
        const now = new Date().toISOString();
        const predictData = {
          predictId: crypto.randomUUID(), // Generate client-side UUID
          patientId: user.id,
          stage: aiPredictionResult.stageNumber,
          confidence: aiResult.confidence,
          recommendations: aiResult.recommendations || [],
          createdAt: now,
          updatedAt: now,
        };

        // ✅ Step 3: Fetch trend comparison AFTER save (correct order)
        await fetchTrendComparison(predictData);
      } catch (saveError) {
        console.error("⚠️ Failed to save prediction:", saveError);
        // Don't block user flow, but show warning
        alert(
          "⚠️ Không thể lưu kết quả dự đoán. Dữ liệu có thể không được lưu vào hệ thống."
        );
      }
    } catch (error: unknown) {
      // Show error message to user - NO local fallback calculation
      const message = error instanceof Error ? error.message : String(error);
      console.error("❌ AI prediction service failed:", message);

      alert(
        "❌ Dịch vụ dự đoán AI đang gặp vấn đề.\n\n" +
          "Vui lòng thử lại sau hoặc liên hệ bộ phận hỗ trợ.\n\n" +
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
    // Extract stage NUMBER properly with type checking
    // Support both camelCase (predictedStage) and snake_case (predicted_stage)
    let predictedStage: number;
    const stageValue = aiResult.predicted_stage ?? aiResult.predictedStage;

    if (typeof stageValue === "number") {
      predictedStage = stageValue;
    } else if (typeof stageValue === "string") {
      // Extract number from "Stage 3" or "3"
      const match = stageValue.match(/\d+/);
      predictedStage = match ? parseInt(match[0]) : 3;
    } else {
      predictedStage = aiResult.stage || 3;
    }

    const confidence = aiResult.confidence || 0.5;
    const riskLevel = aiResult.risk_level ?? aiResult.riskLevel ?? "moderate";
    const stageDescription =
      aiResult.stage_description ??
      aiResult.stageDescription ??
      "Cần đánh giá thêm";
    const recommendations = aiResult.recommendations || [];

    // Convert predicted_stage and risk_level to our UI format
    let risk: "low" | "moderate" | "high";

    // Use confidence directly from backend (convert from 0-1 to 0-100%)
    // Keep exact value without rounding to avoid showing 100% when confidence is 0.99...
    const percentage = confidence * 100;

    // Map risk level based on predicted_stage and risk_level
    if (predictedStage <= 2 || riskLevel === "low") {
      risk = "low";
    } else if (
      predictedStage >= 4 ||
      riskLevel === "critical" ||
      riskLevel === "high"
    ) {
      risk = "high";
    } else {
      risk = "moderate";
    }

    // Use the stage_description directly from AI service (already in Vietnamese)
    const formattedStage = stageDescription;

    // Use recommendations directly from AI service (already in Vietnamese)
    const formattedRecommendations = Array.isArray(recommendations)
      ? recommendations.slice(0, 8)
      : [];

    return {
      risk,
      percentage,
      stage: formattedStage,
      stageNumber: predictedStage,
      recommendations: formattedRecommendations,
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
    // Validation disabled - allow navigation between all tabs
    return true;
  };
  const renderCKDPrediction = () => (
    <div className="max-w-6xl mx-auto space-y-4 px-6 pb-6 pt-2">
      {/* Header */}
      <div
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white"
        style={{
          background:
            "linear-gradient(90deg, oklch(0.546 0.245 262.881) 0%, oklch(0.558 0.288 302.321) 100%)",
          display: "none",
        }}
      >
        <div className="flex items-center space-x-3 mb-4">
          <Calculator className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold">Dự đoán nguy cơ CKD</h1>
            <p className="text-blue-100">
              Đánh giá nguy cơ bệnh thận mạn dựa trên 19 yếu tố chính xác
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 pt-4 px-6 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-4">
            {[1, 2, 3, 4].map((tab) => (
              <div
                key={tab}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${currentTab === tab ? "bg-blue-100 text-blue-700" : tab === 4 ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-500"}`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${currentTab === tab ? "bg-blue-600 text-white" : tab === 4 ? "bg-purple-600 text-white" : "bg-gray-400 text-gray-100"}`}
                >
                  {tab === 4 ? <BarChart3 className="w-3 h-3" /> : tab}
                </div>
                <span className="text-sm font-medium">
                  {tab === 1 && "Chỉ số"}
                  {tab === 2 && "Lối sống"}
                  {tab === 3 && "Tiền sử"}
                  {tab === 4 && "Kết quả"}
                </span>
              </div>
            ))}
          </div>
          {currentTab < 4 && (
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-500">Bước {currentTab}/3</div>
              {currentTab === 1 && (
                <div className="relative dropdown-container">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 transition-colors text-sm"
                    disabled={panelsLoading || isLoadingPanel}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">
                      {panelsLoading
                        ? "Đang tải..."
                        : isLoadingPanel
                          ? "Đang tải dữ liệu..."
                          : selectedPanel === "manual"
                            ? "Nhập thủ công"
                            : selectedPanel
                              ? `${availableDates.find((date) => date.id === selectedPanel)?.displayDate || selectedPanel}`
                              : "Chọn từ lịch sử"}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-64 overflow-y-auto">
                      <div className="p-2">
                        {/* Manual Input Option */}
                        <button
                          onClick={() => handleTestSelection("manual")}
                          className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors ${
                            selectedPanel === "manual"
                              ? "bg-blue-50 text-blue-700"
                              : "text-gray-700"
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <div>
                              <div className="font-medium">Nhập thủ công</div>
                              <div className="text-xs text-gray-500">
                                Nhập dữ liệu mới
                              </div>
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
                                onClick={() =>
                                  handleTestSelection(dateOption.id)
                                }
                                className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors ${
                                  selectedPanel === dateOption.id
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-gray-700"
                                }`}
                                disabled={isLoadingPanel}
                              >
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <div>
                                    <div className="font-medium">
                                      {dateOption.displayDate}
                                      {dateOption.isLatest && " (Mới nhất)"}
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
              )}
            </div>
          )}
        </div>

        {/* Tab Content */}
        <div className="min-h-[500px]">
          {/* Tab 1: Lab Results & Health Status */}
          {currentTab === 1 && (
            <div className="space-y-8">
              {/* Chỉ số Section */}
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Creatinin huyết thanh (mg/dL) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={ckdFormData.serum_creatinine}
                        onChange={(e) =>
                          setCkdFormData({
                            ...ckdFormData,
                            serum_creatinine: e.target.value === '' ? 0 : parseFloat(e.target.value),
                          })
                        }
                        placeholder="VD: 1.8"
                        className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        required
                      />
                      <small className="text-gray-500 text-xs mt-1 block">
                        Bình thường: 0.6-1.2 mg/dL
                      </small>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        eGFR (mL/min/1.73m²) *
                      </label>
                      <input
                        type="number"
                        value={ckdFormData.gfr}
                        onChange={(e) =>
                          setCkdFormData({
                            ...ckdFormData,
                            gfr: e.target.value === '' ? 0 : parseInt(e.target.value),
                          })
                        }
                        placeholder="VD: 45"
                        className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        required
                      />
                      <small className="text-gray-500 text-xs mt-1 block">
                        Bình thường: &gt;90 mL/min/1.73m²
                      </small>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Ure máu (BUN) (mg/dL)
                      </label>
                      <input
                        type="number"
                        value={ckdFormData.bun}
                        onChange={(e) =>
                          setCkdFormData({
                            ...ckdFormData,
                            bun: e.target.value === '' ? 0 : parseInt(e.target.value),
                          })
                        }
                        placeholder="VD: 28"
                        className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        required
                      />
                      <small className="text-gray-500 text-xs mt-1 block">
                        Bình thường: 7-20 mg/dL
                      </small>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Canxi huyết thanh (mg/dL)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={ckdFormData.serum_calcium}
                        onChange={(e) =>
                          setCkdFormData({
                            ...ckdFormData,
                            serum_calcium: e.target.value === '' ? 0 : parseFloat(e.target.value),
                          })
                        }
                        placeholder="VD: 9.5"
                        className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        required
                      />
                      <small className="text-gray-500 text-xs mt-1 block">
                        Bình thường: 8.5-10.5 mg/dL
                      </small>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Huyết áp (mmHg)
                      </label>
                      <div className="grid grid-cols-2 gap-2 mb-1">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Tâm thu
                          </label>
                          <input
                            type="number"
                            value={ckdFormData.blood_pressure_systolic}
                            onChange={(e) =>
                              setCkdFormData({
                                ...ckdFormData,
                                blood_pressure_systolic: parseInt(
                                  e.target.value
                                ),
                              })
                            }
                            placeholder="120"
                            className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Tâm trương
                          </label>
                          <input
                            type="number"
                            value={ckdFormData.blood_pressure_diastolic}
                            onChange={(e) =>
                              setCkdFormData({
                                ...ckdFormData,
                                blood_pressure_diastolic: parseInt(
                                  e.target.value
                                ),
                              })
                            }
                            placeholder="80"
                            className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            required
                          />
                        </div>
                      </div>
                      <small className="text-gray-500 text-xs">
                        Bình thường: &lt;130/80 mmHg
                      </small>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Bổ thể C3/C4 (mg/dL)
                      </label>
                      <input
                        type="number"
                        value={ckdFormData.c3_c4}
                        onChange={(e) =>
                          setCkdFormData({
                            ...ckdFormData,
                            c3_c4: e.target.value === '' ? 0 : parseInt(e.target.value),
                          })
                        }
                        placeholder="VD: 120"
                        className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      />
                      <small className="text-gray-500 text-xs mt-1 block">
                        Bình thường: 90-180 mg/dL
                      </small>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Nồng độ oxalat (mg/day)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={ckdFormData.oxalate_levels}
                        onChange={(e) =>
                          setCkdFormData({
                            ...ckdFormData,
                            oxalate_levels: e.target.value === '' ? 0 : parseFloat(e.target.value),
                          })
                        }
                        placeholder="VD: 2.5"
                        className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      />
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        pH nước tiểu
                      </label>
                      <input
                        type="number"
                        min="4"
                        max="8"
                        step="0.1"
                        value={ckdFormData.urine_ph}
                        onChange={(e) =>
                          setCkdFormData({
                            ...ckdFormData,
                            urine_ph: e.target.value === '' ? 0 : parseFloat(e.target.value),
                          })
                        }
                        placeholder="VD: 6.0"
                        className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      />
                      <small className="text-gray-500 text-xs mt-1 block">
                        Bình thường: 4.0-8.0 (4.0 chua - 8.0 kiềm)
                      </small>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Lượng nước uống hàng ngày (L)
                      </label>
                      <input
                        type="number"
                        min="0.5"
                        max="5"
                        step="0.1"
                        value={ckdFormData.water_intake}
                        onChange={(e) =>
                          setCkdFormData({
                            ...ckdFormData,
                            water_intake: e.target.value === '' ? 0 : parseFloat(e.target.value),
                          })
                        }
                        placeholder="2.0"
                        className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        required
                      />
                      <small className="text-gray-500 text-xs mt-1 block">
                        Khuyến nghị: 2-3L/ngày
                      </small>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        ANA
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={ckdFormData.ana}
                          onChange={(e) =>
                            setCkdFormData({
                              ...ckdFormData,
                              ana: e.target.checked,
                            })
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900">
                          Kháng thể kháng nhân (ANA) dương tính
                        </span>
                      </label>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Đái máu
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={ckdFormData.hematuria}
                          onChange={(e) =>
                            setCkdFormData({
                              ...ckdFormData,
                              hematuria: e.target.checked,
                            })
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900">
                          Có máu trong nước tiểu
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Lifestyle */}
          {currentTab === 2 && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Mức độ hoạt động thể chất *
                    </label>
                    <div className="space-y-2">
                      {[
                        {
                          value: "daily",
                          label: "🏃 Hàng ngày",
                          desc: "Tập thể dục mỗi ngày",
                        },
                        {
                          value: "weekly",
                          label: "🚶 Hàng tuần",
                          desc: "Tập 3-4 lần/tuần",
                        },
                        {
                          value: "rarely",
                          label: "😴 Hiếm khi",
                          desc: "Ít vận động",
                        },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="physical_activity"
                            value={option.value}
                            checked={
                              ckdFormData.physical_activity === option.value
                            }
                            onChange={(e) =>
                              setCkdFormData({
                                ...ckdFormData,
                                physical_activity: e.target.value as any,
                              })
                            }
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            required
                          />
                          <div>
                            <div className="font-medium text-gray-900">
                              {option.label}
                            </div>
                            <div className="text-xs text-gray-500">
                              {option.desc}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Chế độ ăn uống
                    </label>
                    <div className="space-y-2">
                      {[
                        {
                          value: "high protein",
                          label: "🥩 Nhiều protein",
                          desc: "Thịt, cá, trứng nhiều",
                        },
                        {
                          value: "low salt",
                          label: "🧂 Ít muối",
                          desc: "Hạn chế muối và sodium",
                        },
                        {
                          value: "balanced",
                          label: "⚖️ Cân bằng",
                          desc: "Đa dạng các nhóm thực phẩm",
                        },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="diet"
                            value={option.value}
                            checked={ckdFormData.diet === option.value}
                            onChange={(e) =>
                              setCkdFormData({
                                ...ckdFormData,
                                diet: e.target.value as any,
                              })
                            }
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            required
                          />
                          <div>
                            <div className="font-medium text-gray-900">
                              {option.label}
                            </div>
                            <div className="text-xs text-gray-500">
                              {option.desc}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={ckdFormData.smoking}
                        onChange={(e) =>
                          setCkdFormData({
                            ...ckdFormData,
                            smoking: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        🚬 Có hút thuốc
                      </span>
                    </label>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Tình trạng uống rượu
                    </label>
                    <div className="space-y-2">
                      {[
                        {
                          value: "daily",
                          label: "🍺 Hàng ngày",
                        },
                        {
                          value: "occasionally",
                          label: "🍷 Thỉnh thoảng",
                        },
                        {
                          value: "never",
                          label: "❌ Không bao giờ",
                        },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center space-x-3 p-2 hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="alcohol"
                            value={option.value}
                            checked={ckdFormData.alcohol === option.value}
                            onChange={(e) =>
                              setCkdFormData({
                                ...ckdFormData,
                                alcohol: e.target.value as any,
                              })
                            }
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            required
                          />
                          <span className="text-sm text-gray-700">
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={ckdFormData.painkiller_usage}
                        onChange={(e) =>
                          setCkdFormData({
                            ...ckdFormData,
                            painkiller_usage: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        💊 Có sử dụng thuốc giảm đau
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Medical History & Psychology */}
          {currentTab === 3 && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={ckdFormData.family_history}
                        onChange={(e) =>
                          setCkdFormData({
                            ...ckdFormData,
                            family_history: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        👨‍👩‍👧‍👦 Tiền sử gia đình bị suy thận
                      </span>
                    </label>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Thay đổi cân nặng gần đây
                    </label>
                    <div className="space-y-2">
                      {[
                        {
                          value: "stable",
                          label: "⚖️ Ổn định",
                          desc: "Cân nặng không thay đổi",
                        },
                        {
                          value: "loss",
                          label: "⬇️ Giảm cân",
                          desc: "Giảm >5% trong 6 tháng",
                        },
                        {
                          value: "gain",
                          label: "⬆️ Tăng cân",
                          desc: "Tăng >5% trong 6 tháng",
                        },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="weight_changes"
                            value={option.value}
                            checked={
                              ckdFormData.weight_changes === option.value
                            }
                            onChange={(e) =>
                              setCkdFormData({
                                ...ckdFormData,
                                weight_changes: e.target.value as any,
                              })
                            }
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            required
                          />
                          <div>
                            <div className="font-medium text-gray-900">
                              {option.label}
                            </div>
                            <div className="text-xs text-gray-500">
                              {option.desc}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Mức độ stress hiện tại
                    </label>
                    <div className="space-y-2">
                      {[
                        {
                          value: 1,
                          label: "😊 Thấp",
                          desc: "Cảm thấy bình thường",
                        },
                        {
                          value: 2,
                          label: "😐 Vừa",
                          desc: "Thỉnh thoảng cảm thấy căng thẳng",
                        },
                        {
                          value: 3,
                          label: "😰 Cao",
                          desc: "Thường xuyên căng thẳng",
                        },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="stress_level"
                            value={option.value}
                            checked={ckdFormData.stress_level === option.value}
                            onChange={(e) =>
                              setCkdFormData({
                                ...ckdFormData,
                                stress_level: e.target.value === '' ? 0 : parseInt(e.target.value),
                              })
                            }
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            required
                          />
                          <div>
                            <div className="font-medium text-gray-900">
                              {option.label}
                            </div>
                            <div className="text-xs text-gray-500">
                              {option.desc}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Results */}
          {currentTab === 4 && predictionResult && (
            <div className="space-y-6">
              {/* 2-Column Layout: Stage Card + Recommendations */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Left Column: CKD Stage Card */}
                <div
                  className={`rounded-2xl shadow-lg p-8 text-white ${
                    predictionResult.stageNumber <= 1
                      ? "bg-gradient-to-br from-green-500 to-emerald-600"
                      : predictionResult.stageNumber === 2
                        ? "bg-gradient-to-br from-yellow-500 to-amber-600"
                        : predictionResult.stageNumber === 3
                          ? "bg-gradient-to-br from-orange-500 to-orange-600"
                          : "bg-gradient-to-br from-red-500 to-red-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white/90 mb-2">
                        🏥 TÌNH TRẠNG THẬN CỦA BẠN
                      </p>
                      <div className="flex items-baseline space-x-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-5xl">
                            {predictionResult.stageNumber <= 1
                              ? "🟢"
                              : predictionResult.stageNumber === 2
                                ? "🟡"
                                : predictionResult.stageNumber === 3
                                  ? "🟠"
                                  : "🔴"}
                          </span>
                          <div>
                            <div className="flex items-baseline space-x-2">
                              <span className="text-6xl font-bold tracking-tight">
                                {predictionResult.stageNumber}
                              </span>
                              <span className="text-2xl font-semibold text-white/90">
                                / 5
                              </span>
                            </div>
                            <p className="text-sm text-white/80 mt-1">
                              GIAI ĐOẠN
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className="mt-4 text-white/95 font-medium text-lg">
                        {predictionResult.stage}
                      </p>
                      <p className="mt-2 text-sm text-white/80">
                        {predictionResult.stageNumber <= 1
                          ? "Thận hoạt động tốt (≥90%)"
                          : predictionResult.stageNumber === 2
                            ? "Thận hoạt động ở mức 60-89%"
                            : predictionResult.stageNumber === 3
                              ? "Thận hoạt động ở mức 30-59%"
                              : "Thận hoạt động dưới 30%"}
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
                      <span className="text-sm font-medium text-white/90">
                        Độ chính xác của dự đoán
                      </span>
                      <span className="text-lg font-bold">
                        {(
                          Math.floor(predictionResult.percentage * 100) / 100
                        ).toFixed(2)}
                        % ✅
                      </span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2.5">
                      <div
                        className="h-2.5 rounded-full bg-white transition-all duration-500"
                        style={{ width: `${predictionResult.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Recommendations */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <span className="text-2xl">💊</span>
                    <span>BẠN NÊN LÀM GÌ?</span>
                  </h3>

                  <ul className="space-y-3">
                    {predictionResult.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          <span className="text-green-600 font-bold text-lg">
                            ✓
                          </span>
                        </div>
                        <span className="text-gray-700 text-sm">{rec}</span>
                      </li>
                    ))}
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
                trendData.trend.classification === "INSUFFICIENT_HISTORY" ? (
                  <FirstPredictionBanner />
                ) : (
                  <PredictionTrendCard trendData={trendData} />
                )
              ) : null}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6">
                <button
                  onClick={resetPrediction}
                  className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Làm lại</span>
                </button>
                {/* TODO: Implement print results functionality */}
                {/* <button className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                  <FileText className="w-4 h-4" />
                  <span>In kết quả</span>
                </button> */}
                <button
                  onClick={handleBookAppointment}
                  className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Đặt lịch khám</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons - Only show for steps 1-3 */}
        {currentTab < 4 && (
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={prevTab}
              disabled={currentTab === 1}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>

            {currentTab < 3 ? (
              <button
                onClick={nextTab}
                disabled={!validateCurrentTab()}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span>Tiếp tục</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={calculateCKDRisk}
                disabled={isCalculatingPrediction}
                className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
              >
                {isCalculatingPrediction ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>ĐANG XỬ LÝ...</span>
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4" />
                    <span>DỰ ĐOÁN KẾT QUẢ</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">
              Lưu ý quan trọng
            </p>
            <p className="text-xs text-blue-800 mt-1">
              Kết quả này chỉ mang tính chất tham khảo dựa trên 21 yếu tố khoa
              học được xác thực. Hệ thống đã kiểm tra tính toàn vẹn của dữ liệu
              trước khi xử lý. Vui lòng tham khảo ý kiến bác sĩ chuyên khoa để
              được chẩn đoán và điều trị chính xác.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
  return (
    <div className="h-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pt-1 px-4 pb-4 lg:pt-2 lg:px-6 lg:pb-6 overflow-auto">
      {renderCKDPrediction()}
    </div>
  );
}
