"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Clock,
  User,
  Video,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  Loader2,
  Star,
  Eye,
  MessageCircle,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Appointment } from "./HealthcarePlusApp";
import { useDoctorOfDate, useDoctorSchedule } from "@/hooks/doctor-schedules";
import { useBookingAppointment } from "@/hooks/appointments";
import { BookingAppointmentRequest } from "@/lib/api/appointments";
import { useGetMe } from "@/hooks/auth/useGetMe";
import {
  usePatientAppointments,
  transformAppointmentToTimelineFormat,
} from "@/hooks/appointments/usePatientAppointments";
import { MedicalResultModal } from "@/components/MedicalResultModal";
import { useWebSocketChat } from "@/contexts/WebSocketChatContext";
import { useAppointmentSocket } from "@/hooks/appointments/useAppointmentSocket";
import {
  savePredictHistory,
  CreateHealthMetricRequest,
} from "@/lib/api/predict";
import { webSocketAppointmentService } from "@/services/websocket-appointment";
import { motion, AnimatePresence } from "framer-motion";
import { AppointmentConfirmationModal } from "@/components/AppointmentConfirmationModal";
import { usePayment } from "@/hooks/usePayment";
import { PaymentMethod } from "@/types/payment.types";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  experience: string;
  avatar: string;
  availableSlots?: string[];
  bio?: string;
  examinationFee?: number;
  clinicAddress?: string;
}

interface TimelineAppointment extends Appointment {
  isPast: boolean;
  isToday: boolean;
  expanded?: boolean;
}

export function AppointmentsPage() {
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });
  const [appointmentTypeFilter, setAppointmentTypeFilter] = useState<
    "all" | "direct" | "online" | "lab_test" | "follow_up"
  >("all");
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [expandedAppointments, setExpandedAppointments] = useState<Set<string>>(
    new Set()
  );
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  // State cho Medical Result Modal
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] =
    useState<string>("");
  const [selectedDoctorInfo, setSelectedDoctorInfo] = useState<{
    name: string;
    specialty?: string;
    id?: string;
  } | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [appointmentType, setAppointmentType] = useState<
    "direct" | "online" | "lab_test" | "follow_up"
  >("direct");

  // Hook để lấy danh sách bác sĩ theo ngày
  const {
    doctors: availableDoctors,
    scheduleIdMap,
    loading: doctorsLoading,
    error: doctorsError,
    fetchDoctorsByDate,
    clearError,
  } = useDoctorOfDate();

  // Hook để lấy lịch làm việc của bác sĩ
  const {
    timeSlots: availableTimeSlots,
    scheduleId,
    timeSlotMapping,
    loading: timeSlotsLoading,
    error: timeSlotsError,
    fetchDoctorSchedule,
    refreshAvailableSlots,
    clearError: clearTimeSlotsError,
  } = useDoctorSchedule();

  // Hook để đặt lịch khám
  const {
    bookingAppointment,
    loading: bookingLoading,
    error: bookingError,
    clearError: clearBookingError,
    reset: resetBooking,
  } = useBookingAppointment();

  // Hook để lấy thông tin user hiện tại
  const { data: currentUser } = useGetMe();

  // Hook để lấy danh sách cuộc hẹn của patient
  const {
    appointments: apiAppointments,
    loading: appointmentsLoading,
    error: appointmentsError,
    fetchAppointments,
    clearError: clearAppointmentsError,
  } = usePatientAppointments();

  // Hook để sử dụng WebSocket Chat
  const {
    createNewConversation,
    setActiveConversation,
    isLoading: chatLoading,
    error: chatError,
  } = useWebSocketChat();

  // Hook để lắng nghe appointment socket events và auto-refetch
  useAppointmentSocket(() => {
    // Refetch appointments when socket event occurs
    if (currentUser?.userId) {
      const today = new Date();
      const endDate = new Date(today);
      endDate.setFullYear(today.getFullYear() + 1);

      fetchAppointments({
        patientId: currentUser.userId,
        startTime: "2020-01-01",
        endTime: endDate.toISOString().split("T")[0],
        page: 0,
        size: 50,
        sortBy: "appointmentDate",
        sortDir: "DESC",
      });
    }
  });

  // State để lưu thông tin cần thiết cho booking
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);

  // State cho form thông tin chi tiết
  const [symptoms, setSymptoms] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [addressDetail, setAddressDetail] = useState<string>("");

  // State cho chat
  const [isCreatingChat, setIsCreatingChat] = useState<string | null>(null);

  // Ref để track xem đã fetch appointments chưa
  const hasInitialFetchRef = useRef(false);

  // State để prevent duplicate submissions
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State cho modal hủy lịch
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointmentForCancel, setSelectedAppointmentForCancel] =
    useState<TimelineAppointment | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);

  // State cho confirmation modal (payment selection)
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Hook for payment operations
  const { createPayment, loading: paymentLoading } = usePayment();

  // Danh sách chi nhánh
  const branches = [
    {
      id: "branch-1",
      name: "Bệnh viện Đa khoa Quốc tế - Quận 1",
      address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
    },
    {
      id: "branch-2",
      name: "Bệnh viện Đa khoa Quốc tế - Quận 3",
      address: "456 Lê Văn Sỹ, Quận 3, TP.HCM",
    },
    {
      id: "branch-3",
      name: "Bệnh viện Đa khoa Quốc tế - Quận 7",
      address: "789 Nguyễn Thị Thập, Quận 7, TP.HCM",
    },
    {
      id: "branch-4",
      name: "Bệnh viện Đa khoa Quốc tế - Quận 10",
      address: "321 Sư Vạn Hạnh, Quận 10, TP.HCM",
    },
    {
      id: "branch-5",
      name: "Bệnh viện Đa khoa Quốc tế - Quận Bình Thạnh",
      address: "654 Xô Viết Nghệ Tĩnh, Quận Bình Thạnh, TP.HCM",
    },
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const processTimelineAppointments = (): TimelineAppointment[] => {
    // Chỉ sử dụng API data, không sử dụng mock data nữa
    const sourceAppointments = apiAppointments.map(
      transformAppointmentToTimelineFormat
    );

    return sourceAppointments
      .map((apt) => {
        const aptDate = new Date(apt.date);
        aptDate.setHours(0, 0, 0, 0);
        return {
          ...apt,
          isPast: aptDate < today,
          isToday: aptDate.getTime() === today.getTime(),
          expanded: expandedAppointments.has(apt.id),
        };
      })
      .filter((apt) => {
        if (
          appointmentTypeFilter !== "all" &&
          apt.type !== appointmentTypeFilter
        )
          return false;
        if (dateRange.start && new Date(apt.date) < new Date(dateRange.start))
          return false;
        if (dateRange.end && new Date(apt.date) > new Date(dateRange.end))
          return false;
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const timelineAppointments = processTimelineAppointments();

  // Tách thành 3 nhóm: future (sau hôm nay), today (hôm nay), past (trước hôm nay)
  const futureAppointments = timelineAppointments.filter(
    (apt) => !apt.isPast && !apt.isToday
  );
  const todayAppointments = timelineAppointments.filter((apt) => apt.isToday);
  const pastAppointments = timelineAppointments.filter((apt) => apt.isPast);

  const toggleAppointmentExpansion = (appointmentId: string) => {
    const newExpanded = new Set(expandedAppointments);
    if (newExpanded.has(appointmentId)) {
      newExpanded.delete(appointmentId);
    } else {
      newExpanded.add(appointmentId);
    }
    setExpandedAppointments(newExpanded);
  };

  // Handlers cho Medical Result Modal
  const handleViewResult = (appointment: any) => {
    setSelectedAppointmentId(appointment.id);
    setSelectedDoctorInfo({
      name: appointment.doctor || "Bác sĩ",
      specialty: appointment.specialty || undefined,
      id: appointment.doctorId || undefined,
    });
    setShowResultModal(true);
  };

  const handleCloseResultModal = () => {
    setShowResultModal(false);
    setSelectedAppointmentId("");
    setSelectedDoctorInfo(null);
  };

  // Function để tạo tên group tự động
  const generateGroupName = () => {
    // Tạo tên group dựa trên timestamp để đảm bảo unique
    const now = new Date();
    const timestamp = now.getTime();
    const conversationNumber = Math.floor(timestamp / 1000) % 1000; // Lấy 3 số cuối của timestamp
    return `Cuộc trò chuyện ${conversationNumber}`;
  };

  // Function để bắt đầu chat với bác sĩ
  const handleStartChat = async (appointment: any) => {
    if (!currentUser) {
      toast.error("Chưa đăng nhập", {
        description: "Vui lòng đăng nhập để sử dụng tính năng chat",
        duration: 4000,
      });
      return;
    }

    // Enhanced validation with graceful fallback

    // Tìm fallback doctorId từ nhiều nguồn
    const fallbackDoctorId =
      appointment.doctorInfo?.doctorId ||
      appointment.doctorInfo?.id ||
      (appointment as any).doctorId;

    const fallbackFullName =
      appointment.doctorInfo?.fullName ||
      appointment.doctor ||
      "Bác sĩ (Thông tin chưa đầy đủ)";

    // CHỈ chặn nếu không có doctorId (critical - required for chat creation)
    if (!fallbackDoctorId) {
      toast.error("Không thể nhắn tin", {
        description: "Thiếu thông tin ID bác sĩ. Vui lòng liên hệ hỗ trợ.",
        duration: 5000,
      });
      return;
    }

    // Nếu thiếu fullName → warning nhưng VẪN cho phép chat
    if (!appointment.doctorInfo?.fullName) {
      toast.warning("Thông tin bác sĩ chưa đầy đủ", {
        description: "Cuộc trò chuyện vẫn sẽ được tạo.",
        duration: 4000,
      });
    }

    // Cập nhật appointment với fallback values
    appointment.doctorInfo = {
      ...appointment.doctorInfo,
      doctorId: fallbackDoctorId,
      fullName: fallbackFullName,
      avatarUrl: appointment.doctorInfo?.avatarUrl || "/api/placeholder/40/40",
    };

    setIsCreatingChat(appointment.id);

    // Show immediate feedback
    toast.loading("Đang tạo cuộc trò chuyện...", {
      id: `creating-chat-${appointment.id}`,
      description: "Vui lòng chờ trong giây lát",
      duration: Infinity, // Will be dismissed manually
    });

    try {
      // Tạo danh sách members cho group chat với defensive fallbacks
      const members = [
        {
          userId: currentUser.userId,
          fullName:
            currentUser.fullName || (currentUser as any).name || "Bệnh nhân",
          avatarUrl: currentUser.avatarUrl || "/api/placeholder/40/40",
        },
        {
          userId: appointment.doctorInfo.doctorId, // Đã có fallback ở validation phía trên
          fullName: appointment.doctorInfo.fullName, // Đã có fallback ở validation phía trên
          avatarUrl:
            appointment.doctorInfo.avatarUrl ||
            (appointment.doctorInfo as any).avatar ||
            "/api/placeholder/40/40",
        },
      ];

      // Final safety check: Ensure all required fields are present
      if (!members[0].userId || !members[1].userId) {
        toast.error("Lỗi hệ thống", {
          description: "Không thể xác định thông tin người dùng.",
          duration: 5000,
        });
        return;
      }

      // Tạo group chat với tên tự động
      const groupName = generateGroupName();

      const { groupId, isExistingGroup } = await createNewConversation(
        members,
        appointment.id, // appointmentId để liên kết
        groupName // tên group tự động
      );

      // Dismiss loading toast first
      toast.dismiss(`creating-chat-${appointment.id}`);

      // No need to call setActiveConversation here - it's already handled in createNewConversation

      // Show appropriate toast message based on whether group already exists
      if (isExistingGroup) {
        toast.success("Đã mở cuộc trò chuyện", {
          description: "Tiếp tục trò chuyện với bác sĩ",
          duration: 3000,
        });
      } else {
        toast.success("Tạo cuộc trò chuyện thành công!", {
          description: "Bạn có thể bắt đầu nhắn tin với bác sĩ ngay",
          duration: 3000,
        });
      }

      // ChatWidget will automatically open when activeConversation is set
    } catch (error: any) {
      // Dismiss loading toast
      toast.dismiss(`creating-chat-${appointment.id}`);

      // Enhanced error logging with full context
      console.error("[handleStartChat] Error creating conversation:", error);

      // Provide specific error messages based on error type
      let errorMsg = "Vui lòng kiểm tra kết nối và thử lại";

      if (
        error?.message?.includes("doctorId") ||
        error?.message?.includes("userId")
      ) {
        errorMsg = "Thiếu thông tin bác sĩ. Vui lòng liên hệ hỗ trợ.";
      } else if (
        error?.message?.includes("WebSocket") ||
        error?.message?.includes("connection")
      ) {
        errorMsg = "Lỗi kết nối. Vui lòng kiểm tra internet.";
      } else if (error?.message?.includes("timeout")) {
        errorMsg = "Hết thời gian chờ. Vui lòng thử lại sau.";
      }

      toast.error("Không thể tạo cuộc trò chuyện", {
        description: errorMsg,
        duration: 5000,
      });
    } finally {
      setIsCreatingChat(null);
    }
  };

  // Get status color based on backend status
  const getStatusColor = (backendStatus: string) => {
    switch (backendStatus) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "CONFIRMED":
        return "bg-green-100 text-green-800 border-green-300";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-300";
      case "CANCELED":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Get status icon based on backend status
  const getStatusIcon = (backendStatus: string) => {
    switch (backendStatus) {
      case "PENDING":
        return Clock;
      case "CONFIRMED":
        return CheckCircle;
      case "COMPLETED":
        return CheckCircle;
      case "REJECTED":
        return XCircle;
      case "CANCELED":
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  // Handler để mở modal hủy lịch
  const handleOpenCancelModal = (appointment: TimelineAppointment) => {
    setSelectedAppointmentForCancel(appointment);
    setShowCancelModal(true);
  };

  // Handler để đóng modal hủy lịch
  const handleCloseCancelModal = () => {
    if (!isCanceling) {
      setShowCancelModal(false);
      setSelectedAppointmentForCancel(null);
    }
  };

  // Handler để hủy lịch qua WebSocket
  const handleCancelAppointment = async () => {
    if (!selectedAppointmentForCancel || !currentUser) {
      return;
    }

    // Kiểm tra WebSocket connection
    if (!webSocketAppointmentService.isConnected()) {
      toast.error("WebSocket chưa kết nối", {
        description: "Vui lòng kiểm tra kết nối internet và thử lại",
        duration: 4000,
      });
      return;
    }

    setIsCanceling(true);

    try {
      // Lấy thông tin appointment từ API data để đảm bảo có đầy đủ thông tin
      const appointmentData = apiAppointments.find(
        (apt) => apt.appointmentId === selectedAppointmentForCancel.id
      );

      // Fallback: nếu không tìm thấy từ API, thử lấy từ appointment đã transform
      const patientId =
        appointmentData?.patient?.id ||
        (selectedAppointmentForCancel as any).patientInfo?.id ||
        currentUser.userId;

      // Ưu tiên lấy doctorId từ nhiều nguồn
      // Quan trọng: ưu tiên lấy từ doctorInfo.doctorId trước (vì đã được enrich và có giá trị)
      const doctorId =
        (selectedAppointmentForCancel as any).doctorInfo?.doctorId || // Ưu tiên từ doctorInfo.doctorId
        (selectedAppointmentForCancel as any).doctorInfo?.id || // Fallback từ doctorInfo.id
        (selectedAppointmentForCancel as any).doctorId || // Từ transform result
        appointmentData?.doctorId || // Từ API data
        appointmentData?.doctor?.id; // Từ API data doctor object

      if (!doctorId) {
        throw new Error(
          "Không tìm thấy thông tin bác sĩ. Vui lòng thử lại sau."
        );
      }

      if (!patientId) {
        throw new Error(
          "Không tìm thấy thông tin bệnh nhân. Vui lòng thử lại sau."
        );
      }

      // Gửi WebSocket event để hủy lịch
      webSocketAppointmentService.sendScheduleEvent({
        appointmentId: selectedAppointmentForCancel.id,
        patientId: patientId,
        doctorId: doctorId,
        event: "CANCEL_APPOINTMENT",
        skipRefetchForUserId: currentUser.userId, // Skip refetch cho patient vì họ đã biết
      });

      // Đóng modal
      setShowCancelModal(false);
      setSelectedAppointmentForCancel(null);

      // Hiển thị toast loading với ID để có thể dismiss khi nhận response
      const toastId = `cancel-${selectedAppointmentForCancel.id}`;
      toast.loading("Đang hủy lịch hẹn...", {
        description: "Vui lòng chờ trong giây lát",
        duration: Infinity, // Không tự động dismiss, sẽ dismiss khi nhận response
        id: toastId,
      });

      // Note: WebSocket response sẽ được handle bởi WebSocketAppointmentContext
      // và sẽ tự động refetch appointments và hiển thị toast success/error
    } catch (error: any) {
      // Dismiss loading toast nếu có lỗi
      if (selectedAppointmentForCancel?.id) {
        toast.dismiss(`cancel-${selectedAppointmentForCancel.id}`);
      }

      toast.error("Không thể hủy lịch hẹn", {
        description: error.message || "Có lỗi xảy ra. Vui lòng thử lại.",
        duration: 4000,
      });
    } finally {
      setIsCanceling(false);
    }
  };

  // Get status text based on backend status
  const getStatusText = (backendStatus: string) => {
    switch (backendStatus) {
      case "PENDING":
        return "Chờ xác nhận";
      case "CONFIRMED":
        return "Đã xác nhận";
      case "COMPLETED":
        return "Đã hoàn thành";
      case "REJECTED":
        return "Đã từ chối";
      case "CANCELED":
        return "Đã hủy";
      default:
        return "Không rõ";
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

  const handleDateChange = async (date: string) => {
    setSelectedDate(date);
    // Reset dependent fields
    setSelectedDoctor(null);
    setSelectedTime("");
    setSelectedSlotId(null);
    setSymptoms("");
    setNote("");
    setAddressDetail("");

    // Gọi API để lấy danh sách bác sĩ có lịch trong ngày này
    if (date) {
      await fetchDoctorsByDate(date);
    }
  };

  const handleDoctorChange = async (doctor: Doctor | any) => {
    // Chuyển đổi DoctorInfo thành Doctor
    const doctorData: Doctor = {
      id: doctor.id,
      name: doctor.name,
      specialty: doctor.specialty,
      rating: doctor.rating || 4.5,
      experience: doctor.experience || "5 năm kinh nghiệm",
      avatar: doctor.avatar || "/api/placeholder/60/60",
      availableSlots: doctor.availableSlots || [],
      bio: doctor.bio,
      examinationFee: doctor.examinationFee,
      clinicAddress: doctor.clinicAddress,
    };

    setSelectedDoctor(doctorData);

    // Lấy scheduleId từ map (đã có sẵn từ bước chọn ngày)
    const scheduleIdFromMap = scheduleIdMap[doctor.id];

    // Reset dependent fields
    setSelectedTime("");
    setSelectedSlotId(null);
    setSymptoms("");
    setNote("");
    setAddressDetail("");

    // Vẫn cần gọi API để lấy time slots (scheduleId cũng sẽ được xác nhận lại)
    if (selectedDate) {
      await fetchDoctorSchedule(doctor.id, selectedDate);
    }
  };

  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
    // Lấy slotId từ mapping
    const slotId = timeSlotMapping[time];
    setSelectedSlotId(slotId || null);
  };

  /**
   * Open confirmation modal (bill review) before booking
   * This replaces the direct booking button action
   */
  const handleOpenConfirmModal = async () => {
    // Prevent duplicate submissions
    if (isSubmitting || bookingLoading) {
      return;
    }

    // Validation đầy đủ
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      toast.error("Thiếu thông tin", {
        description: "Vui lòng chọn đầy đủ thông tin: bác sĩ, ngày và giờ khám",
        duration: 4000,
      });
      return;
    }

    if (!currentUser) {
      toast.error("Chưa đăng nhập", {
        description: "Vui lòng đăng nhập để đặt lịch",
        duration: 4000,
      });
      return;
    }

    // Open confirmation modal instead of direct booking
    setShowConfirmModal(true);
  };

  /**
   * Handle booking confirmation after payment method selection
   * Dual flow: CASH (WebSocket) vs ONLINE (REST API + Payment)
   */
  const handleConfirmBooking = async (paymentMethod: PaymentMethod) => {
    // Double-check validation
    if (!selectedDoctor || !selectedDate || !selectedTime || !currentUser) {
      toast.error("Thiếu thông tin", {
        description: "Vui lòng thử lại",
        duration: 4000,
      });
      return;
    }

    setIsSubmitting(true);
    setIsProcessingPayment(true);

    try {
      // Close confirmation modal
      setShowConfirmModal(false);

      // BƯỚC 1: Refresh slots để lấy dữ liệu MỚI NHẤT (tránh race condition)
      toast.loading("Đang kiểm tra khung giờ...", {
        id: "checking-slot",
        duration: Infinity,
      });

      let latestScheduleId: string;
      let latestSlotId: number | undefined;

      try {
        const refreshResult = await refreshAvailableSlots(
          selectedDoctor.id,
          selectedDate
        );

        latestScheduleId = refreshResult.scheduleId;
        latestSlotId = refreshResult.mapping[selectedTime];

        // Dismiss loading toast
        toast.dismiss("checking-slot");

        // BƯỚC 2: Kiểm tra slot còn available không
        if (!latestSlotId) {
          toast.error("Khung giờ không khả dụng", {
            description:
              "Khung giờ này đã được đặt bởi người khác. Vui lòng chọn khung giờ khác.",
            duration: 5000,
          });
          // Reset selected time để user chọn lại
          setSelectedTime("");
          setSelectedSlotId(null);
          return;
        }

        // BƯỚC 3: Validate scheduleId
        if (!latestScheduleId) {
          toast.error("Lỗi lịch làm việc", {
            description:
              "Không thể lấy thông tin lịch làm việc của bác sĩ. Vui lòng thử lại.",
            duration: 4000,
          });
          return;
        }
      } catch (refreshError) {
        toast.dismiss("checking-slot");
        toast.error("Không thể kiểm tra khung giờ", {
          description: "Vui lòng thử lại sau",
          duration: 4000,
        });
        return;
      }

      // BƯỚC 4: Map appointment type to consultation type
      const consultationTypeMap: {
        [key: string]:
          | "ONLINE_CONSULTATION"
          | "DIRECT_CONSULTATION"
          | "FOLLOW_UP";
      } = {
        online: "ONLINE_CONSULTATION",
        direct: "DIRECT_CONSULTATION",
        lab_test: "DIRECT_CONSULTATION",
        follow_up: "FOLLOW_UP",
      };

      // BƯỚC 5: Tạo booking request với dữ liệu MỚI NHẤT
      const hasPredictValue = !!localStorage.getItem("pending_ckd_prediction");

      const bookingData: BookingAppointmentRequest = {
        patientId: currentUser.userId,
        scheduleId: latestScheduleId, // ✅ Dùng scheduleId mới nhất
        doctorId: selectedDoctor.id,
        symptoms: symptoms || "Khám theo lịch hẹn",
        note:
          note ||
          `Đặt lịch ${
            appointmentType === "online"
              ? "tư vấn online"
              : appointmentType === "lab_test"
                ? "xét nghiệm"
                : appointmentType === "follow_up"
                  ? "tái khám"
                  : "khám trực tiếp"
          } với ${selectedDoctor.name}`,
        slotId: latestSlotId, // ✅ Dùng slotId mới nhất
        consultationType:
          consultationTypeMap[appointmentType] || "DIRECT_CONSULTATION",
        status: "PENDING",
        addressDetail:
          appointmentType === "online"
            ? "Tại nhà"
            : selectedDoctor.clinicAddress || branches[0].address,
        hasPredict: hasPredictValue, // ✅ Dynamic check: true if from CKD prediction
        payment_method: paymentMethod, // ✅ Payment method from modal selection (CASH or ONLINE)
        // Backend tự động set paymentStatus = UNPAID, KHÔNG gửi payment_status từ frontend
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        patientName: currentUser.fullName || "Bệnh nhân",
        patientPhone: currentUser.phone || "",
        patientEmail: currentUser.email,
      };

      // ========== DUAL PAYMENT FLOW ==========
      if (paymentMethod === "CASH") {
        // ========== CASH FLOW: WebSocket Booking (Original) ==========
        await bookingAppointment(bookingData);

        // Reset form
        setShowBookingForm(false);
        setSelectedDoctor(null);
        setSelectedDate("");
        setSelectedTime("");
        setSelectedSlotId(null);
        setSymptoms("");
        setNote("");
        setAddressDetail("");
        resetBooking();

        // Show loading toast - wait for WebSocket confirmation
        toast.loading("Đang xác nhận đặt lịch...", {
          id: "booking-confirmation",
          description: "Vui lòng chờ trong giây lát",
          duration: Infinity, // Will be dismissed by WebSocket event
        });

        // NOTE: Prediction data will be processed in WebSocketAppointmentContext
        // after receiving WebSocket response with appointmentId
      } else {
        // ========== ONLINE FLOW: REST API + Payment ==========
        // Step 1: Create appointment via REST API
        toast.loading("Đang tạo lịch hẹn...", {
          id: "creating-appointment",
          duration: Infinity,
        });

        const appointmentResponse = await bookingAppointment(bookingData);

        if (!appointmentResponse) {
          throw new Error("Không nhận được thông tin lịch hẹn từ server");
        }

        toast.dismiss("creating-appointment");

        // Step 2: Create payment
        toast.loading("Đang tạo thanh toán...", {
          id: "creating-payment",
          duration: Infinity,
        });

        const paymentResult = await createPayment({
          appointmentId: appointmentResponse.appointmentId,
          amount: selectedDoctor.examinationFee || 200000, // Use doctor's fee or default
          // Backend tự generate description: "DH{orderCode}" (ngắn gọn, phù hợp giới hạn 25 ký tự của PayOS)
          returnUrl: `${window.location.origin}/patient/payment/return?appointmentId=${appointmentResponse.appointmentId}`,
          cancelUrl: `${window.location.origin}/patient/payment/cancel?cancel=true&appointmentId=${appointmentResponse.appointmentId}`,
        });

        toast.dismiss("creating-payment");

        if (!paymentResult) {
          throw new Error("Không thể tạo thanh toán. Vui lòng thử lại.");
        }

        // Store paymentId for payment return page
        localStorage.setItem("pending_payment_id", paymentResult.paymentId);

        // Reset form before redirect
        setShowBookingForm(false);
        setSelectedDoctor(null);
        setSelectedDate("");
        setSelectedTime("");
        setSelectedSlotId(null);
        setSymptoms("");
        setNote("");
        setAddressDetail("");
        resetBooking();

        // Step 3: Redirect to PayOS payment URL
        toast.success("Chuyển hướng đến trang thanh toán...", {
          description: "Vui lòng hoàn tất thanh toán để xác nhận lịch hẹn",
          duration: 2000,
        });

        // Delay để user có thể đọc toast message
        setTimeout(() => {
          window.location.href = paymentResult.paymentUrl;
        }, 1000);
      }
    } catch (error: any) {
      // BƯỚC 7: Xử lý error 409 (Time slot already booked - Race Condition)
      if (error.response?.status === 409 || error.statusCode === 409) {
        const errorData = error.response?.data;

        toast.error("⚠️ Khung giờ đã có người đặt", {
          description:
            errorData?.message ||
            "Có người khác vừa đặt slot này trước bạn. Đang làm mới danh sách...",
          duration: 6000,
          action: {
            label: "Chọn lại",
            onClick: () => {
              // Scroll to time slots
              const timeSlotsSection = document.querySelector(".booking-form");
              if (timeSlotsSection) {
                timeSlotsSection.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }
            },
          },
        });

        // Reset selected time to force user to re-select
        setSelectedTime("");
        setSelectedSlotId(null);

        // Auto refresh UI để hiển thị slots còn lại
        try {
          const refreshResult = await refreshAvailableSlots(
            selectedDoctor!.id,
            selectedDate
          );

          // Show success toast after refresh
          toast.success("Đã cập nhật danh sách khung giờ", {
            description: `Còn ${refreshResult.slots.length} khung giờ khả dụng. Vui lòng chọn lại.`,
            duration: 4000,
          });

          // Scroll to time slots section
          setTimeout(() => {
            const timeSlotsSection = document.querySelector(".booking-form");
            if (timeSlotsSection) {
              timeSlotsSection.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }
          }, 300);
        } catch (refreshError) {
          toast.error("Không thể làm mới danh sách", {
            description: "Vui lòng tải lại trang",
            duration: 4000,
          });
        }
      } else if (error.response?.status === 400) {
        // Bad request
        toast.error("Thông tin không hợp lệ", {
          description:
            error.response.data?.message ||
            "Vui lòng kiểm tra lại thông tin đặt lịch",
          duration: 4000,
        });
      } else if (error.response?.status === 404) {
        // Not found (doctor/schedule/slot không tồn tại)
        toast.error("Không tìm thấy thông tin", {
          description:
            error.response.data?.message ||
            "Bác sĩ hoặc lịch làm việc không tồn tại",
          duration: 4000,
        });
      } else {
        // Các lỗi khác
        toast.error("Đặt lịch thất bại", {
          description:
            error.response?.data?.message ||
            error.message ||
            "Có lỗi xảy ra. Vui lòng thử lại.",
          duration: 4000,
        });
      }
    } finally {
      // Always reset flags
      setIsSubmitting(false);
      setIsProcessingPayment(false);
    }
  };

  const renderTimelineEntry = (
    appointment: TimelineAppointment,
    isLast: boolean
  ) => {
    // Use backendStatus for all UI logic
    const backendStatus =
      (appointment as any).backendStatus || appointment.status;

    const StatusIcon = getStatusIcon(backendStatus);
    const isExpanded = appointment.expanded;

    return (
      <div key={appointment.id} className="relative">
        {/* Timeline line */}
        {!isLast && (
          <div className="absolute left-6 top-16 w-0.5 h-full bg-gradient-to-b from-gray-300 to-transparent"></div>
        )}

        {/* Timeline dot with status-based color */}
        <div
          className={`absolute left-4 top-6 w-4 h-4 rounded-full border-2 ${
            backendStatus === "PENDING"
              ? "bg-yellow-400 border-yellow-500 animate-pulse"
              : backendStatus === "CONFIRMED"
                ? "bg-green-500 border-green-600"
                : backendStatus === "COMPLETED"
                  ? "bg-blue-500 border-blue-600"
                  : backendStatus === "REJECTED"
                    ? "bg-red-500 border-red-600"
                    : "bg-gray-300 border-gray-400"
          }`}
        ></div>

        {/* Appointment card */}
        <div className="ml-12 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
            {/* Main content */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {appointment.type === "online" ? (
                    <Video className="w-6 h-6 text-blue-500" />
                  ) : appointment.type === "lab_test" ? (
                    <Stethoscope className="w-6 h-6 text-purple-500" />
                  ) : appointment.type === "follow_up" ? (
                    <Calendar className="w-6 h-6 text-orange-500" />
                  ) : appointment.type === "direct" ? (
                    <MapPin className="w-6 h-6 text-green-500" />
                  ) : (
                    <MapPin className="w-6 h-6 text-green-500" />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {appointment.service}
                    </h3>
                    <p className="text-gray-600">{appointment.doctor}</p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(backendStatus)}`}
                >
                  <StatusIcon className="w-4 h-4 inline mr-1" />
                  {getStatusText(backendStatus)}
                </span>
              </div>

              <div className="flex items-center space-x-6 mb-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(appointment.date).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{appointment.time}</span>
                </div>
              </div>

              {/* Status description message */}
              {backendStatus === "PENDING" && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Đang chờ bác sĩ xác nhận lịch hẹn...
                  </p>
                </div>
              )}
              {backendStatus === "CONFIRMED" && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Bác sĩ đã xác nhận lịch hẹn
                  </p>
                </div>
              )}
              {backendStatus === "REJECTED" && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800 flex items-center">
                    <XCircle className="w-4 h-4 mr-2" />
                    Bác sĩ không thể nhận lịch này. Vui lòng đặt lại.
                  </p>
                </div>
              )}

              {/* Action buttons based on backend status */}
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  {/* PENDING: Allow reschedule and cancel */}
                  {backendStatus === "PENDING" && (
                    <>
                      {/* <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                        Đổi lịch
                      </button> */}
                      <button
                        onClick={() => handleOpenCancelModal(appointment)}
                        className="px-4 py-2 border border-red-300 text-red-700 rounded-xl hover:bg-red-50 transition-colors text-sm"
                      >
                        Hủy lịch
                      </button>
                    </>
                  )}

                  {/* CONFIRMED: Allow join (if online), reschedule, cancel */}
                  {backendStatus === "CONFIRMED" && (
                    <>
                      {appointment.canJoin && appointment.type === "online" && (
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm">
                          Vào phòng tư vấn
                        </button>
                      )}
                      {/* <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                        Đổi lịch
                      </button> */}
                      <button
                        onClick={() => handleOpenCancelModal(appointment)}
                        className="px-4 py-2 border border-red-300 text-red-700 rounded-xl hover:bg-red-50 transition-colors text-sm"
                      >
                        Hủy lịch
                      </button>
                    </>
                  )}

                  {/* REJECTED: Allow re-booking */}
                  {backendStatus === "REJECTED" && (
                    <>
                      <button
                        onClick={() => setShowBookingForm(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm"
                      >
                        Đặt lại lịch khác
                      </button>
                    </>
                  )}

                  {/* COMPLETED: View result and chat */}
                  {backendStatus === "COMPLETED" && (
                    <>
                      <button
                        onClick={() => handleViewResult(appointment)}
                        className="px-4 py-2 bg-[#1E75FF] hover:bg-[#1659C9] text-white rounded-xl text-sm font-medium flex items-center justify-center gap-1 transition-colors"
                      >
                        <Eye size={16} />
                        <span>Xem kết quả</span>
                      </button>
                      <button
                        onClick={() => handleStartChat(appointment)}
                        disabled={isCreatingChat === appointment.id}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isCreatingChat === appointment.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <MessageCircle size={16} />
                        )}
                        <span>
                          {isCreatingChat === appointment.id
                            ? "Đang tạo..."
                            : "Nhắn tin"}
                        </span>
                      </button>
                    </>
                  )}
                </div>

                <button
                  onClick={() => toggleAppointmentExpansion(appointment.id)}
                  className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors text-sm"
                >
                  <span>{isExpanded ? "Thu gọn" : "Chi tiết"}</span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Expanded details */}
            {isExpanded && (
              <div className="border-t border-gray-100 p-6 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Thông tin chi tiết
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bác sĩ:</span>
                        <span className="font-medium">
                          {appointment.doctor}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Hình thức:</span>
                        <span className="font-medium">
                          {appointment.type === "online"
                            ? "Tư vấn online"
                            : appointment.type === "lab_test"
                              ? "Xét nghiệm"
                              : appointment.type === "follow_up"
                                ? "Tái khám"
                                : appointment.type === "direct"
                                  ? "Khám trực tiếp"
                                  : "Khám trực tiếp"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Thời gian:</span>
                        <span className="font-medium">30 phút</span>
                      </div>
                      {(appointment as any).paymentMethod && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Phương thức thanh toán:
                          </span>
                          <span className="font-medium">
                            {(appointment as any).paymentMethod === "CASH"
                              ? "Tiền mặt"
                              : (appointment as any).paymentMethod === "BANK"
                                ? "Chuyển khoản ngân hàng"
                                : "Chưa rõ"}
                          </span>
                        </div>
                      )}
                      {(appointment as any).paymentStatus && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Trạng thái thanh toán:
                          </span>
                          <span
                            className={`font-medium ${
                              (appointment as any).paymentStatus === "PAID"
                                ? "text-green-600"
                                : (appointment as any).paymentStatus ===
                                    "UNPAID"
                                  ? "text-yellow-600"
                                  : (appointment as any).paymentStatus ===
                                      "REFUNDED"
                                    ? "text-blue-600"
                                    : "text-gray-600"
                            }`}
                          >
                            {(appointment as any).paymentStatus === "PAID"
                              ? "✅ Đã thanh toán"
                              : (appointment as any).paymentStatus === "UNPAID"
                                ? "⏳ Chưa thanh toán"
                                : (appointment as any).paymentStatus ===
                                    "REFUNDED"
                                  ? "💰 Đã hoàn tiền"
                                  : "Chưa rõ"}
                          </span>
                        </div>
                      )}
                      {appointment.patientInfo && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Bệnh nhân:</span>
                          <span className="font-medium">
                            {appointment.patientInfo.fullName ||
                              appointment.patientInfo.name ||
                              "Không có thông tin"}
                          </span>
                        </div>
                      )}
                      {appointment.patientInfo?.phone && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Số điện thoại:</span>
                          <span className="font-medium">
                            {appointment.patientInfo.phone}
                          </span>
                        </div>
                      )}
                      {appointment.addressDetail && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Địa chỉ khám:</span>
                          <span className="font-medium text-right max-w-48 break-words">
                            {appointment.addressDetail}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Thông tin khám bệnh
                    </h4>
                    <div className="space-y-3 text-sm">
                      {appointment.symptoms && (
                        <div>
                          <span className="text-gray-600 block mb-1">
                            Triệu chứng:
                          </span>
                          <span className="font-medium text-gray-900 block">
                            {appointment.symptoms}
                          </span>
                        </div>
                      )}
                      {appointment.note && (
                        <div>
                          <span className="text-gray-600 block mb-1">
                            Ghi chú:
                          </span>
                          <span className="font-medium text-gray-900 block">
                            {appointment.note}
                          </span>
                        </div>
                      )}
                      {/* Removed result summary and action buttons for completed appointments */}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderBookingForm = () => (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-8 booking-form">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Đặt lịch hẹn mới
          </h3>
          <button
            onClick={() => setShowBookingForm(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Step 1: Date Selection - Now shows directly */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Chọn ngày
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Step 2: Doctor Selection - Only show after date is selected */}
        {selectedDate && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Chọn bác sĩ
            </label>

            {/* Loading state */}
            {doctorsLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500 mr-2" />
                <span className="text-gray-600">
                  Đang tải danh sách bác sĩ...
                </span>
              </div>
            )}

            {/* Error state */}
            {doctorsError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-700">{doctorsError}</span>
                </div>
                <button
                  onClick={clearError}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Thử lại
                </button>
              </div>
            )}

            {/* Doctors list */}
            {!doctorsLoading && !doctorsError && (
              <div className="space-y-3">
                {availableDoctors.length > 0 ? (
                  availableDoctors.map((doctor) => (
                    <button
                      key={doctor.id}
                      onClick={() => handleDoctorChange(doctor)}
                      className={`w-full p-4 text-left border-2 rounded-xl transition-all ${selectedDoctor?.id === doctor.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <div className="flex items-center space-x-4">
                        <img
                          src={doctor.avatar || "/api/placeholder/60/60"}
                          alt={doctor.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div>
                            <span className="text-sm font-semibold text-gray-700">
                              Tên bác sĩ:{" "}
                            </span>
                            <span className="font-medium text-gray-900">
                              {doctor.name}
                            </span>
                          </div>

                          {/* Specialty with label */}
                          <div className="mt-1">
                            <span className="text-sm font-semibold text-gray-700">
                              Chuyên khoa:{" "}
                            </span>
                            <span className="text-sm text-gray-600">
                              {doctor.specialty}
                            </span>
                          </div>

                          {/* Experience */}
                          <div className="mt-1">
                            <span className="text-sm font-semibold text-gray-700">
                              Số năm kinh nghiệm:{" "}
                            </span>
                            <span className="text-sm text-gray-600">
                              {doctor.experience}
                            </span>
                          </div>

                          {/* Rating */}
                          <div className="flex items-center space-x-1 mt-1">
                            <span className="text-sm font-semibold text-gray-700">
                              Đánh giá:{" "}
                            </span>
                            <span className="text-sm text-gray-600">
                              {doctor.rating || "Chưa có đánh giá"}
                            </span>
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          </div>

                          {/* Clinic Address with label */}
                          {doctor.clinicAddress && (
                            <div className="mt-1">
                              <div className="flex items-start space-x-1">
                                <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div>
                                  <span className="text-sm font-semibold text-gray-700">
                                    Chi nhánh:{" "}
                                  </span>
                                  <span className="text-sm text-gray-600">
                                    {doctor.clinicAddress}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Examination Fee */}
                          {doctor.examinationFee && (
                            <p className="text-sm text-blue-600 mt-1">
                              <span className="font-semibold">Phí khám: </span>
                              <span>
                                {doctor.examinationFee.toLocaleString("vi-VN")}đ
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Không có bác sĩ nào có lịch làm việc trong ngày này</p>
                    <p className="text-sm mt-1">Vui lòng chọn ngày khác</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Time Selection - Only show after doctor is selected */}
        {selectedDate && selectedDoctor && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Chọn giờ
            </label>

            {/* Loading state */}
            {timeSlotsLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500 mr-2" />
                <span className="text-gray-600">Đang tải lịch làm việc...</span>
              </div>
            )}

            {/* Error state */}
            {timeSlotsError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-700">{timeSlotsError}</span>
                </div>
                <button
                  onClick={clearTimeSlotsError}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Thử lại
                </button>
              </div>
            )}

            {/* Time slots */}
            {!timeSlotsLoading && !timeSlotsError && (
              <div className="grid grid-cols-8 gap-2">
                {(() => {
                  // Tạo danh sách tất cả khung giờ trong ngày (8:00 - 17:30)
                  const allTimeSlots = [];
                  for (let hour = 8; hour <= 17; hour++) {
                    for (let minute = 0; minute < 60; minute += 30) {
                      if (hour === 17 && minute > 0) break; // Dừng ở 17:30
                      const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
                      allTimeSlots.push(timeString);
                    }
                  }

                  // Đảm bảo availableTimeSlots là array
                  const safeAvailableTimeSlots = Array.isArray(
                    availableTimeSlots
                  )
                    ? availableTimeSlots
                    : [];

                  return allTimeSlots.map((time) => {
                    const isAvailable = safeAvailableTimeSlots.includes(time);
                    const isSelected = selectedTime === time;

                    return (
                      <button
                        key={time}
                        onClick={() => isAvailable && handleTimeChange(time)}
                        disabled={!isAvailable}
                        className={`p-2 rounded-lg text-sm font-medium transition-all ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-md"
                            : isAvailable
                              ? "border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                              : "border border-gray-200 text-gray-400 bg-gray-100 cursor-not-allowed"
                        }`}
                      >
                        {time}
                      </button>
                    );
                  });
                })()}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Appointment Type - Only show after time is selected */}
        {selectedDate && selectedDoctor && selectedTime && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hình thức khám
            </label>
            <select
              value={appointmentType}
              onChange={(e) =>
                setAppointmentType(
                  e.target.value as
                    | "direct"
                    | "online"
                    | "lab_test"
                    | "follow_up"
                )
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="direct">Khám trực tiếp</option>
              <option value="online">Tư vấn online</option>
              <option value="lab_test">Xét nghiệm</option>
              <option value="follow_up">Tái khám</option>
            </select>
          </div>
        )}

        {/* Step 5: Thông tin chi tiết - Only show after appointment type is selected */}
        {selectedDate && selectedDoctor && selectedTime && appointmentType && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Thông tin chi tiết
            </label>
            <div className="space-y-4">
              {/* Triệu chứng */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Triệu chứng <span className="text-gray-400">(Tùy chọn)</span>
                </label>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Mô tả các triệu chứng bạn đang gặp phải..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  maxLength={500}
                />
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Ghi chú thêm <span className="text-gray-400">(Tùy chọn)</span>
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Thông tin bổ sung về tình trạng sức khỏe, tiền sử bệnh, dị ứng thuốc..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  maxLength={1000}
                />
              </div>

              {/* Địa chỉ mặc định cho online */}
              {appointmentType === "online" && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center">
                    <Video className="w-5 h-5 text-blue-500 mr-2" />
                    <span className="text-sm font-medium text-blue-800">
                      Tư vấn online
                    </span>
                  </div>
                  <p className="text-sm text-blue-600 mt-1">
                    Cuộc gọi video sẽ được thực hiện qua ứng dụng. Bạn sẽ nhận
                    được link tham gia trước giờ hẹn.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Booking Error Display */}
        {bookingError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700">{bookingError}</span>
            </div>
            <button
              onClick={clearBookingError}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Submit Button - Only show when all required fields are filled */}
        {selectedDate && selectedDoctor && selectedTime && appointmentType && (
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              onClick={() => setShowBookingForm(false)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleOpenConfirmModal}
              disabled={bookingLoading || isSubmitting}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {(bookingLoading || isSubmitting) && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              <span>
                {bookingLoading || isSubmitting ? "Đang xử lý..." : "Tiếp tục"}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Effect để fetch appointments khi component mount hoặc currentUser thay đổi
  useEffect(() => {
    if (currentUser?.userId && !hasInitialFetchRef.current) {
      hasInitialFetchRef.current = true;

      const today = new Date();
      const endDate = new Date(today);
      endDate.setFullYear(today.getFullYear() + 1); // Lấy appointments trong vòng 1 năm

      fetchAppointments({
        patientId: currentUser.userId,
        startTime: "2020-01-01", // Lấy từ quá khứ để có toàn bộ lịch sử
        endTime: endDate.toISOString().split("T")[0],
        page: 0,
        size: 50,
        sortBy: "appointmentDate",
        sortDir: "DESC",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.userId]); // fetchAppointments intentionally omitted to prevent duplicate fetches

  useEffect(() => {
    // Kiểm tra nếu có dữ liệu từ CKD prediction
    const predictionData = localStorage.getItem("ckd_prediction_result");
    if (predictionData) {
      try {
        // Auto-open booking form
        setShowBookingForm(true);

        // Auto scroll đến section booking sau một chút delay
        setTimeout(() => {
          const bookingSection = document.querySelector(".booking-form");
          if (bookingSection) {
            bookingSection.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }, 500);

        // Clear localStorage sau khi đã sử dụng
        localStorage.removeItem("ckd_prediction_result");
      } catch (error) {
        // Error parsing CKD prediction data
      }
    }
  }, []);

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      {/* Header with filters */}
      <div className="mb-8">
        {/* Filters and Button in same row */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            {/* Filters */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Từ ngày
                </label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange((prev) => ({
                      ...prev,
                      start: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 h-[42px] border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đến ngày
                </label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange((prev) => ({
                      ...prev,
                      end: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 h-[42px] border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại hình
                </label>
                <select
                  value={appointmentTypeFilter}
                  onChange={(e) =>
                    setAppointmentTypeFilter(e.target.value as any)
                  }
                  className="w-full px-4 py-2 h-[42px] border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tất cả</option>
                  <option value="direct">Khám trực tiếp</option>
                  <option value="online">Tư vấn online</option>
                  <option value="lab_test">Xét nghiệm</option>
                  <option value="follow_up">Tái khám</option>
                </select>
              </div>
            </div>
            {/* Button */}
            <div className="w-full md:w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-2 opacity-0 pointer-events-none">
                Placeholder
              </label>
              <button
                onClick={() => setShowBookingForm(true)}
                className="w-full md:w-auto flex items-center justify-center space-x-2 px-6 h-[42px] bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
              >
                <span>Đặt lịch mới</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Form */}
      {showBookingForm && renderBookingForm()}

      {/* Loading state */}
      {appointmentsLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mr-3" />
          <span className="text-gray-600">Đang tải lịch sử khám bệnh...</span>
        </div>
      )}

      {/* Error state */}
      {appointmentsError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
          <div className="flex items-center">
            <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
            <div>
              <h3 className="font-medium text-red-800">
                Không thể tải lịch sử khám bệnh
              </h3>
              <p className="text-red-600 mt-1">{appointmentsError}</p>
            </div>
          </div>
          <button
            onClick={clearAppointmentsError}
            className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Timeline */}
      {!appointmentsLoading && !appointmentsError && (
        <div className="space-y-0">
          {/* 1. Today appointments - LUÔN hiển thị */}
          <div className="mb-12">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <h2 className="text-xl font-semibold text-gray-900">
                Cuộc hẹn hôm nay
              </h2>
            </div>
            {todayAppointments.length > 0 ? (
              todayAppointments.map((appointment, index) =>
                renderTimelineEntry(
                  appointment,
                  index === todayAppointments.length - 1
                )
              )
            ) : (
              <div className="ml-12 text-center py-8 bg-orange-50 rounded-xl border border-orange-200">
                <Clock className="w-12 h-12 text-orange-300 mx-auto mb-3" />
                <p className="text-orange-600 text-sm">
                  Không có cuộc hẹn hôm nay
                </p>
              </div>
            )}
          </div>

          {/* 2. Future appointments - LUÔN hiển thị */}
          <div className="mb-16">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <h2 className="text-xl font-semibold text-gray-900">
                Lịch hẹn sắp tới
              </h2>
            </div>
            {futureAppointments.length > 0 ? (
              futureAppointments.map((appointment, index) =>
                renderTimelineEntry(
                  appointment,
                  index === futureAppointments.length - 1
                )
              )
            ) : (
              <div className="ml-12 text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  Không có lịch hẹn sắp tới
                </p>
              </div>
            )}
          </div>

          {/* 3. Past appointments - LUÔN hiển thị */}
          <div className="mb-12 mt-16">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <h2 className="text-xl font-semibold text-gray-900">
                Lịch sử khám bệnh
              </h2>
            </div>
            {pastAppointments.length > 0 ? (
              pastAppointments.map((appointment, index) =>
                renderTimelineEntry(
                  appointment,
                  index === pastAppointments.length - 1
                )
              )
            ) : (
              <div className="ml-12 text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  Chưa có lịch sử khám bệnh
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Medical Result Modal */}
      <MedicalResultModal
        isOpen={showResultModal}
        onClose={handleCloseResultModal}
        appointmentId={selectedAppointmentId}
        patientInfo={{
          name: currentUser?.fullName || "Bệnh nhân",
          id: currentUser?.userId || "",
          phone: currentUser?.phone || "",
          email: currentUser?.email || "",
        }}
        doctorInfo={selectedDoctorInfo ?? undefined}
      />

      {/* Modal xác nhận hủy lịch */}
      <AnimatePresence>
        {showCancelModal && selectedAppointmentForCancel && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Xác nhận hủy lịch hẹn
                </h3>
                <p className="text-gray-600 mb-6">
                  Bạn có chắc chắn muốn hủy lịch hẹn này không? Bác sĩ sẽ nhận
                  được thông báo về việc hủy lịch.
                </p>

                {/* Thông tin lịch hẹn */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Bác sĩ:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedAppointmentForCancel.doctor}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Dịch vụ:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedAppointmentForCancel.service}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Ngày:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(
                        selectedAppointmentForCancel.date
                      ).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Giờ:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedAppointmentForCancel.time}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCloseCancelModal}
                    disabled={isCanceling}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleCancelAppointment}
                    disabled={isCanceling}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isCanceling ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang xử lý...</span>
                      </>
                    ) : (
                      <span>Xác nhận hủy</span>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal xác nhận đặt lịch với phương thức thanh toán */}
      {selectedDoctor && (
        <AppointmentConfirmationModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmBooking}
          isLoading={isProcessingPayment}
          doctorInfo={selectedDoctor}
          patientInfo={{
            name: currentUser?.fullName || "Bệnh nhân",
            phone: currentUser?.phone || undefined,
            email: currentUser?.email || undefined,
          }}
          appointmentDate={selectedDate}
          appointmentTime={selectedTime}
          appointmentType={appointmentType}
          symptoms={symptoms}
          note={note}
          addressDetail={
            appointmentType === "online"
              ? "Tại nhà"
              : selectedDoctor.clinicAddress || branches[0].address
          }
        />
      )}
    </div>
  );
}
