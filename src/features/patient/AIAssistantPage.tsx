"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Upload, FileText, Clock, Trash2, MessageCircle, AlertTriangle, Activity, Droplets, Heart, Calculator, TrendingUp, Shield, AlertCircle, ChevronRight, ChevronLeft, CheckCircle2, BarChart3, Calendar } from 'lucide-react';
import { User as UserType } from './HealthcarePlusApp';
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
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: '1',
    sender: 'assistant',
    content: 'Xin chào! Tôi là trợ lý AI của HealthCare+. Tôi có thể giúp bạn hiểu về bệnh thận mạn, giải thích các chỉ số xét nghiệm, và đưa ra lời khuyên về chế độ sinh hoạt. Bạn có câu hỏi gì không?',
    timestamp: new Date().toISOString(),
    type: 'text'
  }]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
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
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
      type: 'text'
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        content: generateAIResponse(inputMessage),
        timestamp: new Date().toISOString(),
        type: 'text'
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 2000);
  };
  const generateAIResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    if (lowerQuestion.includes('giai đoạn') || lowerQuestion.includes('ckd')) {
      return `Dựa trên chỉ số eGFR hiện tại của bạn là ${user.lastEgfr} mL/min/1.73m², bạn đang ở giai đoạn 3b của bệnh thận mạn (CKD). Đây là giai đoạn chức năng thận giảm trung bình đến nặng.

Giai đoạn 3b có nghĩa là:
• eGFR từ 30-44 mL/min/1.73m²
• Cần theo dõi chặt chẽ và điều trị tích cực
• Có thể cần chuẩn bị cho liệu pháp thay thế thận

Bạn nên tuân thủ nghiêm ngặt chế độ điều trị và tái khám định kỳ.`;
    }
    if (lowerQuestion.includes('thực đơn') || lowerQuestion.includes('ăn')) {
      return `Với CKD giai đoạn 3b, bạn nên tuân thủ chế độ ăn sau:

**Hạn chế:**
• Muối: ít hơn 2g/ngày
• Protein: 0.8g/kg cân nặng/ngày
• Phospho: tránh thực phẩm chế biến
• Kali: hạn chế nếu xét nghiệm cao

**Nên ăn:**
• Rau xanh (luộc để giảm kali)
• Trái cây ít kali: táo, lê, nho
• Carbohydrate phức hợp
• Dầu olive, dầu canola

**Lưu ý:** Nên tham khảo chuyên gia dinh dưỡng để có thực đơn cụ thể phù hợp với tình trạng của bạn.`;
    }
    if (lowerQuestion.includes('nguy hiểm') || lowerQuestion.includes('chỉ số')) {
      return `Dựa trên hồ sơ của bạn, các chỉ số cần quan tâm:

**🔴 Nguy hiểm:**
• eGFR: ${user.lastEgfr} (bình thường lớn hơn 60)
• Creatinine: ${user.lastCreatinine} mg/dL (bình thường 0.6-1.2)

**🟡 Cần theo dõi:**
• Huyết áp: ${user.lastBp} mmHg (mục tiêu nhỏ hơn 130/80)

**Khuyến nghị:**
• Đo huyết áp hàng ngày
• Xét nghiệm máu mỗi 3 tháng
• Tuân thủ thuốc điều trị
• Liên hệ bác sĩ nếu có triệu chứng bất thường`;
    }
    return `Cảm ơn bạn đã đặt câu hỏi. Đây là một chủ đề quan trọng về sức khỏe thận. Tôi khuyên bạn nên:

1. Tham khảo ý kiến bác sĩ chuyên khoa để được tư vấn cụ thể
2. Theo dõi chặt chẽ các chỉ số sức khỏe
3. Tuân thủ chế độ điều trị được chỉ định

Bạn có thể đặt thêm câu hỏi cụ thể hoặc sử dụng các gợi ý bên dưới để tôi có thể hỗ trợ tốt hơn.`;
  };
  const handleBookAppointment = () => {
    // Lưu thông tin dự đoán vào localStorage để tham khảo
    const predictionData = {
      result: predictionResult?.risk === 'low' ? 'Nguy cơ Thấp' : predictionResult?.risk === 'moderate' ? 'Nguy cơ Trung bình' : 'Nguy cơ Cao',
      stage: predictionResult?.stage || '',
      confidence: `${predictionResult?.percentage || 0}%`,
      date: new Date().toISOString(),
      recommendations: predictionResult?.recommendations || []
    };
    localStorage.setItem('ckd_prediction_result', JSON.stringify(predictionData));

    // Chuyển đến trang đặt lịch
    if (onNavigate) {
      onNavigate('appointments');
    }
  };
  const calculateCKDRisk = () => {
    // Advanced CKD risk calculation based on the 21 features
    let riskScore = 0;

    // Numerical features scoring
    if (ckdFormData.serum_creatinine > 1.5) riskScore += 4;else if (ckdFormData.serum_creatinine > 1.2) riskScore += 2;
    if (ckdFormData.gfr < 30) riskScore += 5;else if (ckdFormData.gfr < 45) riskScore += 4;else if (ckdFormData.gfr < 60) riskScore += 2;
    if (ckdFormData.bun > 40) riskScore += 3;else if (ckdFormData.bun > 25) riskScore += 1;
    if (ckdFormData.blood_pressure_systolic > 140) riskScore += 3;else if (ckdFormData.blood_pressure_systolic > 130) riskScore += 1;

    // Binary features
    if (ckdFormData.ana) riskScore += 2;
    if (ckdFormData.hematuria) riskScore += 3;
    if (ckdFormData.smoking) riskScore += 2;
    if (ckdFormData.family_history) riskScore += 2;

    // Categorical features
    if (ckdFormData.physical_activity === 'rarely') riskScore += 1;
    if (ckdFormData.diet === 'high protein') riskScore += 1;
    if (ckdFormData.alcohol === 'daily') riskScore += 1;
    if (ckdFormData.stress_level === 3) riskScore += 1;

    // Determine risk level and stage
    let risk: 'low' | 'moderate' | 'high';
    let percentage: number;
    let stage: string;
    if (riskScore <= 4) {
      risk = 'low';
      percentage = Math.min(30, riskScore * 7);
      stage = 'Chức năng thận bình thường hoặc giảm nhẹ';
    } else if (riskScore <= 10) {
      risk = 'moderate';
      percentage = 30 + (riskScore - 4) * 8;
      stage = 'Chức năng thận giảm trung bình - cần theo dõi';
    } else {
      risk = 'high';
      percentage = Math.min(95, 78 + (riskScore - 10) * 3);
      stage = 'Nguy cơ cao - cần can thiệp tích cực';
    }

    // Generate specific recommendations
    const recommendations: string[] = [];
    if (ckdFormData.serum_creatinine > 1.2) {
      recommendations.push('Theo dõi chức năng thận định kỳ mỗi 3 tháng');
    }
    if (ckdFormData.blood_pressure_systolic > 130) {
      recommendations.push('Kiểm soát huyết áp dưới 130/80 mmHg');
    }
    if (ckdFormData.smoking) {
      recommendations.push('Bỏ thuốc lá để bảo vệ chức năng thận');
    }
    if (ckdFormData.diet === 'high protein') {
      recommendations.push('Giảm lượng protein xuống 0.8g/kg cân nặng/ngày');
    }
    if (ckdFormData.water_intake < 1.5) {
      recommendations.push('Tăng lượng nước uống lên 2-3L/ngày');
    }
    if (ckdFormData.physical_activity === 'rarely') {
      recommendations.push('Tập thể dục đều đặn 30 phút/ngày, 5 ngày/tuần');
    }
    recommendations.push('Hạn chế muối dưới 5g/ngày');
    recommendations.push('Kiểm tra định kỳ với bác sĩ chuyên khoa thận');
    setPredictionResult({
      risk,
      percentage,
      stage,
      recommendations: recommendations.slice(0, 8)
    });

    // Move to Step 5 (Results)
    setCurrentTab(5);
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
                
                <div className={`px-4 py-3 rounded-2xl ${message.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-900'}`}>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </div>
                  <div className={`text-xs mt-2 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                    {new Date(message.timestamp).toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
                  </div>
                </div>
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
              <input type="text" value={inputMessage} onChange={e => setInputMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage()} placeholder="Đặt câu hỏi về sức khỏe thận..." className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12" />
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
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl">🔬</span>
                <h3 className="text-xl font-semibold text-gray-900">Kết quả xét nghiệm gần nhất</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Creatinine huyết thanh (mg/dL) *
                    </label>
                    <input type="number" step="0.1" value={ckdFormData.serum_creatinine} onChange={e => setCkdFormData({
                  ...ckdFormData,
                  serum_creatinine: parseFloat(e.target.value)
                })} placeholder="VD: 1.8" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    <small className="text-gray-500">Bình thường: 0.6-1.2 mg/dL</small>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      eGFR - Tốc độ lọc cầu thận (mL/min/1.73m²) *
                    </label>
                    <input type="number" value={ckdFormData.gfr} onChange={e => setCkdFormData({
                  ...ckdFormData,
                  gfr: parseInt(e.target.value)
                })} placeholder="VD: 45" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    <small className="text-gray-500">Bình thường: &gt;90 mL/min/1.73m²</small>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      BUN - Urê máu (mg/dL) *
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
                      Protein bổ sung C3/C4 (mg/dL)
                    </label>
                    <input type="number" value={ckdFormData.c3_c4} onChange={e => setCkdFormData({
                  ...ckdFormData,
                  c3_c4: parseInt(e.target.value)
                })} placeholder="VD: 120" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <small className="text-gray-500">Bình thường: 90-180 mg/dL</small>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mức Oxalate trong máu
                    </label>
                    <input type="number" step="0.1" value={ckdFormData.oxalate_levels} onChange={e => setCkdFormData({
                  ...ckdFormData,
                  oxalate_levels: parseFloat(e.target.value)
                })} placeholder="VD: 2.5" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Độ pH nước tiểu
                    </label>
                    <input type="range" min="4" max="8" step="0.1" value={ckdFormData.urine_ph} onChange={e => setCkdFormData({
                  ...ckdFormData,
                  urine_ph: parseFloat(e.target.value)
                })} className="w-full" />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>4.0 (Chua)</span>
                      <span className="font-medium">{ckdFormData.urine_ph}</span>
                      <span>8.0 (Kiềm)</span>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" checked={ckdFormData.ana} onChange={e => setCkdFormData({
                    ...ckdFormData,
                    ana: e.target.checked
                  })} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="text-sm font-medium text-gray-700">Kháng thể kháng nhân (ANA) dương tính</span>
                    </label>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
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

          {/* Tab 2: Health Info */}
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
                  })} placeholder="Tâm thu" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                      <span className="text-gray-500">/</span>
                      <input type="number" value={ckdFormData.blood_pressure_diastolic} onChange={e => setCkdFormData({
                    ...ckdFormData,
                    blood_pressure_diastolic: parseInt(e.target.value)
                  })} placeholder="Tâm trương" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <small className="text-gray-500">Bình thường: &lt;130/80 mmHg</small>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lượng nước uống hàng ngày (L) *
                    </label>
                    <input type="range" min="0.5" max="5" step="0.1" value={ckdFormData.water_intake} onChange={e => setCkdFormData({
                  ...ckdFormData,
                  water_intake: parseFloat(e.target.value)
                })} className="w-full" />
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500">0.5L</span>
                      <span className="font-medium text-blue-600">{ckdFormData.water_intake}L</span>
                      <span className="text-xs text-gray-500">5L</span>
                    </div>
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
                })} placeholder="VD: 6" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
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

          {/* Tab 4: History & Psychology */}
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
                    <div className="space-y-4">
                      <input type="range" min="1" max="3" step="1" value={ckdFormData.stress_level} onChange={e => setCkdFormData({
                    ...ckdFormData,
                    stress_level: parseInt(e.target.value)
                  })} className="w-full" />
                      <div className="flex justify-between">
                        <div className={`flex-1 p-2 rounded ${ckdFormData.stress_level === 1 ? 'bg-green-100 text-green-800' : 'text-gray-500'}`}>
                          <div className="text-2xl">😊</div>
                          <div className="text-xs font-medium">Thấp</div>
                        </div>
                        <div className={`flex-1 p-2 rounded ${ckdFormData.stress_level === 2 ? 'bg-yellow-100 text-yellow-800' : 'text-gray-500'}`}>
                          <div className="text-2xl">😐</div>
                          <div className="text-xs font-medium">Vừa</div>
                        </div>
                        <div className={`flex-1 p-2 rounded ${ckdFormData.stress_level === 3 ? 'bg-red-100 text-red-800' : 'text-gray-500'}`}>
                          <div className="text-2xl">😰</div>
                          <div className="text-xs font-medium">Cao</div>
                        </div>
                      </div>
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
                  <span>📄 Xuất báo cáo</span>
                </button>
                <button onClick={handleBookAppointment} className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl hover:from-blue-600 hover:to-green-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  <Calendar className="w-4 h-4" />
                  <span>📅 Đặt lịch khám</span>
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
              </button> : <button onClick={calculateCKDRisk} disabled={!validateCurrentTab()} className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium">
                <Calculator className="w-4 h-4" />
                <span>🔮 DỰ ĐOÁN KẾT QUẢ</span>
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
              Kết quả này chỉ mang tính chất tham khảo dựa trên 21 yếu tố khoa học. Vui lòng tham khảo ý kiến bác sĩ chuyên khoa để được chẩn đoán và điều trị chính xác.
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
          <button onClick={() => setCurrentView('upload')} className={`py-4 px-2 border-b-2 font-medium text-sm ${currentView === 'upload' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            Phân tích file
          </button>
          <button onClick={() => setCurrentView('ckd-prediction')} className={`py-4 px-2 border-b-2 font-medium text-sm ${currentView === 'ckd-prediction' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            Dự đoán CKD
          </button>
          <button onClick={() => setCurrentView('history')} className={`py-4 px-2 border-b-2 font-medium text-sm ${currentView === 'history' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            Lịch sử
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={`flex-1 ${currentView === 'chat' ? '' : 'p-4 lg:p-6'} ${currentView === 'chat' ? 'overflow-hidden' : 'overflow-auto'}`}>
        {currentView === 'chat' && renderChat()}
        {currentView === 'upload' && renderUpload()}
        {currentView === 'ckd-prediction' && renderCKDPrediction()}
        {currentView === 'history' && renderHistory()}
      </div>
    </div>;
}