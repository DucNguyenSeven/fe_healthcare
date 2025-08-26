import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  Video,
  User,
  Phone,
  MessageSquare,
  FileText,
  Check,
  X,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Plus,
  Send,
  Download,
  Mic,
  MicOff,
  VideoIcon,
  VideoOff,
  Search,
  Filter,
  CalendarDays,
  Repeat,
} from "lucide-react";
const appointmentData = [
  {
    id: 1,
    patient: "Nguyễn Văn An",
    time: "09:00",
    date: "2024-01-16",
    service: "Tư vấn CKD giai đoạn 3",
    status: "pending",
    type: "online",
  },
  {
    id: 2,
    patient: "Trần Thị Bình",
    time: "10:30",
    date: "2024-01-16",
    service: "Theo dõi định kỳ",
    status: "confirmed",
    type: "offline",
  },
  {
    id: 3,
    patient: "Lê Minh Cường",
    time: "14:00",
    date: "2024-01-16",
    service: "Tư vấn điều trị",
    status: "confirmed",
    type: "online",
  },
  {
    id: 4,
    patient: "Phạm Thị Dung",
    time: "15:30",
    date: "2024-01-16",
    service: "Khám định kỳ",
    status: "cancelled",
    type: "offline",
  },
] as any[];
const pastAppointments = [
  {
    id: 5,
    patient: "Hoàng Văn Em",
    time: "09:00",
    date: "2024-01-15",
    service: "Tư vấn CKD",
    status: "completed",
    type: "online",
  },
  {
    id: 6,
    patient: "Vũ Thị Phương",
    time: "11:00",
    date: "2024-01-15",
    service: "Theo dõi",
    status: "completed",
    type: "offline",
  },
] as any[];
const chatMessages = [
  {
    id: 1,
    sender: "patient",
    message: "Chào bác sĩ, con đang cảm thấy mệt mỏi nhiều hơn bình thường",
    time: "14:05",
  },
  {
    id: 2,
    sender: "doctor",
    message:
      "Chào anh, anh có thể mô tả cụ thể hơn về tình trạng mệt mỏi không?",
    time: "14:06",
  },
  {
    id: 3,
    sender: "patient",
    message: "Dạ, con thấy mệt ngay cả khi không làm gì nhiều, và hay buồn ngủ",
    time: "14:07",
  },
] as any[];
const quickSuggestions = [
  "Anh có uống đủ nước không?",
  "Huyết áp của anh thế nào?",
  "Anh có tuân thủ chế độ ăn không?",
  "Khi nào anh cần tái khám?",
];
interface AppointmentAndConsultationModuleProps {
  activeView: string;
}

// @component: AppointmentAndConsultationModule
export const AppointmentAndConsultationModule = ({
  activeView,
}: AppointmentAndConsultationModuleProps) => {
  const [appointmentTab, setAppointmentTab] = useState("upcoming");
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [consultationTab, setConsultationTab] = useState("profile");
  const [chatMessage, setChatMessage] = useState("");
  const [prescription, setPrescription] = useState("");
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Work schedule modal states
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    date: "",
    time: "",
    type: "offline",
    repeat: "none",
    notes: "",
  });
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-[#10B981]/10 text-[#10B981]";
      case "pending":
        return "bg-[#F59E0B]/10 text-[#F59E0B]";
      case "cancelled":
        return "bg-[#EF4444]/10 text-[#EF4444]";
      case "completed":
        return "bg-[#1E75FF]/10 text-[#1E75FF]";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };
  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Đã xác nhận";
      case "pending":
        return "Chờ xác nhận";
      case "cancelled":
        return "Đã hủy";
      case "completed":
        return "Hoàn thành";
      default:
        return "Không xác định";
    }
  };
  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      setChatMessage("");
    }
  };
  const handleSavePrescription = () => {
    if (prescription.trim()) {
      alert("Đã lưu và gửi đơn thuốc cho bệnh nhân");
      setPrescription("");
    }
  };
  const handleSaveSchedule = () => {
    if (scheduleForm.date && scheduleForm.time) {
      // Save schedule logic here
      alert("Đã đăng ký lịch làm việc thành công");
      setShowScheduleModal(false);
      setScheduleForm({
        date: "",
        time: "",
        type: "offline",
        repeat: "none",
        notes: "",
      });
    }
  };
  const filterAppointments = (appointments: any[]) => {
    return appointments.filter((appointment) => {
      const matchesSearch = appointment.patient
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesType =
        typeFilter === "all" || appointment.type === typeFilter;
      const matchesStatus =
        statusFilter === "all" || appointment.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  };
  const renderAppointments = () => {
    const currentAppointments =
      appointmentTab === "upcoming"
        ? appointmentData
        : appointmentTab === "past"
        ? pastAppointments
        : appointmentData.filter((apt) => apt.status === "cancelled");
    const filteredAppointments = filterAppointments(currentAppointments);
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[#0F172A]">
            Quản lý lịch hẹn
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_10px_24px_rgba(16,24,40,0.08)] overflow-hidden">
          <div className="border-b border-gray-100">
            <div className="flex">
              {[
                {
                  id: "upcoming",
                  label: "Sắp tới",
                },
                {
                  id: "past",
                  label: "Đã qua",
                },
                {
                  id: "cancelled",
                  label: "Đã hủy",
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setAppointmentTab(tab.id)}
                  className={`px-6 py-4 font-medium transition-colors ${
                    appointmentTab === tab.id
                      ? "text-[#1E75FF] border-b-2 border-[#1E75FF]"
                      : "text-[#334155] hover:text-[#1E75FF]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filter and Search Toolbar */}
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search
                  size={20}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#334155]"
                />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên bệnh nhân..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter size={20} className="text-[#334155]" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent"
                >
                  <option value="all">Tất cả loại khám</option>
                  <option value="online">Trực tuyến</option>
                  <option value="offline">Trực tiếp</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="pending">Chờ xác nhận</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-6">
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-[#334155] mb-4">
                  Chưa có lịch hẹn nào trong mục này
                </p>
                <button className="bg-[#1E75FF] hover:bg-[#1659C9] text-white px-6 py-3 rounded-2xl font-medium flex items-center gap-2 mx-auto transition-colors">
                  <Plus size={20} />
                  <span>Đăng ký lịch làm việc</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAppointments.map((appointment, index) => (
                  <motion.div
                    key={appointment.id}
                    initial={{
                      opacity: 0,
                      y: 20,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: index * 0.1,
                    }}
                    className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {appointment.type === "online" ? (
                          <Video size={20} className="text-[#1E75FF]" />
                        ) : (
                          <User size={20} className="text-[#10B981]" />
                        )}
                        <span className="text-sm font-medium text-[#334155]">
                          {appointment.type === "online"
                            ? "Trực tuyến"
                            : "Trực tiếp"}
                        </span>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {getStatusText(appointment.status)}
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      <h3 className="font-semibold text-[#0F172A]">
                        {appointment.patient}
                      </h3>
                      <p className="text-sm text-[#334155]">
                        {appointment.service}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-[#334155]">
                        <Clock size={16} />
                        <span>
                          {appointment.time} -{" "}
                          {new Date(appointment.date).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                      </div>
                    </div>

                    {appointmentTab === "upcoming" &&
                      appointment.status === "pending" && (
                        <div className="flex gap-2">
                          <button className="flex-1 bg-[#10B981] hover:bg-[#059669] text-white py-2 px-3 rounded-xl text-sm font-medium flex items-center justify-center gap-1 transition-colors">
                            <Check size={16} />
                            <span>Chấp nhận</span>
                          </button>
                          <button className="flex-1 bg-[#EF4444] hover:bg-[#DC2626] text-white py-2 px-3 rounded-xl text-sm font-medium flex items-center justify-center gap-1 transition-colors">
                            <X size={16} />
                            <span>Từ chối</span>
                          </button>
                        </div>
                      )}

                    {appointmentTab === "upcoming" &&
                      appointment.status === "confirmed" && (
                        <button className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white py-2 px-3 rounded-xl text-sm font-medium flex items-center justify-center gap-1 transition-colors">
                          <RotateCcw size={16} />
                          <span>Đổi lịch</span>
                        </button>
                      )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  const renderConsultation = () => (
    <div className="p-6 h-full">
      <div className="bg-white rounded-2xl shadow-[0_10px_24px_rgba(16,24,40,0.08)] h-full flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[#0F172A]">
              Tư vấn trực tuyến
            </h1>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-[#10B981]/10 text-[#10B981] rounded-full text-sm font-medium">
                Đang kết nối
              </span>
              <span className="text-sm text-[#334155]">15:30</span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex min-h-0">
          <div className="flex-1 flex flex-col">
            <div className="flex-1 bg-gray-900 rounded-xl m-6 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User size={40} />
                  </div>
                  <p className="text-lg font-medium">Nguyễn Văn An</p>
                  <p className="text-white/80">Bệnh nhân</p>
                </div>
              </div>

              <div className="absolute bottom-4 right-4 w-32 h-24 bg-[#1E75FF] rounded-xl flex items-center justify-center">
                <div className="text-center text-white">
                  <User size={24} className="mx-auto mb-1" />
                  <p className="text-xs">Bác sĩ</p>
                </div>
              </div>

              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    isMuted
                      ? "bg-[#EF4444] hover:bg-[#DC2626]"
                      : "bg-white/20 hover:bg-white/30"
                  }`}
                >
                  {isMuted ? (
                    <MicOff size={20} className="text-white" />
                  ) : (
                    <Mic size={20} className="text-white" />
                  )}
                </button>
                <button
                  onClick={() => setIsVideoOn(!isVideoOn)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    !isVideoOn
                      ? "bg-[#EF4444] hover:bg-[#DC2626]"
                      : "bg-white/20 hover:bg-white/30"
                  }`}
                >
                  {isVideoOn ? (
                    <VideoIcon size={20} className="text-white" />
                  ) : (
                    <VideoOff size={20} className="text-white" />
                  )}
                </button>
                <button className="w-12 h-12 bg-[#EF4444] hover:bg-[#DC2626] rounded-full flex items-center justify-center transition-colors">
                  <Phone size={20} className="text-white" />
                </button>
              </div>
            </div>
          </div>

          <div className="w-80 border-l border-gray-100 flex flex-col">
            <div className="border-b border-gray-100">
              <div className="flex">
                {[
                  {
                    id: "profile",
                    label: "Hồ sơ",
                    icon: User,
                  },
                  {
                    id: "chat",
                    label: "Chat",
                    icon: MessageSquare,
                  },
                  {
                    id: "prescription",
                    label: "Chỉ định",
                    icon: FileText,
                  },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setConsultationTab(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                        consultationTab === tab.id
                          ? "text-[#1E75FF] border-b-2 border-[#1E75FF]"
                          : "text-[#334155] hover:text-[#1E75FF]"
                      }`}
                    >
                      <Icon size={16} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={consultationTab}
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -20,
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                >
                  {consultationTab === "profile" && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-[#0F172A] mb-3">
                        Thông tin bệnh nhân
                      </h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-gray-50 rounded-xl">
                          <p className="text-xs text-[#334155] mb-1">Họ tên</p>
                          <p className="font-medium text-[#0F172A]">
                            Nguyễn Văn An
                          </p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-xl">
                          <p className="text-xs text-[#334155] mb-1">Tuổi</p>
                          <p className="font-medium text-[#0F172A]">65 tuổi</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-xl">
                          <p className="text-xs text-[#334155] mb-1">
                            eGFR mới nhất
                          </p>
                          <p className="font-medium text-[#0F172A]">
                            45 ml/min
                          </p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-xl">
                          <p className="text-xs text-[#334155] mb-1">
                            Giai đoạn CKD
                          </p>
                          <p className="font-medium text-[#0F172A]">
                            Giai đoạn 3
                          </p>
                        </div>
                        <div className="p-3 bg-[#EF4444]/5 border border-[#EF4444]/20 rounded-xl">
                          <p className="text-xs text-[#EF4444] mb-1">Dị ứng</p>
                          <p className="font-medium text-[#0F172A]">
                            Penicillin
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {consultationTab === "chat" && (
                    <div className="flex flex-col h-full">
                      <div className="flex-1 space-y-3 mb-4">
                        {chatMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.sender === "doctor"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[80%] p-3 rounded-2xl ${
                                message.sender === "doctor"
                                  ? "bg-[#1E75FF] text-white"
                                  : "bg-gray-100 text-[#0F172A]"
                              }`}
                            >
                              <p className="text-sm">{message.message}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  message.sender === "doctor"
                                    ? "text-white/70"
                                    : "text-[#334155]"
                                }`}
                              >
                                {message.time}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {quickSuggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => setChatMessage(suggestion)}
                              className="text-xs bg-gray-100 hover:bg-gray-200 text-[#334155] px-3 py-2 rounded-xl transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            placeholder="Nhập tin nhắn..."
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent text-sm"
                            onKeyPress={(e) =>
                              e.key === "Enter" && handleSendMessage()
                            }
                          />
                          <button
                            onClick={handleSendMessage}
                            className="bg-[#1E75FF] hover:bg-[#1659C9] text-white p-2 rounded-xl transition-colors"
                          >
                            <Send size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {consultationTab === "prescription" && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-[#0F172A]">
                        Đơn thuốc & Chỉ định
                      </h3>
                      <textarea
                        value={prescription}
                        onChange={(e) => setPrescription(e.target.value)}
                        placeholder="Nhập đơn thuốc và chỉ định điều trị..."
                        rows={12}
                        className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent text-sm resize-none"
                      />
                      <button
                        onClick={handleSavePrescription}
                        className="w-full bg-[#10B981] hover:bg-[#059669] text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                      >
                        <Download size={16} />
                        <span>Lưu & Gửi PDF</span>
                      </button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  const renderSchedule = () => {
    const weekDays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    const timeSlots = [
      "08:00",
      "09:00",
      "10:00",
      "11:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
    ];
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[#0F172A]">Lịch làm việc</h1>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="bg-[#1E75FF] hover:bg-[#1659C9] text-white px-6 py-3 rounded-2xl font-medium flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            <span>Đăng ký lịch làm việc</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_10px_24px_rgba(16,24,40,0.08)] p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <ChevronLeft size={20} className="text-[#334155]" />
              </button>
              <h2 className="text-xl font-semibold text-[#0F172A]">
                Tuần{" "}
                {currentWeek.toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </h2>
              <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <ChevronRight size={20} className="text-[#334155]" />
              </button>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-[#1E75FF] text-white rounded-xl font-medium">
                Tuần
              </button>
              <button className="px-4 py-2 text-[#334155] hover:bg-gray-100 rounded-xl font-medium transition-colors">
                Ngày
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-8 gap-2 mb-4">
                <div className="p-3"></div>
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="p-3 text-center font-semibold text-[#334155]"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {timeSlots.map((time) => (
                <div key={time} className="grid grid-cols-8 gap-2 mb-2">
                  <div className="p-3 text-sm font-medium text-[#334155] text-right">
                    {time}
                  </div>
                  {weekDays.map((day, dayIndex) => (
                    <div
                      key={`${time}-${day}`}
                      className="p-2 border border-gray-100 rounded-lg min-h-[60px] hover:bg-gray-50 transition-colors"
                    >
                      {dayIndex === 1 && time === "09:00" && (
                        <div className="bg-[#1E75FF]/10 border border-[#1E75FF]/20 rounded-lg p-2 text-xs">
                          <p className="font-medium text-[#1E75FF]">
                            Nguyễn Văn An
                          </p>
                          <p className="text-[#334155]">Tư vấn CKD</p>
                        </div>
                      )}
                      {dayIndex === 2 && time === "14:00" && (
                        <div className="bg-[#10B981]/10 border border-[#10B981]/20 rounded-lg p-2 text-xs">
                          <p className="font-medium text-[#10B981]">
                            Trần Thị Bình
                          </p>
                          <p className="text-[#334155]">Theo dõi</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Schedule Registration Modal */}
        <AnimatePresence>
          {showScheduleModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.95,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                }}
                className="bg-white rounded-2xl p-6 w-full max-w-md shadow-[0_10px_24px_rgba(16,24,40,0.08)]"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-[#0F172A]">
                    Đăng ký lịch làm việc
                  </h3>
                  <button
                    onClick={() => setShowScheduleModal(false)}
                    className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                  >
                    <X size={16} className="text-[#334155]" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#334155] mb-2">
                      Ngày làm việc
                    </label>
                    <input
                      type="date"
                      value={scheduleForm.date}
                      onChange={(e) =>
                        setScheduleForm((prev) => ({
                          ...prev,
                          date: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#334155] mb-2">
                      Giờ làm việc
                    </label>
                    <input
                      type="time"
                      value={scheduleForm.time}
                      onChange={(e) =>
                        setScheduleForm((prev) => ({
                          ...prev,
                          time: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#334155] mb-2">
                      Hình thức
                    </label>
                    <select
                      value={scheduleForm.type}
                      onChange={(e) =>
                        setScheduleForm((prev) => ({
                          ...prev,
                          type: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent"
                    >
                      <option value="offline">Trực tiếp</option>
                      <option value="online">Trực tuyến</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#334155] mb-2">
                      Tùy chọn lặp lại
                    </label>
                    <select
                      value={scheduleForm.repeat}
                      onChange={(e) =>
                        setScheduleForm((prev) => ({
                          ...prev,
                          repeat: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent"
                    >
                      <option value="none">Không lặp lại</option>
                      <option value="daily">Hằng ngày</option>
                      <option value="weekly">Hàng tuần</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#334155] mb-2">
                      Ghi chú thêm
                    </label>
                    <textarea
                      value={scheduleForm.notes}
                      onChange={(e) =>
                        setScheduleForm((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      placeholder="Nhập ghi chú..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowScheduleModal(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-[#334155] py-3 rounded-2xl font-medium transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSaveSchedule}
                    disabled={!scheduleForm.date || !scheduleForm.time}
                    className="flex-1 bg-[#1E75FF] hover:bg-[#1659C9] text-white py-3 rounded-2xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Lưu
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // @return
  return (
    <div className="h-full bg-[#F6F7FB]">
      {activeView === "appointments" && renderAppointments()}
      {activeView === "consultation" && renderConsultation()}
      {activeView === "schedule" && renderSchedule()}
    </div>
  );
};
