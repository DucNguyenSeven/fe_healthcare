"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Upload, FileText, Clock, Trash2, MessageCircle, AlertTriangle, Activity, Droplets, Heart, Calculator, TrendingUp, Shield, AlertCircle, ChevronRight, ChevronLeft, BarChart3, Calendar, ChevronDown } from 'lucide-react';
import { User as UserType } from './HealthcarePlusApp';
import { getAccessToken } from '@/utils/auth/token';
import { useWebSocketChat } from '@/contexts/WebSocketChatContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { predictCKD, savePredictHistory, CreateHealthMetricRequest } from '@/lib/api/predict';
interface AIAssistantPageProps {
  user: UserType;
  onNavigate?: (page: 'appointments') => void;
}
type AIView = 'chat' | 'upload' | 'history' | 'ckd-prediction';
interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  type?: 'text' | 'suggestion';
}
interface ChatHistory {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  messageCount: number;
}
interface UploadAnalysis {
  id: string;
  fileName: string;
  uploadDate: string;
  status: 'processing' | 'completed' | 'error';
  summary?: string;
  abnormalities?: string[];
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
  const [currentView, setCurrentView] = useState<AIView>('chat');
  const [currentTab, setCurrentTab] = useState(1);

  // Mock data for 3 fixed dates (updated with real data from table)
  const mockTestDates = [
    {
      id: '20/9/2025',
      date: '20/9/2025',
      apiDate: '2025-09-20',
      preview: 'Creatinin: 8 mg/dL • eGFR: 12 ml/min',
      // Mock API response structure for testing
      mockData: {
        measuredAt: '2025-09-20',
        metrics: [
          { name: 'serum_creatinine', value: 8, unit: 'mg/dL' },
          { name: 'gfr', value: 12, unit: 'ml/min' },
          { name: 'bun', value: 80, unit: 'mg/dL' },
          { name: 'serum_calcium', value: 8, unit: 'mg/dL' },
          { name: 'ana', value: 1, unit: '0|1' },
          { name: 'c3_c4', value: 90, unit: 'mg/dL' },
          { name: 'hematuria', value: 1, unit: '0|1' },
          { name: 'oxalate_levels', value: 5, unit: 'mg/day' },
          { name: 'urine_ph', value: 5.5, unit: 'pH' }
        ]
      }
    },
    {
      id: '18/9/2025',
      date: '18/9/2025',
      apiDate: '2025-09-18',
      preview: 'Creatinin: 1 mg/dL • eGFR: 10 ml/min',
      mockData: {
        measuredAt: '2025-09-18',
        metrics: [
          { name: 'serum_creatinine', value: 1, unit: 'mg/dL' },
          { name: 'gfr', value: 10, unit: 'ml/min' },
          { name: 'bun', value: 15, unit: 'mg/dL' },
          { name: 'serum_calcium', value: 1, unit: 'mg/dL' },
          { name: 'ana', value: 1, unit: '0|1' },
          { name: 'c3_c4', value: 142, unit: 'mg/dL' },
          { name: 'hematuria', value: 1, unit: '0|1' },
          { name: 'oxalate_levels', value: 42, unit: 'mg/day' },
          { name: 'urine_ph', value: 7, unit: 'pH' }
        ]
      }
    },
    {
      id: '17/9/2025',
      date: '17/9/2025',
      apiDate: '2025-09-17',
      preview: 'Creatinin: 1 mg/dL • eGFR: 95 ml/min',
      mockData: {
        measuredAt: '2025-09-17',
        metrics: [
          { name: 'serum_creatinine', value: 1, unit: 'mg/dL' },
          { name: 'gfr', value: 95, unit: 'ml/min' },
          { name: 'bun', value: 15, unit: 'mg/dL' },
          { name: 'serum_calcium', value: 10, unit: 'mg/dL' },
          { name: 'ana', value: 0, unit: '0|1' },
          { name: 'c3_c4', value: 129.8, unit: 'mg/dL' },
          { name: 'hematuria', value: 0, unit: '0|1' },
          { name: 'oxalate_levels', value: 2, unit: 'mg/day' },
          { name: 'urine_ph', value: 7, unit: 'pH' }
        ]
      }
    }
  ];

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedPanel, setSelectedPanel] = useState<string>('');
  const [isLoadingData, setIsLoadingData] = useState(false);

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
    recommendations: string[];
  } | null>(null);

  // Store raw AI result and form data for later saving (after appointment booking)
  const [rawPredictionData, setRawPredictionData] = useState<{
    aiResult: any;
    formData: any;
    timestamp: string;
  } | null>(null);

  const [isCalculatingPrediction, setIsCalculatingPrediction] = useState(false);
  // Get WebSocket chat context for AI messaging
  const {
    messages: allMessages,
    currentAIGroupId,
    isAIResponding,
    sendAIMessage
  } = useWebSocketChat();

  // Convert WebSocket messages to local ChatMessage format
  const messages: ChatMessage[] = currentAIGroupId
    ? (allMessages[currentAIGroupId] || []).map(msg => ({
        id: msg.id,
        sender: msg.senderId === 'AI' ? 'assistant' : 'user',
        content: msg.content,
        timestamp: msg.timestamp,
        type: 'text' as const
      }))
    : [{
        id: 'welcome',
        sender: 'assistant',
        content: 'Xin chào! Tôi là trợ lý AI của HealthCare+. Tôi có thể giúp bạn hiểu về bệnh thận mạn, giải thích các chỉ số xét nghiệm, và đưa ra lời khuyên về chế độ sinh hoạt. Bạn có câu hỏi gì không?',
        timestamp: new Date().toISOString(),
        type: 'text' as const
      }];

  const [inputMessage, setInputMessage] = useState('');
  const isTyping = isAIResponding;
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const suggestedQuestions = ['Tính giai đoạn CKD của tôi', 'Thực đơn ít muối cho CKD', 'Chỉ số nào nguy hiểm?', 'Tác dụng phụ của thuốc', 'Khi nào cần lọc máu?', 'Cách theo dõi huyết áp'];
  const chatHistory: ChatHistory[] = [{
    id: '1',
    title: 'Tính giai đoạn CKD của tôi',
    lastMessage: 'Dựa trên eGFR 45, bạn đang ở giai đoạn 3b...',
    timestamp: '2024-01-15T10:30:00',
    messageCount: 8
  }, {
    id: '2',
    title: 'Chế độ ăn cho CKD',
    lastMessage: 'Nên hạn chế protein xuống 0.8g/kg...',
    timestamp: '2024-01-14T15:20:00',
    messageCount: 12
  }, {
    id: '3',
    title: 'Giải thích kết quả xét nghiệm',
    lastMessage: 'Creatinine 1.8 mg/dL cao hơn bình thường...',
    timestamp: '2024-01-12T09:15:00',
    messageCount: 6
  }];
  const uploadAnalyses: UploadAnalysis[] = [{
    id: '1',
    fileName: 'xet-nghiem-mau-15-01-2024.pdf',
    uploadDate: '2024-01-15T14:30:00',
    status: 'completed',
    summary: 'Kết quả xét nghiệm cho thấy chức năng thận giảm nhẹ với eGFR 45 mL/min/1.73m²',
    abnormalities: ['eGFR thấp (45 mL/min/1.73m²) - dưới ngưỡng bình thường', 'Creatinine cao (1.8 mg/dL) - vượt giới hạn bình thường', 'BUN tăng nhẹ (25 mg/dL) - hơi cao']
  }, {
    id: '2',
    fileName: 'sieu-am-than-10-01-2024.pdf',
    uploadDate: '2024-01-10T11:20:00',
    status: 'completed',
    summary: 'Siêu âm thận cho thấy cấu trúc thận bình thường, không có sỏi hoặc tắc nghẽn',
    abnormalities: []
  }];

  // API service function to get health metrics by date
  const getHealthMetricsByDate = async (patientId: string, measuredAt: string) => {
    try {
      const token = getAccessToken();
      const response = await fetch(
        `http://localhost:8080/api/v1/health-metrics/by-patient-and-date?patientId=${patientId}&measuredAt=${measuredAt}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data || []; // Return array of panels
    } catch (error) {
      throw error;
    }
  };

  // Function to map API panel data to CKD form (new format from API)
  const mapApiPanelToCKDForm = (panel: any) => {
    console.log('🧮 Mapping panel data for date:', panel.measuredAt);

    // panel.metrics is now an array: [{ name, value, unit }, ...]
    const metricsArray = panel.metrics || [];

    // Convert array to object for easier access
    const metricsMap: Record<string, any> = {};
    metricsArray.forEach((metric: any) => {
      metricsMap[metric.name] = metric;
    });

    // Create the mapped object
    const mappedResult = {
      serum_creatinine: metricsMap.serum_creatinine?.value || ckdFormData.serum_creatinine,
      gfr: metricsMap.gfr?.value || ckdFormData.gfr,
      bun: metricsMap.bun?.value || ckdFormData.bun,
      serum_calcium: metricsMap.serum_calcium?.value || ckdFormData.serum_calcium,
      c3_c4: metricsMap.c3_c4?.value || ckdFormData.c3_c4,
      oxalate_levels: metricsMap.oxalate_levels?.value || ckdFormData.oxalate_levels,
      urine_ph: metricsMap.urine_ph?.value || ckdFormData.urine_ph,
      ana: metricsMap.ana?.value === 1 || metricsMap.ana?.value === true,
      hematuria: metricsMap.hematuria?.value === 1 || metricsMap.hematuria?.value === true,
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
  const handleTestSelection = async (panelId: string) => {
    console.log('🔄 Selecting test data for:', panelId);

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
      console.log('✅ Manual input selected');
    } else {
      // Find selected date from mockTestDates
      const selectedDate = mockTestDates.find(date => date.id === panelId);

      if (selectedDate) {
        setIsLoadingData(true);
        try {
          // Use mock data for now (API integration can be enabled later)
          console.log('📡 Using mock data for date:', selectedDate.date);
          const mockApiData = [selectedDate.mockData];
          console.log('📊 Mock data loaded:', mockApiData);

          if (mockApiData && mockApiData.length > 0) {
            const panel = mockApiData[0];
            const mappedData = mapApiPanelToCKDForm(panel);

            setCkdFormData(mappedData);
            setSelectedPanel(panelId);
            console.log('✅ Form data updated from mock data');
          } else {
            alert(`Không thể tải dữ liệu cho ngày ${selectedDate.date}.`);
          }

          // TODO: Enable API integration when ready
          /*
          const apiData = await getHealthMetricsByDate(user.id, selectedDate.apiDate);
          console.log('📊 API response received:', apiData ? 'Success' : 'No data');

          if (apiData && apiData.length > 0) {
            const panel = apiData[0];
            const mappedData = mapApiPanelToCKDForm(panel);
            setCkdFormData(mappedData);
            setSelectedPanel(panelId);
            console.log('✅ Form data updated from API');
          } else {
            console.warn(`No data found for date: ${selectedDate.apiDate}`);
            alert(`Không tìm thấy dữ liệu cho ngày ${selectedDate.date}.`);
          }
          */
        } catch (error) {
          console.error('❌ Error loading mock data:', error);
          alert(`Lỗi khi tải dữ liệu ngày ${selectedDate.date}.`);
        } finally {
          setIsLoadingData(false);
        }
      } else {
        console.error('❌ Date not found for panelId:', panelId);
      }
    }
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Debug: Track when form data changes (can be removed in production)
  useEffect(() => {
    if (selectedPanel && selectedPanel !== 'manual') {
      console.log('✅ Form data updated for panel:', selectedPanel, {
        serum_creatinine: ckdFormData.serum_creatinine,
        gfr: ckdFormData.gfr,
        bun: ckdFormData.bun,
        ana: ckdFormData.ana,
        hematuria: ckdFormData.hematuria
      });
    }
  }, [ckdFormData, selectedPanel]);

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
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isAIResponding) return;

    const message = inputMessage.trim();
    setInputMessage('');

    try {
      // Send message via WebSocket + AI API (lazy initialization handled inside)
      await sendAIMessage(message);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Error already handled in context with toast
    }
  };

  // Rich rendering for assistant message with markdown support
  const renderAssistantMessage = (text: string) => {
    return (
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Headings
            h1: ({node, ...props}) => <h1 className="text-xl font-bold text-gray-900 mt-5 mb-2.5" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-lg font-bold text-gray-900 mt-4 mb-2.5" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-base font-semibold text-gray-900 mt-3 mb-2" {...props} />,

            // Paragraphs - comfortable spacing
            p: ({node, ...props}) => <p className="text-gray-700 leading-relaxed mb-3" {...props} />,

            // Lists
            ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1.5 mb-3 text-gray-700" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-1.5 mb-3 text-gray-700" {...props} />,
            li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,

            // Strong/Bold
            strong: ({node, ...props}) => <strong className="font-semibold text-gray-900" {...props} />,

            // Emphasis/Italic
            em: ({node, ...props}) => <em className="italic text-gray-800" {...props} />,

            // Code
            code: ({node, inline, ...props}: any) =>
              inline
                ? <code className="px-1.5 py-0.5 bg-gray-100 text-pink-600 rounded text-sm font-mono" {...props} />
                : <code className="block p-3 bg-gray-900 text-gray-100 rounded-lg text-sm font-mono overflow-x-auto my-2" {...props} />,

            // Blockquotes
            blockquote: ({node, ...props}) => (
              <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-3 bg-blue-50 text-gray-700 italic" {...props} />
            ),

            // Tables
            table: ({node, ...props}) => (
              <div className="overflow-x-auto my-3">
                <table className="min-w-full divide-y divide-gray-300 border border-gray-300" {...props} />
              </div>
            ),
            thead: ({node, ...props}) => <thead className="bg-gray-100" {...props} />,
            th: ({node, ...props}) => <th className="px-3 py-2 text-left text-sm font-semibold text-gray-900 border border-gray-300" {...props} />,
            td: ({node, ...props}) => <td className="px-3 py-2 text-sm text-gray-700 border border-gray-300" {...props} />,

            // Links
            a: ({node, ...props}) => <a className="text-blue-600 hover:text-blue-800 underline" {...props} />,

            // Horizontal rule
            hr: ({node, ...props}) => <hr className="my-4 border-gray-300" {...props} />,
          }}
        >
          {text}
        </ReactMarkdown>
      </div>
    );
  };
  const handleBookAppointment = () => {
    // Store FULL prediction data (raw AI result + form data) for saving after booking
    if (rawPredictionData) {
      const fullPredictionData = {
        // Raw AI result for database save
        stage: rawPredictionData.aiResult.predicted_stage,
        confidence: rawPredictionData.aiResult.confidence,
        recommendations: rawPredictionData.aiResult.recommendations || [],

        // Form data (21 fields) for health metrics transformation
        healthMetrics: rawPredictionData.formData,

        // Metadata
        timestamp: rawPredictionData.timestamp,
        userId: user.id
      };

      localStorage.setItem('pending_ckd_prediction', JSON.stringify(fullPredictionData));

      console.log('💾 Stored prediction data in localStorage for later save:', {
        stage: fullPredictionData.stage,
        confidence: fullPredictionData.confidence,
        recommendationsCount: fullPredictionData.recommendations.length,
        healthMetricsFields: Object.keys(fullPredictionData.healthMetrics).length
      });
    } else {
      console.warn('⚠️ No raw prediction data available to store');
    }

    // Also keep the old format for UI reference (backward compatibility)
    const uiPredictionData = {
      result: predictionResult?.risk === 'low' ? 'Nguy cơ Thấp' : predictionResult?.risk === 'moderate' ? 'Nguy cơ Trung bình' : 'Nguy cơ Cao',
      stage: predictionResult?.stage || '',
      confidence: `${predictionResult?.percentage || 0}%`,
      date: new Date().toISOString(),
      recommendations: predictionResult?.recommendations || []
    };
    localStorage.setItem('ckd_prediction_result', JSON.stringify(uiPredictionData));

    // Navigate to appointments page
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

      // Store raw data for later saving (after appointment booking)
      setRawPredictionData({
        aiResult: aiResult,
        formData: backendData,
        timestamp: new Date().toISOString()
      });

      // ⏸️ NOTE: Prediction data will be saved AFTER user books appointment
      // This ensures we only save when user actually needs medical consultation
      console.log('⏸️ Prediction ready, waiting for appointment booking to save');
      console.log('📊 Prediction will be saved with:', {
        stage: aiResult.predicted_stage,
        confidence: aiResult.confidence,
        recommendationsCount: aiResult.recommendations?.length || 0,
        userId: user.id
      });

      // Display result to user
      setPredictionResult(aiPredictionResult);
      setCurrentTab(5); // Move to results tab

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

    const predictedStage = aiResult.predicted_stage || aiResult.stage || 3;
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
      recommendations: formattedRecommendations,
      originalStage: predictedStage,
      originalRiskLevel: riskLevel,
      originalConfidence: confidence
    });

    return {
      risk,
      percentage,
      stage: formattedStage,
      recommendations: formattedRecommendations
    };
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadFile(file);
      // Simulate upload progress
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    }
  };
  const nextTab = () => {
    if (currentTab < 4) setCurrentTab(currentTab + 1);
  };
  const prevTab = () => {
    if (currentTab > 1) setCurrentTab(currentTab - 1);
  };
  const resetPrediction = () => {
    setPredictionResult(null);
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
  const renderChat = () => <div className="h-full flex">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(message => <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start space-x-3 max-w-3xl ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.sender === 'user' ? 'bg-blue-600' : 'bg-gradient-to-r from-purple-500 to-pink-500'}`}>
                  {message.sender === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                </div>

                {message.sender === 'assistant' ? (
                  <div className="px-0 py-0 rounded-2xl bg-white text-gray-900 border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {renderAssistantMessage(message.content)}
                      </div>
                    </div>
                    <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
                      {new Date(message.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ) : (
                  <div className={`px-4 py-3 rounded-2xl bg-blue-600 text-white`}>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </div>
                    <div className={`text-xs mt-2 text-blue-100`}>
                      {new Date(message.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                )}
              </div>
            </div>)}
          
          {isTyping && <div className="flex justify-start">
              <div className="flex items-start space-x-3 max-w-3xl">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white border border-gray-200">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{
                  animationDelay: '0.1s'
                }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{
                  animationDelay: '0.2s'
                }}></div>
                  </div>
                </div>
              </div>
            </div>}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        <div className="px-4 py-2 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((suggestion, index) => <button key={index} onClick={() => handleSuggestionClick(suggestion)} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors">
                {suggestion}
              </button>)}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <input type="text" value={inputMessage} onChange={e => setInputMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder="Đặt câu hỏi về sức khỏe thận..." className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12" />
              <button onClick={handleSendMessage} disabled={!inputMessage.trim()} className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar - Profile Summary */}
      <div className="hidden lg:block w-80 bg-gray-50 border-l border-gray-200 p-4">
        <div className="bg-white rounded-2xl p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-3">Hồ sơ tóm tắt</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-red-500" />
                <span className="text-sm text-gray-700">eGFR</span>
              </div>
              <span className="font-medium text-red-600">{user.lastEgfr}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Droplets className="w-4 h-4 text-red-500" />
                <span className="text-sm text-gray-700">Creatinine</span>
              </div>
              <span className="font-medium text-red-600">{user.lastCreatinine}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-gray-700">Huyết áp</span>
              </div>
              <span className="font-medium text-yellow-600">{user.lastBp}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Dị ứng</h3>
          <p className="text-sm text-gray-600">Không có dị ứng được ghi nhận</p>
        </div>

        {/* Disclaimer */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Lưu ý quan trọng</p>
              <p className="text-xs text-blue-800 mt-1">
                AI không thay thế bác sĩ. Luôn tham khảo ý kiến chuyên gia cho chẩn đoán và điều trị.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>;
  const renderUpload = () => <div className="max-w-4xl mx-auto space-y-6 overflow-y-auto">
      {/* Upload Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Phân tích kết quả xét nghiệm</h2>
        
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tải lên file xét nghiệm</h3>
          <p className="text-gray-600 mb-4">Hỗ trợ PDF, JPG, PNG (tối đa 10MB)</p>
          
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} className="hidden" id="file-upload" />
          <label htmlFor="file-upload" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 cursor-pointer transition-colors">
            <Upload className="w-4 h-4 mr-2" />
            <span>Chọn file</span>
          </label>
        </div>

        {uploadFile && <div className="mt-4 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">{uploadFile.name}</span>
              <span className="text-sm text-gray-500">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{
            width: `${uploadProgress}%`
          }}></div>
            </div>
          </div>}
      </div>

      {/* Analysis Results */}
      <div className="space-y-4">
        {uploadAnalyses.map(analysis => <div key={analysis.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <FileText className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="font-medium text-gray-900">{analysis.fileName}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(analysis.uploadDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${analysis.status === 'completed' ? 'bg-green-100 text-green-800' : analysis.status === 'processing' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                {analysis.status === 'completed' ? 'Hoàn thành' : analysis.status === 'processing' ? 'Đang xử lý' : 'Lỗi'}
              </span>
            </div>

            {analysis.status === 'completed' && <>
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Tóm tắt kết quả</h4>
                  <p className="text-gray-700 text-sm">{analysis.summary}</p>
                </div>

                {analysis.abnormalities && analysis.abnormalities.length > 0 && <div>
                    <h4 className="font-medium text-gray-900 mb-2">Các bất thường phát hiện</h4>
                    <ul className="space-y-2">
                      {analysis.abnormalities.map((abnormality, index) => <li key={index} className="flex items-start space-x-2">
                          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{abnormality}</span>
                        </li>)}
                    </ul>
                  </div>}
              </>}
          </div>)}
      </div>
    </div>;
  const renderHistory = () => <div className="max-w-4xl mx-auto overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Lịch sử hội thoại</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {chatHistory.map(chat => <div key={chat.id} className="p-6 hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                    <h3 className="font-medium text-gray-900">{chat.title}</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{chat.lastMessage}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(chat.timestamp).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <span>{chat.messageCount} tin nhắn</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>)}
        </div>
      </div>
    </div>;
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
                    disabled={isLoadingData}
                  >
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {isLoadingData ? 'Đang tải...' :
                       selectedPanel === 'manual' ? 'Nhập thủ công' :
                       selectedPanel ? `${mockTestDates.find(date => date.id === selectedPanel)?.date || selectedPanel}` :
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
                        {mockTestDates && mockTestDates.length > 0 ? (
                          <>
                            <div className="border-t border-gray-100 my-2"></div>
                            {mockTestDates.map((testDate) => (
                              <button
                                key={testDate.id}
                                onClick={() => handleTestSelection(testDate.id)}
                                className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors ${
                                  selectedPanel === testDate.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                }`}
                                disabled={isLoadingData}
                              >
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <div>
                                    <div className="font-medium">{testDate.date}</div>
                                    <div className="text-xs text-gray-500">
                                      {testDate.preview}
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
                <h3 className="text-xl font-semibold text-gray-900">Kết quả dự đoán CKD</h3>
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
                          {predictionResult.percentage}% khả năng phát triển CKD
                        </p>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className={`h-3 rounded-full transition-all duration-500 ${predictionResult.risk === 'low' ? 'bg-green-500' : predictionResult.risk === 'moderate' ? 'bg-yellow-500' : 'bg-red-500'}`} style={{
                      width: `${predictionResult.percentage}%`
                    }}></div>
                      </div>
                    </div>
                    
                    <p className={`font-medium ${predictionResult.risk === 'low' ? 'text-green-800' : predictionResult.risk === 'moderate' ? 'text-yellow-800' : 'text-red-800'}`}>
                      {predictionResult.stage}
                    </p>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <span>Khuyến nghị</span>
                  </h3>
                  
                  <ul className="space-y-3">
                    {predictionResult.recommendations.map((rec, index) => <li key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700 text-sm">{rec}</span>
                      </li>)}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6">
                <button onClick={resetPrediction} className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                  <span>🔄 Thực hiện lại</span>
                </button>
                <button className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                  <FileText className="w-4 h-4" />
                  <span>Xuất báo cáo</span>
                </button>
                <button onClick={handleBookAppointment} className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl hover:from-blue-600 hover:to-green-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  <Calendar className="w-4 h-4" />
                  <span>Đặt lịch khám</span>
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
  return <div className="h-full flex flex-col">
      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6">
        <div className="flex space-x-8">
          <button onClick={() => setCurrentView('chat')} className={`py-4 px-2 border-b-2 font-medium text-sm ${currentView === 'chat' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            Trò chuyện
          </button>
          {/* <button onClick={() => setCurrentView('upload')} className={`py-4 px-2 border-b-2 font-medium text-sm ${currentView === 'upload' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            Phân tích file
          </button> */}
          <button onClick={() => setCurrentView('ckd-prediction')} className={`py-4 px-2 border-b-2 font-medium text-sm ${currentView === 'ckd-prediction' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            Dự đoán CKD
          </button>
          {/* <button onClick={() => setCurrentView('history')} className={`py-4 px-2 border-b-2 font-medium text-sm ${currentView === 'history' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            Lịch sử
          </button> */}
        </div>
      </div>

      {/* Content */}
      <div className={`flex-1 ${currentView === 'chat' ? '' : 'p-4 lg:p-6'} ${currentView === 'chat' ? 'overflow-hidden' : 'overflow-auto'}`}>
        {currentView === 'chat' && renderChat()}
        {/* {currentView === 'upload' && renderUpload()} */}
        {currentView === 'ckd-prediction' && renderCKDPrediction()}
        {/* {currentView === 'history' && renderHistory()} */}
      </div>
    </div>;
}