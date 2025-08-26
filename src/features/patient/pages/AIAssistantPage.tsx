"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Upload,
  FileText,
  Clock,
  Trash2,
  MessageCircle,
  AlertTriangle,
  Activity,
  Droplets,
  Heart,
} from "lucide-react";
import { User as UserType } from "../types";

interface AIAssistantPageProps {
  user: UserType;
}

type AIView = "chat" | "upload" | "history";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  content: string;
  timestamp: string;
  type?: "text" | "suggestion";
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
  status: "processing" | "completed" | "error";
  summary?: string;
  abnormalities?: string[];
}

export function AIAssistantPage({ user }: AIAssistantPageProps) {
  const [currentView, setCurrentView] = useState<AIView>("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "assistant",
      content:
        "Xin chào! Tôi là trợ lý AI của HealthCare+. Tôi có thể giúp bạn hiểu về bệnh thận mạn, giải thích các chỉ số xét nghiệm, và đưa ra lời khuyên về chế độ sinh hoạt. Bạn có câu hỏi gì không?",
      timestamp: new Date().toISOString(),
      type: "text",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "Tính giai đoạn CKD của tôi",
    "Thực đơn ít muối cho CKD",
    "Chỉ số nào nguy hiểm?",
    "Tác dụng phụ của thuốc",
    "Khi nào cần lọc máu?",
    "Cách theo dõi huyết áp",
  ];

  const chatHistory: ChatHistory[] = [
    {
      id: "1",
      title: "Tính giai đoạn CKD của tôi",
      lastMessage: "Dựa trên eGFR 45, bạn đang ở giai đoạn 3b...",
      timestamp: "2024-01-15T10:30:00",
      messageCount: 8,
    },
    {
      id: "2",
      title: "Chế độ ăn cho CKD",
      lastMessage: "Nên hạn chế protein xuống 0.8g/kg...",
      timestamp: "2024-01-14T15:20:00",
      messageCount: 12,
    },
    {
      id: "3",
      title: "Giải thích kết quả xét nghiệm",
      lastMessage: "Creatinine 1.8 mg/dL cao hơn bình thường...",
      timestamp: "2024-01-12T09:15:00",
      messageCount: 6,
    },
  ];

  const uploadAnalyses: UploadAnalysis[] = [
    {
      id: "1",
      fileName: "xet-nghiem-mau-15-01-2024.pdf",
      uploadDate: "2024-01-15T14:30:00",
      status: "completed",
      summary:
        "Kết quả xét nghiệm cho thấy chức năng thận giảm nhẹ với eGFR 45 mL/min/1.73m²",
      abnormalities: [
        "eGFR thấp (45 mL/min/1.73m²) - dưới ngưỡng bình thường",
        "Creatinine cao (1.8 mg/dL) - vượt giới hạn bình thường",
        "BUN tăng nhẹ (25 mg/dL) - hơi cao",
      ],
    },
    {
      id: "2",
      fileName: "sieu-am-than-10-01-2024.pdf",
      uploadDate: "2024-01-10T11:20:00",
      status: "completed",
      summary:
        "Siêu âm thận cho thấy cấu trúc thận bình thường, không có sỏi hoặc tắc nghẽn",
      abnormalities: [],
    },
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      content: inputMessage,
      timestamp: new Date().toISOString(),
      type: "text",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        content: generateAIResponse(inputMessage),
        timestamp: new Date().toISOString(),
        type: "text",
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const generateAIResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes("giai đoạn") || lowerQuestion.includes("ckd")) {
      return `Dựa trên chỉ số eGFR hiện tại của bạn là ${user.lastEgfr} mL/min/1.73m², bạn đang ở giai đoạn 3b của bệnh thận mạn (CKD). Đây là giai đoạn chức năng thận giảm trung bình đến nặng.\n\nGiai đoạn 3b có nghĩa là:\n• eGFR từ 30-44 mL/min/1.73m²\n• Cần theo dõi chặt chẽ và điều trị tích cực\n• Có thể cần chuẩn bị cho liệu pháp thay thế thận\n\nBạn nên tuân thủ nghiêm ngặt chế độ điều trị và tái khám định kỳ.`;
    }

    if (lowerQuestion.includes("thực đơn") || lowerQuestion.includes("ăn")) {
      return `Với CKD giai đoạn 3b, bạn nên tuân thủ chế độ ăn sau:\n\n**Hạn chế:**\n• Muối: <2g/ngày\n• Protein: 0.8g/kg cân nặng/ngày\n• Phospho: tránh thực phẩm chế biến\n• Kali: hạn chế nếu xét nghiệm cao\n\n**Nên ăn:**\n• Rau xanh (luộc để giảm kali)\n• Trái cây ít kali: táo, lê, nho\n• Carbohydrate phức hợp\n• Dầu olive, dầu canola\n\n**Lưu ý:** Nên tham khảo chuyên gia dinh dưỡng để có thực đơn cụ thể phù hợp với tình trạng của bạn.`;
    }

    if (
      lowerQuestion.includes("nguy hiểm") ||
      lowerQuestion.includes("chỉ số")
    ) {
      return `Dựa trên hồ sơ của bạn, các chỉ số cần quan tâm:\n\n**🔴 Nguy hiểm:**\n• eGFR: ${user.lastEgfr} (bình thường >60)\n• Creatinine: ${user.lastCreatinine} mg/dL (bình thường 0.6-1.2)\n\n**🟡 Cần theo dõi:**\n• Huyết áp: ${user.lastBp} mmHg (mục tiêu <130/80)\n\n**Khuyến nghị:**\n• Đo huyết áp hàng ngày\n• Xét nghiệm máu mỗi 3 tháng\n• Tuân thủ thuốc điều trị\n• Liên hệ bác sĩ nếu có triệu chứng bất thường`;
    }

    return `Cảm ơn bạn đã đặt câu hỏi. Đây là một chủ đề quan trọng về sức khỏe thận. Tôi khuyên bạn nên:\n\n1. Tham khảo ý kiến bác sĩ chuyên khoa để được tư vấn cụ thể\n2. Theo dõi chặt chẽ các chỉ số sức khỏe\n3. Tuân thủ chế độ điều trị được chỉ định\n\nBạn có thể đặt thêm câu hỏi cụ thể hoặc sử dụng các gợi ý bên dưới để tôi có thể hỗ trợ tốt hơn.`;
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
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    }
  };

  const renderChat = () => (
    <div className="h-full flex">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex items-start space-x-3 max-w-3xl ${
                  message.sender === "user"
                    ? "flex-row-reverse space-x-reverse"
                    : ""
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === "user"
                      ? "bg-blue-600"
                      : "bg-gradient-to-r from-purple-500 to-pink-500"
                  }`}
                >
                  {message.sender === "user" ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>

                <div
                  className={`px-4 py-3 rounded-2xl ${
                    message.sender === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-gray-200 text-gray-900"
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </div>
                  <div
                    className={`text-xs mt-2 ${
                      message.sender === "user"
                        ? "text-blue-100"
                        : "text-gray-500"
                    }`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3 max-w-3xl">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white border border-gray-200">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        <div className="px-4 py-2 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Đặt câu hỏi về sức khỏe thận..."
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
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
              <span className="font-medium text-red-600">
                {user.lastCreatinine}
              </span>
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
              <p className="text-sm font-medium text-blue-900">
                Lưu ý quan trọng
              </p>
              <p className="text-xs text-blue-800 mt-1">
                AI không thay thế bác sĩ. Luôn tham khảo ý kiến chuyên gia cho
                chẩn đoán và điều trị.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUpload = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Upload Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Phân tích kết quả xét nghiệm
        </h2>

        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Tải lên file xét nghiệm
          </h3>
          <p className="text-gray-600 mb-4">
            Hỗ trợ PDF, JPG, PNG (tối đa 10MB)
          </p>

          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 cursor-pointer transition-colors"
          >
            <Upload className="w-4 h-4 mr-2" />
            Chọn file
          </label>
        </div>

        {uploadFile && (
          <div className="mt-4 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">
                {uploadFile.name}
              </span>
              <span className="text-sm text-gray-500">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Analysis Results */}
      <div className="space-y-4">
        {uploadAnalyses.map((analysis) => (
          <div
            key={analysis.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <FileText className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="font-medium text-gray-900">
                    {analysis.fileName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(analysis.uploadDate).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  analysis.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : analysis.status === "processing"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {analysis.status === "completed"
                  ? "Hoàn thành"
                  : analysis.status === "processing"
                  ? "Đang xử lý"
                  : "Lỗi"}
              </span>
            </div>

            {analysis.status === "completed" && (
              <>
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Tóm tắt kết quả
                  </h4>
                  <p className="text-gray-700 text-sm">{analysis.summary}</p>
                </div>

                {analysis.abnormalities &&
                  analysis.abnormalities.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Các bất thường phát hiện
                      </h4>
                      <ul className="space-y-2">
                        {analysis.abnormalities.map((abnormality, index) => (
                          <li
                            key={index}
                            className="flex items-start space-x-2"
                          >
                            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">
                              {abnormality}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Lịch sử hội thoại
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {chatHistory.map((chat) => (
            <div
              key={chat.id}
              className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                    <h3 className="font-medium text-gray-900">{chat.title}</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">
                    {chat.lastMessage}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {new Date(chat.timestamp).toLocaleDateString("vi-VN")}
                      </span>
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6">
        <div className="flex space-x-8">
          <button
            onClick={() => setCurrentView("chat")}
            className={`py-4 px-2 border-b-2 font-medium text-sm ${
              currentView === "chat"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Trò chuyện
          </button>
          <button
            onClick={() => setCurrentView("upload")}
            className={`py-4 px-2 border-b-2 font-medium text-sm ${
              currentView === "upload"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Phân tích file
          </button>
          <button
            onClick={() => setCurrentView("history")}
            className={`py-4 px-2 border-b-2 font-medium text-sm ${
              currentView === "history"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Lịch sử
          </button>
        </div>
      </div>

      {/* Content */}
      <div
        className={`flex-1 ${
          currentView === "chat" ? "" : "p-4 lg:p-6"
        } overflow-hidden`}
      >
        {currentView === "chat" && renderChat()}
        {currentView === "upload" && renderUpload()}
        {currentView === "history" && renderHistory()}
      </div>
    </div>
  );
}
