"use client";

import React, { useState, useEffect } from "react";
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
  Stethoscope,
  History,
  Brain,
  Activity,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  Save,
  UserCheck,
  Pill,
  ClipboardList,
  Heart,
  Thermometer,
  Weight,
  Zap,
  XCircle,
  Loader2,
} from "lucide-react";
import DoctorScheduleRegistrationModal from "./DoctorScheduleRegistrationModal";
import type { AppointmentWeekFilterResponse } from "@/lib/api/appointments";
import { useDoctorAppointments } from "@/hooks/appointments";
import { useAppointmentFilter } from "@/hooks/appointments/useAppointmentFilter";
import { useBookingAppointment } from "@/hooks/appointments/useBookingAppointment";
import { useScheduleFollowUp } from "@/hooks/appointments/useScheduleFollowUp";
import { useGetMe } from "@/hooks/auth/useGetMe";
import {
  useCreateMedicalRecord,
  useGetMedicalRecords,
} from "@/hooks/medical-records";
import { useCreateMultiplePrescriptions } from "@/hooks/prescriptions";
import { useDoctorSchedule } from "@/hooks/doctor-schedules";
import { getAppointmentDetail } from "@/lib/api/appointments";
import { useUpdateAppointmentStatus } from "@/hooks/appointments/useUpdateAppointmentStatus";
import { useAppointmentSocket } from "@/hooks/appointments/useAppointmentSocket";
import { useGetPredict } from "@/hooks/predict";
import type { PredictData } from "@/lib/api/predict";
import { toast } from "sonner";
import { webSocketAppointmentService } from "@/services/websocket-appointment";
import { MedicalResultModal } from "@/components/MedicalResultModal";
import { SignaturePad } from "@/components/SignaturePad";
import type { MedicalRecordWithPrescriptions } from "@/types/medical-record";
// Sample patient data for examination modal
const patientData = {
  "patient-001": {
    name: "Nguyễn Văn An",
    age: 45,
    gender: "Nam",
    id: "BN001",
    aiPrediction: {
      riskLevel: "moderate",
      riskPercentage: 78,
      description: "Chức năng thận giảm trung bình - cần theo dõi",
      keyIndicators: [
        {
          name: "eGFR",
          value: "45 mL/min/1.73m²",
          status: "low",
        },
        {
          name: "Creatinine",
          value: "1.8 mg/dL",
          status: "high",
        },
        {
          name: "BUN",
          value: "28 mg/dL",
          status: "high",
        },
        {
          name: "Protein niệu",
          value: "0.8g/kg",
          status: "present",
        },
      ],
      recommendations: [
        "Theo dõi chức năng thận định kỳ mỗi 3 tháng",
        "Giảm lượng protein xuống 0.8g/kg cân nặng/ngày",
        "Hạn chế muối dưới 5g/ngày",
        "Kiểm tra định kỳ với bác sĩ chuyên khoa thận",
      ],
    },
    medicalHistory: [
      {
        date: "15/12/2023",
        doctor: "Dr. Trần Minh Hoàng",
        diagnosis: "CKD giai đoạn 2",
        treatment: "ACE inhibitor, điều chỉnh chế độ ăn",
        labResults: {
          eGFR: 65,
          creatinine: 1.2,
        },
      },
      {
        date: "20/10/2023",
        doctor: "Dr. Lê Minh Cường",
        symptoms: "Mệt mỏi, tiểu đêm nhiều",
        findings: "Phát hiện suy giảm chức năng thận nhẹ",
      },
    ],
  },
};
const drugDatabase = [
  {
    id: 1,
    name: "Lisinopril 10mg",
    category: "ACE Inhibitor",
  },
  {
    id: 2,
    name: "Amlodipine 5mg",
    category: "Calcium Channel Blocker",
  },
  {
    id: 3,
    name: "Furosemide 40mg",
    category: "Diuretic",
  },
  {
    id: 4,
    name: "Metformin 500mg",
    category: "Antidiabetic",
  },
  {
    id: 5,
    name: "Atorvastatin 20mg",
    category: "Statin",
  },
];
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
  activeView?: string;
}

export const AppointmentAndConsultationModule = ({
  activeView = "appointments",
}: AppointmentAndConsultationModuleProps) => {
  const [appointmentTab, setAppointmentTab] = useState("pending"); // Changed default to 'pending'
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [consultationTab, setConsultationTab] = useState("profile");
  const [chatMessage, setChatMessage] = useState("");
  const [prescription, setPrescription] = useState("");
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);

  // States cho Medical Result Modal
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] =
    useState<string>("");
  const [selectedDoctorInfo, setSelectedDoctorInfo] = useState<{
    name: string;
    specialty?: string;
    id?: string;
  } | null>(null);
  const [selectedPatientInfo, setSelectedPatientInfo] = useState<{
    name: string;
    id: string;
    phone?: string;
    email?: string;
  } | null>(null);

  const { data: me } = useGetMe();

  useEffect(() => {
    // Component mounted
  }, [me, activeView]);
  const {
    appointments: doctorWeekAppointments,
    loading: doctorAptLoading,
    error: doctorAptError,
    fetchDoctorAppointments,
    clearError: clearDoctorAptError,
  } = useDoctorAppointments();

  const {
    appointments: completedAppointments,
    loading: completedLoading,
    error: completedError,
    fetchAppointments: fetchCompletedAppointments,
    clearError: clearCompletedError,
  } = useAppointmentFilter();

  const {
    create: createMedicalRecord,
    loading: medicalRecordLoading,
    error: medicalRecordError,
  } = useCreateMedicalRecord();
  const {
    createMultiple: createPrescriptions,
    loading: prescriptionsLoading,
    error: prescriptionsError,
  } = useCreateMultiplePrescriptions();

  const { updateStatus, loading: updateStatusLoading } =
    useUpdateAppointmentStatus();

  const {
    data: predictData,
    loading: predictLoading,
    error: predictError,
    fetchPredict,
  } = useGetPredict();

  const { scheduleFollowUp } = useScheduleFollowUp();
  const { timeSlots, scheduleId, timeSlotMapping, fetchDoctorSchedule } =
    useDoctorSchedule();

  const [enableFollowUp, setEnableFollowUp] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpType, setFollowUpType] = useState("Tái khám");
  const [followUpTimeSlot, setFollowUpTimeSlot] = useState<number | null>(null);
  const [followUpScheduleId, setFollowUpScheduleId] = useState<string | null>(
    null
  );
  const [followUpTimeSlots, setFollowUpTimeSlots] = useState<any[]>([]);
  const [loadingFollowUpSlots, setLoadingFollowUpSlots] = useState(false);
  const [openScheduleModalForFollowUp, setOpenScheduleModalForFollowUp] =
    useState(false);
  const [followUpNote, setFollowUpNote] = useState(""); // Ghi chú tái khám (optional)

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedAppointmentForAction, setSelectedAppointmentForAction] =
    useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  useAppointmentSocket(() => {
    if (me?.userId) {
      const { start, end } = getWideDateRange();
      fetchDoctorAppointments({
        doctorId: me.userId,
        startTime: start,
        endTime: end,
      });

      if (appointmentTab === "completed") {
        fetchCompletedAppointments({
          status: "COMPLETED",
          page: 0,
          size: 50,
          sortBy: "appointmentDate",
          sortDir: "DESC",
        });
      }
    }
  });

  useEffect(() => {
    const fetchFollowUpTimeSlots = async () => {
      if (followUpDate && me?.userId) {
        setLoadingFollowUpSlots(true);
        try {
          await fetchDoctorSchedule(me.userId, followUpDate);
        } catch (error) {
          toast.error("Không thể tải lịch làm việc");
        } finally {
          setLoadingFollowUpSlots(false);
        }
      } else {
        setFollowUpTimeSlots([]);
        setFollowUpScheduleId(null);
        setFollowUpTimeSlot(null);
      }
    };

    fetchFollowUpTimeSlots();
  }, [followUpDate, me?.userId, fetchDoctorSchedule]);

  useEffect(() => {
    if (timeSlots && timeSlots.length > 0) {
      const slotsWithId = timeSlots.map((time) => ({
        slotId: timeSlotMapping[time],
        startTime: time + ":00",
        endTime: "",
      }));
      setFollowUpTimeSlots(slotsWithId);
    } else {
      setFollowUpTimeSlots([]);
    }

    if (scheduleId) {
      setFollowUpScheduleId(scheduleId);
    }
  }, [timeSlots, scheduleId, timeSlotMapping]);

  const handleOpenRejectModal = (appointment: any) => {
    setSelectedAppointmentForAction(appointment);
    setShowRejectModal(true);
  };

  const handleConfirmAppointment = async (appointment: any) => {
    if (!appointment) return;

    const success = await updateStatus(
      appointment.appointmentId || appointment.id,
      "CONFIRMED",
      undefined,
      {
        patientId: appointment.patientId,
        doctorId: me?.userId,
      }
    );

    if (success) {
      if (me?.userId) {
        const { start, end } = getWideDateRange();
        fetchDoctorAppointments({
          doctorId: me.userId,
          startTime: start,
          endTime: end,
        });
      }
    }
  };

  const handleRejectAppointment = async () => {
    if (!selectedAppointmentForAction || !me?.userId) {
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

    setIsRejecting(true);

    try {
      const appointmentId =
        selectedAppointmentForAction.appointmentId ||
        selectedAppointmentForAction.id;

      if (!appointmentId) {
        throw new Error("Không tìm thấy ID lịch hẹn");
      }

      const patientId = selectedAppointmentForAction.patientId;

      if (!patientId) {
        throw new Error(
          "Không tìm thấy thông tin bệnh nhân. Vui lòng thử lại sau."
        );
      }

      // Gửi WebSocket event để từ chối lịch hẹn
      webSocketAppointmentService.sendScheduleEvent({
        appointmentId: appointmentId,
        patientId: patientId,
        doctorId: me.userId,
        event: "REJECT_APPOINTMENT",
        skipRefetchForUserId: me.userId, // Skip refetch cho doctor vì họ đã biết
      });

      // Đóng modal
      setShowRejectModal(false);
      setSelectedAppointmentForAction(null);

      // Hiển thị toast loading với ID để có thể dismiss khi nhận response
      const toastId = `reject-${appointmentId}`;
      toast.loading("Đang từ chối lịch hẹn...", {
        description: "Vui lòng chờ trong giây lát",
        duration: Infinity, // Không tự động dismiss, sẽ dismiss khi nhận response
        id: toastId,
      });

      // Note: WebSocket response sẽ được handle bởi WebSocketAppointmentContext
      // và sẽ tự động refetch appointments và hiển thị toast success/error
    } catch (error: any) {
      // Dismiss loading toast nếu có lỗi
      const appointmentId =
        selectedAppointmentForAction?.appointmentId ||
        selectedAppointmentForAction?.id;
      if (appointmentId) {
        toast.dismiss(`reject-${appointmentId}`);
      }

      toast.error("Không thể từ chối lịch hẹn", {
        description: error.message || "Có lỗi xảy ra. Vui lòng thử lại.",
        duration: 4000,
      });
    } finally {
      setIsRejecting(false);
    }
  };

  // Utility functions for week calculation
  const getWeekStartEnd = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday as start
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return {
      start: startOfWeek.toISOString().split("T")[0], // YYYY-MM-DD
      end: endOfWeek.toISOString().split("T")[0], // YYYY-MM-DD
    };
  };

  // Utility function để lấy date range rộng (từ hôm nay đến 2 năm sau) - dùng cho fetch TẤT CẢ appointments
  const getWideDateRange = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const twoYearsLater = new Date(today);
    twoYearsLater.setFullYear(today.getFullYear() + 2);
    twoYearsLater.setHours(23, 59, 59, 999);

    return {
      start: today.toISOString().split("T")[0], // YYYY-MM-DD
      end: twoYearsLater.toISOString().split("T")[0], // YYYY-MM-DD
    };
  };

  const formatWeekRange = (date: Date) => {
    const { start, end } = getWeekStartEnd(date);
    const startDate = new Date(start);
    const endDate = new Date(end);

    const formatDate = (d: Date) =>
      `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  // Fetch appointments when currentWeek or doctorId changes
  React.useEffect(() => {
    if (!me?.userId) return;
    const { start, end } = getWideDateRange();
    fetchDoctorAppointments({
      doctorId: me.userId,
      startTime: start,
      endTime: end,
    });
  }, [me?.userId, fetchDoctorAppointments]);

  // Debug: Log appointments when they change
  React.useEffect(() => {
    // Removed verbose debug logs
  }, [doctorWeekAppointments, doctorAptLoading, doctorAptError]);

  // Fetch completed appointments khi chuyển sang tab completed
  React.useEffect(() => {
    if (appointmentTab === "completed") {
      fetchCompletedAppointments({
        status: "COMPLETED",
        page: 0,
        size: 50,
        sortBy: "appointmentDate",
        sortDir: "DESC",
      });
    }
  }, [appointmentTab, fetchCompletedAppointments]);

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Track recently completed appointments to filter them out optimistically
  const [recentlyCompletedAppointmentIds, setRecentlyCompletedAppointmentIds] =
    useState<Set<string>>(new Set());

  // Work schedule modal states
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    date: "",
    time: "",
    type: "offline",
    repeat: "none",
    notes: "",
  });

  // Examination modal states
  const [showExaminationModal, setShowExaminationModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [examinationTab, setExaminationTab] = useState("examination");

  // State for current patient medical records
  const [currentPatientId, setCurrentPatientId] = useState<string | undefined>(
    undefined
  );

  // Fetch medical records for current patient
  const {
    records: patientMedicalRecords,
    loading: medicalRecordsLoading,
    error: medicalRecordsError,
    refetch: refetchMedicalRecords,
  } = useGetMedicalRecords(currentPatientId);

  const [symptoms, setSymptoms] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [customDiagnosis, setCustomDiagnosis] = useState("");
  const [diagnosisNotes, setDiagnosisNotes] = useState("");
  const [treatment, setTreatment] = useState("");
  const [doctorNote, setDoctorNote] = useState("");
  const [stage, setStage] = useState("");
  const [statusHealth, setStatusHealth] = useState("");
  const [serviceName, setServiceName] = useState("Thận - Tiết niệu");
  const [customServiceName, setCustomServiceName] = useState("");
  const [imageAttachments, setImageAttachments] = useState([]);
  const [prescriptionRows, setPrescriptionRows] = useState(() => {
    const today = new Date().toISOString().split("T")[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    return [
      {
        drug: "",
        dosage: "",
        quantity: "",
        usage: "",
        notes: "",
        startDate: today,
        endDate: nextWeek,
      },
    ];
  });
  const [prescriptionNotes, setPrescriptionNotes] =
    useState(`• Uống thuốc đều đặn theo giờ
• Theo dõi huyết áp hàng ngày
• Hạn chế muối trong thức ăn
• Tái khám sau 4 tuần
• Liên hệ ngay nếu có triệu chứng bất thường...`);
  const [signature, setSignature] = useState<string | null>(null);
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
      toast.success("Đã lưu và gửi đơn thuốc cho bệnh nhân", {
        description: "Đơn thuốc đã được gửi thành công",
        duration: 3000,
      });
      setPrescription("");
    }
  };
  const handleSaveSchedule = () => {
    if (scheduleForm.date && scheduleForm.time) {
      toast.success("Đã đăng ký lịch làm việc thành công", {
        description: "Lịch làm việc đã được cập nhật",
        duration: 3000,
      });
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
  const handleSaveScheduleFromModal = (data: any) => {
    // Schedule data đã được xử lý trong modal và gọi API
    // Modal sẽ tự động đóng sau khi API thành công

    // Refresh appointments data
    if (me?.userId) {
      const { start, end } = getWideDateRange();
      fetchDoctorAppointments({
        doctorId: me.userId,
        startTime: start,
        endTime: end,
      });
      toast.success("Đăng ký lịch làm việc thành công!");
    }
  };
  const openPatientExamination = (patientId: string, appointment: any) => {
    // Xác định patientId thực tế từ appointment data
    const actualPatientId =
      appointment.patientId || appointment.patientInfo?.id || patientId;

    // Fetch medical records from API for this patient
    setCurrentPatientId(actualPatientId);

    // Fetch predict data if appointment has prediction
    if (appointment.hasAIPrediction && actualPatientId) {
      fetchPredict(actualPatientId);
    }

    // Ưu tiên dữ liệu có sẵn trong mock nếu khớp id
    const patientFromMock = patientData[patientId as keyof typeof patientData];

    // Tạo fallback patient từ dữ liệu cuộc hẹn nhận từ API
    const fallbackPatient = {
      name: appointment.patient || appointment.patientName || "Bệnh nhân",
      age: appointment.patientInfo?.age || "",
      gender: appointment.patientInfo?.gender || "Không rõ",
      id: actualPatientId || undefined, // Không gán 'N/A', để undefined nếu không có
    };

    const patient = patientFromMock || fallbackPatient;

    setSelectedPatient({
      ...patient,
      appointment,
    });
    setShowExaminationModal(true);
    setExaminationTab("examination");
  };
  const viewPatientHistory = (patientId: string) => {
    // Fetch medical records from API instead of mock data
    setCurrentPatientId(patientId);
    setShowExaminationModal(true);
    setExaminationTab("history");

    // Keep mock patient data for other info (will be replaced gradually)
    const patient = patientData[patientId as keyof typeof patientData];
    if (patient) {
      setSelectedPatient(patient);
    }
  };

  // Helper functions for medical records
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "--";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN");
    } catch {
      return "--";
    }
  };

  const parseFrequency = (freq: string[] | string): string[] => {
    try {
      if (Array.isArray(freq)) {
        return freq;
      }
      const cleaned = freq.replace(/[{}]/g, "");
      return cleaned.split(",").map((f) => f.trim());
    } catch {
      return [];
    }
  };

  const frequencyMap: Record<string, string> = {
    MORNING: "Sáng",
    AFTERNOON: "Trưa",
    EVENING: "Tối",
  };

  // Handler cho Medical Result Modal
  const handleViewResult = (appointment: any) => {
    setSelectedAppointmentId(appointment.id);

    // Set doctor info (current user info)
    setSelectedDoctorInfo({
      name: me?.fullName || "Bác sĩ",
      specialty: undefined, // TODO: Add specialty to user profile
      id: me?.userId || undefined,
    });

    // Set patient info từ appointment data
    setSelectedPatientInfo({
      name: appointment.patient || "Bệnh nhân",
      id: appointment.patientId || "",
      phone: appointment.patientPhone || undefined,
      email: appointment.patientEmail || undefined,
    });

    setShowResultModal(true);
  };

  const handleCloseResultModal = () => {
    setShowResultModal(false);
    setSelectedAppointmentId("");
    setSelectedDoctorInfo(null);
    setSelectedPatientInfo(null);
  };
  const addPrescriptionRow = () => {
    const today = new Date().toISOString().split("T")[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    setPrescriptionRows([
      ...prescriptionRows,
      {
        drug: "",
        dosage: "",
        quantity: "",
        usage: "",
        notes: "",
        startDate: today,
        endDate: nextWeek,
      },
    ]);
  };
  const removePrescriptionRow = (index: number) => {
    if (prescriptionRows.length > 1) {
      setPrescriptionRows(prescriptionRows.filter((_, i) => i !== index));
    }
  };
  const updatePrescriptionRow = (
    index: number,
    field: string,
    value: string
  ) => {
    const newRows = [...prescriptionRows];
    newRows[index] = {
      ...newRows[index],
      [field]: value,
    };
    setPrescriptionRows(newRows);
  };
  const handleCompleteExamination = async () => {
    if (!selectedPatient?.appointment || !me?.userId) {
      toast.error("Không có thông tin lịch hẹn hoặc bác sĩ", {
        description: "Vui lòng kiểm tra lại thông tin",
        duration: 4000,
      });
      return;
    }

    // Validation basic required fields
    if (!diagnosis && !customDiagnosis) {
      toast.error("Vui lòng nhập chẩn đoán", {
        description: "Chẩn đoán là thông tin bắt buộc",
        duration: 4000,
      });
      return;
    }

    if (!serviceName) {
      toast.error("Vui lòng chọn dịch vụ khám", {
        description: "Dịch vụ khám là thông tin bắt buộc",
        duration: 4000,
      });
      return;
    }

    if (serviceName === "other" && !customServiceName.trim()) {
      toast.error("Vui lòng nhập tên dịch vụ khám", {
        description: "Tên dịch vụ khám không được để trống",
        duration: 4000,
      });
      return;
    }

    // Validate signature
    if (!signature) {
      toast.error("Vui lòng ký xác nhận trước khi hoàn thành khám", {
        description: "Chữ ký bác sĩ là bắt buộc",
        duration: 4000,
      });
      return;
    }

    // Validate follow-up appointment nếu có bật checkbox
    if (enableFollowUp) {
      if (!followUpDate) {
        toast.error("Vui lòng chọn ngày tái khám", {
          description: "Ngày tái khám là bắt buộc",
          duration: 4000,
        });
        return;
      }
      if (!followUpTimeSlot) {
        toast.error("Vui lòng chọn giờ khám tái khám", {
          description: "Giờ khám là bắt buộc khi đặt lịch tái khám",
          duration: 4000,
        });
        return;
      }
    }

    try {
      // LẤY THÔNG TIN CHI TIẾT APPOINTMENT để có patientId

      const appointmentId =
        selectedPatient.appointment.id ||
        selectedPatient.appointment.appointmentId;

      // Ưu tiên lấy patientId từ appointment data, KHÔNG dùng selectedPatient.id nếu nó là 'N/A'

      // Try ALL possible field names for patientId
      let patientId =
        selectedPatient.appointment.patientId ||
        selectedPatient.appointment.patient_id ||
        selectedPatient.appointment.userId ||
        selectedPatient.appointment.user_id ||
        selectedPatient.appointment.clientId ||
        selectedPatient.appointment.client_id ||
        selectedPatient.appointment.patientInfo?.id ||
        selectedPatient.appointment.patient?.id;

      // Nếu không có trong appointment, thử lấy từ selectedPatient.id (nhưng không phải 'N/A')
      if (!patientId && selectedPatient.id && selectedPatient.id !== "N/A") {
        patientId = selectedPatient.id;
      }

      // Validate patientId - không cho phép 'N/A' hoặc giá trị không hợp lệ
      if (!patientId || patientId === "N/A" || patientId.trim() === "") {
        try {
          const appointmentDetail = await getAppointmentDetail(appointmentId);
          patientId = appointmentDetail.patientId;
        } catch (detailError) {
          // Fallback: sử dụng một ID giả định hoặc lỗi
          throw new Error("Không thể xác định patientId cho appointment này");
        }
      }

      // Final validation trước khi gửi
      if (!patientId || patientId === "N/A" || patientId.trim() === "") {
        throw new Error("Không thể xác định PatientId hợp lệ cho cuộc hẹn này");
      }

      // BƯỚC 1: Tạo medical record

      const medicalRecordData = {
        appointmentId,
        patientId,
        doctorId: me.userId,
        serviceName:
          serviceName === "other"
            ? customServiceName
            : serviceName || "Khám tổng quát",
        diagnosis: diagnosis || "",
        symptoms: symptoms || "",
        treatment: treatment || "",
        doctorNote: prescriptionNotes || "", // Map từ tab Kê đơn thuốc
        followUpDate: enableFollowUp && followUpDate ? followUpDate : "",
        imageAttachments: imageAttachments || [],
        signature: signature || "", // Doctor's fullName from SignaturePad
        stage: stage ? parseInt(stage) : 0,
        statusHealth: statusHealth || "STABLE",
      };

      const medicalRecord = await createMedicalRecord(medicalRecordData);

      // Kiểm tra recordId từ response (theo type definition chỉ có recordId field)
      const recordId = medicalRecord?.recordId;

      if (!medicalRecord || !recordId) {
        throw new Error("Không thể tạo hồ sơ khám - không nhận được recordId");
      }

      // Cập nhật medicalRecord để đảm bảo có recordId
      medicalRecord.recordId = recordId;

      // BƯỚC 2: Tạo prescriptions (chỉ những dòng có thuốc)
      const validPrescriptions = prescriptionRows
        .filter(
          (row) => row.drug && row.drug.trim() !== "" && row.dosage && row.usage
        )
        .map((row) => ({
          medicalRecordId: recordId, // Sử dụng recordId đã extract
          medicalName: row.drug, // Backend DTO field is camelCase (matches CreatePrescriptionRequest)
          dosage: row.dosage,
          frequency: row.usage ? row.usage.split(",") : [], // Transform string to array
          startDate: row.startDate || "",
          endDate: row.endDate || "",
          notes: row.notes || "",
        }));

      // Kiểm tra nếu có prescription rows nhưng không valid → thiếu thông tin
      if (validPrescriptions.length === 0 && prescriptionRows.length > 0) {
        // Tìm các dòng thiếu thông tin
        const incompletedRows = prescriptionRows.filter((row) => {
          const hasDrug = row.drug && row.drug.trim() !== "";
          const hasDosage = row.dosage && row.dosage.trim() !== "";
          const hasUsage = row.usage && row.usage.trim() !== "";
          return hasDrug || hasDosage || hasUsage; // Có ít nhất 1 field được điền
        });

        if (incompletedRows.length > 0) {
          toast.error("Đơn thuốc chưa đầy đủ thông tin", {
            description:
              "Vui lòng điền đầy đủ: Tên thuốc, Liều lượng và Cách dùng cho từng loại thuốc. Hoặc xóa các dòng thuốc trống.",
            duration: 6000,
          });
          return; // Dừng lại, không cho phép hoàn thành khám
        }
      }

      if (validPrescriptions.length > 0) {
        const prescriptionResult =
          await createPrescriptions(validPrescriptions);

        if (prescriptionResult.failed.length > 0) {
          toast.warning("Một số đơn thuốc không thể lưu", {
            description: `Đã lưu ${prescriptionResult.successful.length}/${prescriptionRows.length} đơn thuốc`,
            duration: 5000,
          });
        }
      }

      // BƯỚC 3: Đặt lịch tái khám (NẾU CÓ) - SỬ DỤNG API MỚI
      if (
        enableFollowUp &&
        followUpDate &&
        followUpTimeSlot &&
        followUpScheduleId
      ) {
        try {
          // Dùng API mới scheduleFollowUpByDoctor
          // Backend tự động set consultationType = FOLLOW_UP, status = CONFIRMED
          const followUpAppointmentData = {
            medicalRecordId: recordId, // ← QUAN TRỌNG: Link đến Medical Record vừa tạo
            patientId: patientId,
            doctorId: me.userId,
            scheduleId: followUpScheduleId,
            slotId: followUpTimeSlot,
            appointmentDate: followUpDate,
            note:
              followUpNote ||
              `Tái khám theo chỉ định của bác sĩ - ${followUpType}`, // Optional
            payment_method: "CASH" as const, // Default to CASH for doctor-scheduled follow-ups
          };

          const followUpResult = await scheduleFollowUp(
            followUpAppointmentData
          );

          if (followUpResult) {
            const selectedSlot = followUpTimeSlots.find(
              (s) => s.slotId === followUpTimeSlot
            );

            toast.success("Đã đặt lịch tái khám thành công!", {
              description: `${new Date(followUpDate).toLocaleDateString("vi-VN")} - ${selectedSlot?.startTime.substring(0, 5)} (Tự động xác nhận)`,
              duration: 4000,
            });
          }
        } catch (followUpError: any) {
          toast.warning("Đã lưu hồ sơ khám nhưng không thể đặt lịch tái khám", {
            description:
              followUpError.response?.data?.message ||
              "Vui lòng đặt lịch tái khám thủ công",
            duration: 5000,
          });
        }
      }

      // Lưu ý: Backend tự động cập nhật appointment status thành COMPLETED khi tạo medical record
      // Không cần gọi API update status riêng để tránh duplicate

      // SUCCESS: Đóng modal, reset form và refresh data
      toast.success("Đã hoàn thành khám bệnh!", {
        description:
          enableFollowUp && followUpDate
            ? "Hồ sơ khám, đơn thuốc và lịch tái khám đã được lưu"
            : "Hồ sơ khám và đơn thuốc đã được lưu",
        duration: 3000,
      });
      setShowExaminationModal(false);
      resetFormData();

      // Optimistic update: Đánh dấu appointment này là đã hoàn thành ngay lập tức
      const completedAppointmentId = appointmentId;
      if (completedAppointmentId) {
        setRecentlyCompletedAppointmentIds((prev) =>
          new Set(prev).add(completedAppointmentId)
        );
      }

      // Refresh danh sách appointments - đợi backend xử lý xong
      if (me?.userId) {
        // Thêm delay nhỏ để đảm bảo backend đã cập nhật status thành COMPLETED
        await new Promise((resolve) => setTimeout(resolve, 500));

        const { start, end } = getWideDateRange();

        // Fetch lại appointments và đợi hoàn thành
        await fetchDoctorAppointments({
          doctorId: me.userId,
          startTime: start,
          endTime: end,
        });

        // Nếu đang ở tab completed, cũng fetch lại completed appointments
        if (appointmentTab === "completed") {
          await fetchCompletedAppointments({
            status: "COMPLETED",
            page: 0,
            size: 50,
            sortBy: "appointmentDate",
            sortDir: "DESC",
          });
        }

        // Sau khi refetch xong, xóa appointmentId khỏi recentlyCompletedAppointmentIds
        // vì backend đã cập nhật status, appointment sẽ tự động bị filter bởi status check
        if (completedAppointmentId) {
          setTimeout(() => {
            setRecentlyCompletedAppointmentIds((prev) => {
              const newSet = new Set(prev);
              newSet.delete(completedAppointmentId);
              return newSet;
            });
          }, 2000); // Xóa sau 2 giây để đảm bảo refetch đã hoàn thành
        }
      }
    } catch (error: any) {
      toast.error("Có lỗi xảy ra khi khám bệnh", {
        description: error.message || "Không thể hoàn thành khám bệnh",
        duration: 5000,
      });
    }
  };

  const resetFormData = () => {
    // Reset form data
    setSymptoms("");
    setDiagnosis("");
    setCustomDiagnosis("");
    setDiagnosisNotes("");
    setTreatment("");
    setDoctorNote("");
    setStage("");
    setStatusHealth("");
    setServiceName("Thận - Tiết niệu");
    setCustomServiceName("");
    setImageAttachments([]);

    const today = new Date().toISOString().split("T")[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    setPrescriptionRows([
      {
        drug: "",
        dosage: "",
        quantity: "",
        usage: "",
        notes: "",
        startDate: today,
        endDate: nextWeek,
      },
    ]);

    // Reset follow-up fields
    setEnableFollowUp(false);
    setFollowUpDate("");
    setFollowUpType("Tái khám");
    setFollowUpTimeSlot(null);
    setFollowUpScheduleId(null);
    setFollowUpTimeSlots([]);
    setFollowUpNote(""); // Reset ghi chú tái khám
    setSignature(null);
  };
  // Chuyển dữ liệu API thành format cũ của UI
  const normalizedAppointments = React.useMemo(() => {
    // Transform doctor week appointments (cho tab upcoming)
    const weekAppointments = (doctorWeekAppointments ?? [])
      .map((apt: AppointmentWeekFilterResponse, idx: number) => ({
        id: apt.appointmentId || idx,
        appointmentId: apt.appointmentId, // Preserve original appointmentId
        patient: apt.patientName,
        time: apt.timeSlot?.startTime || "",
        date:
          typeof apt.date === "string"
            ? apt.date
            : new Date(apt.date as any).toISOString().split("T")[0],
        service: apt.note || "Khám trực tiếp",
        status: (apt.status || "CONFIRMED").toString().toLowerCase(),
        type: "offline",
        hasAIPrediction: apt.hasPredict || false,
        patientId: apt.patientId, // Preserve original patientId (không fallback về empty string)
        // Preserve original data for examination modal
        note: apt.note,
        symptoms: apt.symptoms,
        // Preserve original appointment data để có thể lấy thông tin đầy đủ
        originalAppointment: apt,
      }))
      // Loại bỏ các lịch đã hoàn thành khỏi nguồn tuần để tránh trùng khi gộp với completed
      // Và loại bỏ các appointment vừa hoàn thành (optimistic update)
      .filter((apt) => {
        const isCompleted = apt.status === "completed";
        const isRecentlyCompleted =
          apt.appointmentId &&
          recentlyCompletedAppointmentIds.has(apt.appointmentId);
        return !isCompleted && !isRecentlyCompleted;
      });

    // Transform completed appointments (cho tab completed)
    const completedAppointmentsNormalized = (completedAppointments ?? []).map(
      (apt: any, idx: number) => ({
        id: apt.appointmentId || `completed-${idx}`,
        appointmentId: apt.appointmentId, // Preserve original appointmentId
        patient: apt.patient?.fullName || apt.patient?.name || "Bệnh nhân", // Patient name for display
        time: apt.timeSlot?.startTime || "",
        date: apt.appointmentDate || "",
        service: apt.note || "Khám trực tiếp",
        status: "completed",
        type:
          apt.consultationType === "ONLINE_CONSULTATION" ? "online" : "offline",
        hasAIPrediction: apt.hasPredict || false,
        patientId: apt.patient?.id || apt.patientId, // Ưu tiên patient.id, fallback về patientId nếu có
        patientInfo: apt.patient, // Preserve full patient object with different name
        // Preserve original data for examination modal
        note: apt.note,
        symptoms: apt.symptoms,
        // Preserve original appointment data
        originalAppointment: apt,
      })
    );

    // Merge cả 2 sources
    return [...weekAppointments, ...completedAppointmentsNormalized];
  }, [
    doctorWeekAppointments,
    completedAppointments,
    recentlyCompletedAppointmentIds,
  ]);

  // Helper: Categorize appointments by time - UNIFIED for all tabs (similar to patient page)
  const categorizeAppointmentsByTime = (appointments: any[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const futureAppointments: any[] = [];
    const todayAppointments: any[] = [];
    const pastAppointments: any[] = [];

    appointments.forEach((apt) => {
      const aptDate = new Date(apt.date);
      aptDate.setHours(0, 0, 0, 0);

      if (aptDate.getTime() === today.getTime()) {
        todayAppointments.push(apt);
      } else if (aptDate.getTime() > today.getTime()) {
        futureAppointments.push(apt);
      } else {
        pastAppointments.push(apt);
      }
    });

    // Sort future by date ASC (nearest first), then by time ASC
    futureAppointments.sort((a, b) => {
      const dateCompare =
        new Date(a.date).getTime() - new Date(b.date).getTime();
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });

    // Sort today by time ASC
    todayAppointments.sort((a, b) => a.time.localeCompare(b.time));

    // Sort past by date DESC (most recent first), then by time DESC
    pastAppointments.sort((a, b) => {
      const dateCompare =
        new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateCompare !== 0) return dateCompare;
      return b.time.localeCompare(a.time);
    });

    return { futureAppointments, todayAppointments, pastAppointments };
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

  // Helper: Render single appointment card
  const renderAppointmentCard = (appointment: any, index: number) => {
    return (
      <motion.div
        key={appointment.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
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
              {appointment.type === "online" ? "Trực tuyến" : "Trực tiếp"}
            </span>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}
          >
            {getStatusText(appointment.status)}
          </span>
        </div>

        <div className="space-y-3 mb-4">
          <h3 className="font-semibold text-[#0F172A]">
            {appointment.patient}
          </h3>
          <p className="text-sm text-[#334155]">{appointment.service}</p>
          <div className="flex items-center gap-2 text-sm text-[#334155]">
            <Clock size={16} />
            <span>
              {appointment.time} -{" "}
              {new Date(appointment.date).toLocaleDateString("vi-VN")}
            </span>
          </div>
          {appointment.hasAIPrediction && (
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-gradient-to-r from-[#1E75FF] to-[#10B981] text-white rounded-full text-xs font-medium flex items-center gap-1">
                <Brain size={12} />
                <span>Có kết quả dự đoán AI</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons based on tab and status */}
        {appointmentTab === "confirmed" &&
          appointment.status === "confirmed" && (
            <button
              onClick={() =>
                openPatientExamination(appointment.patientId, appointment)
              }
              className="w-full bg-[#10B981] hover:bg-[#059669] text-white py-2 px-3 rounded-xl text-sm font-medium flex items-center justify-center gap-1 transition-colors"
            >
              <Stethoscope size={16} />
              <span>Bắt đầu khám</span>
            </button>
          )}

        {appointmentTab === "pending" && appointment.status === "pending" && (
          <div className="flex gap-2">
            <button
              onClick={() => handleConfirmAppointment(appointment)}
              disabled={updateStatusLoading}
              className="flex-1 bg-[#10B981] hover:bg-[#059669] text-white py-2 px-3 rounded-xl text-sm font-medium flex items-center justify-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check size={16} />
              <span>Chấp nhận</span>
            </button>
            <button
              onClick={() => handleOpenRejectModal(appointment)}
              disabled={updateStatusLoading}
              className="flex-1 bg-[#EF4444] hover:bg-[#DC2626] text-white py-2 px-3 rounded-xl text-sm font-medium flex items-center justify-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X size={16} />
              <span>Từ chối</span>
            </button>
          </div>
        )}

        {appointmentTab === "completed" &&
          appointment.status === "completed" && (
            <button
              onClick={() => handleViewResult(appointment)}
              className="w-full bg-[#1E75FF] hover:bg-[#1659C9] text-white py-2 px-3 rounded-xl text-sm font-medium flex items-center justify-center gap-1 transition-colors"
            >
              <Eye size={16} />
              <span>Xem kết quả</span>
            </button>
          )}
      </motion.div>
    );
  };
  const renderExaminationModal = () => {
    if (!selectedPatient) return null;
    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
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
          className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl"
        >
          {/* Modal Header */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#1E75FF] rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#0F172A]">
                  {selectedPatient.name}
                </h3>
              </div>
            </div>
            <button
              onClick={() => setShowExaminationModal(false)}
              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
            >
              <X size={16} className="text-[#334155]" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 px-6">
            <div className="flex">
              {[
                {
                  id: "examination",
                  label: "Khám bệnh",
                  icon: Stethoscope,
                },
                {
                  id: "prescription",
                  label: "Kê đơn thuốc",
                  icon: Pill,
                },
                {
                  id: "history",
                  label: "Lịch sử khám",
                  icon: History,
                },
                {
                  id: "ai-result",
                  label: "Dự đoán AI",
                  icon: Brain,
                },
              ].map((tab) => {
                const Icon = tab.icon;

                // Tính số prescriptions hợp lệ cho badge
                let badge = null;
                if (tab.id === "prescription") {
                  const validCount = prescriptionRows.filter(
                    (row) =>
                      row.drug &&
                      row.drug.trim() !== "" &&
                      row.dosage &&
                      row.dosage.trim() !== "" &&
                      row.usage &&
                      row.usage.trim() !== ""
                  ).length;
                  const totalCount = prescriptionRows.filter(
                    (row) => row.drug || row.dosage || row.usage
                  ).length;

                  if (totalCount > 0) {
                    const isComplete = validCount === totalCount;
                    badge = (
                      <span
                        className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                          isComplete
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {validCount}/{totalCount}
                      </span>
                    );
                  }
                }

                return (
                  <button
                    key={tab.id}
                    onClick={() => setExaminationTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 ${
                      examinationTab === tab.id
                        ? "text-[#1E75FF] border-[#1E75FF]"
                        : "text-[#334155] border-transparent hover:text-[#1E75FF]"
                    }`}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                    {badge}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={examinationTab}
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
                {/* AI Results Tab */}
                {examinationTab === "ai-result" && (
                  <div className="space-y-6">
                    {/* Loading State */}
                    {predictLoading && (
                      <div className="text-center py-12">
                        <div className="w-8 h-8 border-4 border-[#1E75FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-[#334155]">
                          Đang tải dữ liệu dự đoán AI...
                        </p>
                      </div>
                    )}

                    {/* Error State */}
                    {predictError && !predictLoading && (
                      <div className="text-center py-12">
                        <AlertTriangle
                          size={48}
                          className="text-red-500 mx-auto mb-4"
                        />
                        <p className="text-red-600 mb-4">{predictError}</p>
                        <button
                          onClick={() =>
                            selectedPatient?.id &&
                            fetchPredict(selectedPatient.id)
                          }
                          className="px-4 py-2 bg-[#1E75FF] text-white rounded-xl hover:bg-[#1659C9] transition-colors"
                        >
                          Thử lại
                        </button>
                      </div>
                    )}

                    {/* Data State */}
                    {!predictLoading && !predictError && predictData ? (
                      <>
                        {/* Main Prediction Card */}
                        <div
                          className={`rounded-2xl p-6 text-white shadow-lg ${
                            predictData.stage <= 1
                              ? "bg-gradient-to-br from-green-500 to-green-600"
                              : predictData.stage === 2
                                ? "bg-gradient-to-br from-yellow-500 to-yellow-600"
                                : predictData.stage === 3
                                  ? "bg-gradient-to-br from-orange-500 to-orange-600"
                                  : "bg-gradient-to-br from-red-500 to-red-600"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-white/90 mb-2">
                                🏥 TÌNH TRẠNG THẬN CỦA BỆNH NHÂN
                              </p>
                              <div className="flex items-baseline space-x-4">
                                <div className="flex items-center space-x-3">
                                  <span className="text-5xl">
                                    {predictData.stage <= 1
                                      ? "🟢"
                                      : predictData.stage === 2
                                        ? "🟡"
                                        : predictData.stage === 3
                                          ? "🟠"
                                          : "🔴"}
                                  </span>
                                  <div>
                                    <div className="flex items-baseline space-x-2">
                                      <span className="text-6xl font-bold tracking-tight">
                                        {predictData.stage}
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
                                {predictData.stage === 1 &&
                                  "Giai đoạn 1: Tổn thương thận với GFR bình thường (≥90)"}
                                {predictData.stage === 2 &&
                                  "Giai đoạn 2: Suy giảm nhẹ chức năng thận (60-89)"}
                                {predictData.stage === 3 &&
                                  "Giai đoạn 3: Suy giảm trung bình chức năng thận (30-59)"}
                                {predictData.stage === 4 &&
                                  "Giai đoạn 4: Suy giảm nặng chức năng thận (15-29)"}
                                {predictData.stage === 5 &&
                                  "Giai đoạn 5: Suy thận giai đoạn cuối (<15)"}
                              </p>
                              <p className="mt-2 text-sm text-white/80">
                                {predictData.stage <= 1
                                  ? "Thận hoạt động tốt (≥90%)"
                                  : predictData.stage === 2
                                    ? "Thận hoạt động ở mức 60-89%"
                                    : predictData.stage === 3
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
                                  Math.floor(
                                    (predictData.confidence || 0) * 10000
                                  ) / 100
                                ).toFixed(2)}
                                % ✅
                              </span>
                            </div>
                            <div className="w-full bg-white/20 rounded-full h-2.5">
                              <div
                                className="h-2.5 rounded-full bg-white transition-all duration-500"
                                style={{
                                  width: `${(predictData.confidence || 0) * 100}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        {/* Recommendations Section */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-6">
                          <h4 className="text-lg font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
                            <Brain className="w-5 h-5 text-[#1E75FF]" />
                            <span>Khuyến nghị từ AI</span>
                          </h4>
                          <div className="space-y-3">
                            {predictData.recommendations &&
                            predictData.recommendations.length > 0 ? (
                              predictData.recommendations.map((rec, index) => (
                                <div
                                  key={index}
                                  className="flex items-start gap-3 p-3 bg-[#1E75FF]/5 rounded-xl"
                                >
                                  <div className="w-2 h-2 bg-[#1E75FF] rounded-full mt-2 flex-shrink-0"></div>
                                  <p className="text-sm text-[#334155]">
                                    {rec}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-[#64748B] text-center py-4">
                                Không có khuyến nghị
                              </p>
                            )}
                          </div>
                        </div>
                      </>
                    ) : !predictLoading && !predictError && !predictData ? (
                      <div className="text-center py-12">
                        <Brain
                          size={48}
                          className="text-gray-400 mx-auto mb-4"
                        />
                        <p className="text-[#334155]">
                          Không có dữ liệu dự đoán AI cho bệnh nhân này
                        </p>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Medical History Tab */}
                {examinationTab === "history" && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-[#0F172A] flex items-center gap-2">
                      <History className="w-5 h-5 text-[#1E75FF]" />
                      <span>Lịch sử khám bệnh</span>
                    </h4>

                    {/* Loading State */}
                    {medicalRecordsLoading && (
                      <div className="text-center py-12">
                        <div className="w-8 h-8 border-4 border-[#1E75FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-[#334155]">
                          Đang tải lịch sử khám...
                        </p>
                      </div>
                    )}

                    {/* Error State */}
                    {medicalRecordsError && !medicalRecordsLoading && (
                      <div className="text-center py-12">
                        <AlertTriangle
                          size={48}
                          className="text-red-500 mx-auto mb-4"
                        />
                        <p className="text-red-600 mb-4">
                          {medicalRecordsError}
                        </p>
                        <button
                          onClick={() => refetchMedicalRecords()}
                          className="px-4 py-2 bg-[#1E75FF] text-white rounded-xl hover:bg-[#1659C9] transition-colors"
                        >
                          Thử lại
                        </button>
                      </div>
                    )}

                    {/* Records List */}
                    {!medicalRecordsLoading && !medicalRecordsError && (
                      <div className="space-y-4">
                        {patientMedicalRecords &&
                        patientMedicalRecords.length > 0 ? (
                          patientMedicalRecords.map(
                            (
                              record: MedicalRecordWithPrescriptions,
                              index: number
                            ) => (
                              <div
                                key={record.recordId}
                                className="bg-white border border-gray-200 rounded-2xl p-6"
                              >
                                <div className="flex items-start justify-between mb-4">
                                  <div>
                                    <h5 className="font-semibold text-[#0F172A]">
                                      Cuộc khám ngày{" "}
                                      {formatDate(
                                        record.appointmentDate ||
                                          record.createdAt
                                      )}
                                    </h5>
                                    <p className="text-sm text-[#334155]">
                                      BS. {record.doctorName} -{" "}
                                      {record.serviceName}
                                    </p>
                                  </div>
                                </div>
                                <div className="space-y-3">
                                  <div>
                                    <p className="text-sm font-medium text-[#334155]">
                                      Chẩn đoán:
                                    </p>
                                    <p className="text-[#0F172A]">
                                      {record.diagnosis}
                                    </p>
                                  </div>
                                  {record.symptoms && (
                                    <div>
                                      <p className="text-sm font-medium text-[#334155]">
                                        Triệu chứng:
                                      </p>
                                      <p className="text-[#0F172A]">
                                        {record.symptoms}
                                      </p>
                                    </div>
                                  )}
                                  {record.treatment && (
                                    <div>
                                      <p className="text-sm font-medium text-[#334155]">
                                        Điều trị:
                                      </p>
                                      <p className="text-[#0F172A]">
                                        {record.treatment}
                                      </p>
                                    </div>
                                  )}
                                  {record.doctorNote && (
                                    <div>
                                      <p className="text-sm font-medium text-[#334155]">
                                        Ghi chú của bác sĩ:
                                      </p>
                                      <p className="text-[#0F172A]">
                                        {record.doctorNote}
                                      </p>
                                    </div>
                                  )}
                                  {record.followUpDate && (
                                    <div className="flex items-center gap-2 text-orange-600">
                                      <CalendarDays size={16} />
                                      <span className="text-sm font-medium">
                                        Tái khám:{" "}
                                        {formatDate(record.followUpDate)}
                                      </span>
                                    </div>
                                  )}
                                  {/* Prescriptions */}
                                  {record.prescriptions &&
                                    record.prescriptions.length > 0 && (
                                      <div className="mt-4 pt-4 border-t border-gray-200">
                                        <div className="flex items-center gap-2 mb-3">
                                          <Pill className="w-4 h-4 text-[#1E75FF]" />
                                          <p className="text-sm font-medium text-[#334155]">
                                            Đơn thuốc (
                                            {record.prescriptions.length} loại)
                                          </p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                          {record.prescriptions
                                            .slice(0, 4)
                                            .map((prescription) => {
                                              const frequencies =
                                                parseFrequency(
                                                  prescription.frequency
                                                );
                                              return (
                                                <div
                                                  key={
                                                    prescription.prescriptionId
                                                  }
                                                  className="bg-blue-50 p-3 rounded-xl border border-blue-200"
                                                >
                                                  <p className="font-medium text-[#0F172A] text-sm mb-1">
                                                    {prescription.medicalName}
                                                  </p>
                                                  <p className="text-xs text-[#334155] mb-2">
                                                    Liều: {prescription.dosage}
                                                  </p>
                                                  <div className="flex flex-wrap gap-1">
                                                    {frequencies.map(
                                                      (freq, idx) => (
                                                        <span
                                                          key={idx}
                                                          className="px-2 py-0.5 bg-white rounded-full text-xs text-[#334155]"
                                                        >
                                                          {frequencyMap[freq] ||
                                                            freq}
                                                        </span>
                                                      )
                                                    )}
                                                  </div>
                                                </div>
                                              );
                                            })}
                                        </div>
                                        {record.prescriptions.length > 4 && (
                                          <p className="text-sm text-[#1E75FF] mt-2">
                                            +{record.prescriptions.length - 4}{" "}
                                            thuốc khác
                                          </p>
                                        )}
                                      </div>
                                    )}
                                </div>
                              </div>
                            )
                          )
                        ) : (
                          <div className="text-center py-12">
                            <History
                              size={48}
                              className="text-gray-400 mx-auto mb-4"
                            />
                            <p className="text-[#334155]">
                              Chưa có lịch sử khám
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Examination Tab */}
                {examinationTab === "examination" && (
                  <div className="space-y-6">
                    {/* Patient Information - READ ONLY */}
                    <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-6">
                      <h4 className="text-lg font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[#1E75FF]" />
                        <span>Thông tin từ bệnh nhân</span>
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-[#334155] mb-1">
                            Ghi chú thêm từ bệnh nhân:
                          </p>
                          <p className="text-[#0F172A] px-4 py-2 bg-white rounded-lg border border-gray-200">
                            {selectedPatient?.appointment?.note ||
                              "Không có thông tin"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#334155] mb-1">
                            Triệu chứng:
                          </p>
                          <p className="text-[#0F172A] px-4 py-2 bg-white rounded-lg border border-gray-200">
                            {selectedPatient?.appointment?.symptoms ||
                              "Bệnh nhân chưa cung cấp"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Service Type */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                      <h4 className="text-lg font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-[#1E75FF]" />
                        <span>Dịch vụ khám</span>
                      </h4>
                      <div>
                        <label className="block text-sm font-medium text-[#334155] mb-2">
                          Dịch vụ khám
                        </label>
                        <select
                          value={serviceName}
                          onChange={(e) => setServiceName(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent"
                        >
                          <option value="Thận - Tiết niệu">
                            Thận - Tiết niệu
                          </option>
                          <option value="other">Khác</option>
                        </select>
                      </div>
                      {serviceName === "other" && (
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-[#334155] mb-2">
                            Nhập dịch vụ khám
                          </label>
                          <input
                            type="text"
                            placeholder="Nhập tên dịch vụ khám cụ thể..."
                            value={customServiceName}
                            onChange={(e) =>
                              setCustomServiceName(e.target.value)
                            }
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent"
                          />
                        </div>
                      )}
                    </div>

                    {/* Clinical Examination Results */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                      <h4 className="text-lg font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
                        <Stethoscope className="w-5 h-5 text-[#1E75FF]" />
                        <span>Kết quả khám lâm sàng</span>
                      </h4>
                      <textarea
                        placeholder="Ghi chú kết quả khám lâm sàng, các dấu hiệu lâm sàng, kết quả thăm khám..."
                        rows={4}
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent resize-none"
                      />
                    </div>

                    {/* Diagnosis */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                      <h4 className="text-lg font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-[#1E75FF]" />
                        <span>Chẩn đoán</span>
                      </h4>
                      <div>
                        <label className="block text-sm font-medium text-[#334155] mb-2">
                          Chẩn đoán chính
                        </label>
                        <textarea
                          placeholder="Nhập chẩn đoán..."
                          rows={4}
                          value={diagnosis}
                          onChange={(e) => setDiagnosis(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent resize-none"
                        />
                      </div>
                    </div>

                    {/* Treatment Plan */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                      <h4 className="text-lg font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-[#1E75FF]" />
                        <span>Kế hoạch điều trị</span>
                      </h4>
                      <textarea
                        placeholder="Nhập kế hoạch điều trị chi tiết..."
                        rows={4}
                        value={treatment}
                        onChange={(e) => setTreatment(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent resize-none"
                      />
                    </div>

                    {/* Stage and Health Status */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                      <h4 className="text-lg font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-[#1E75FF]" />
                        <span>Tình trạng bệnh</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[#334155] mb-2">
                            Giai đoạn bệnh
                          </label>
                          <select
                            value={stage}
                            onChange={(e) => setStage(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent"
                          >
                            <option value="">Chọn giai đoạn</option>
                            <option value="0">Giai đoạn 0</option>
                            <option value="1">Giai đoạn 1</option>
                            <option value="2">Giai đoạn 2</option>
                            <option value="3">Giai đoạn 3</option>
                            <option value="4">Giai đoạn 4</option>
                            <option value="5">Giai đoạn 5</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#334155] mb-2">
                            Tình trạng sức khỏe
                          </label>
                          <select
                            value={statusHealth}
                            onChange={(e) => setStatusHealth(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent"
                          >
                            <option value="">Chọn tình trạng</option>
                            <option value="STABLE">Ổn định</option>
                            <option value="IMPROVING">Cải thiện</option>
                            <option value="DECREASING">Suy giảm</option>
                            <option value="INCREASING">Xấu đi</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Prescription Tab */}
                {examinationTab === "prescription" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-end">
                      <button
                        onClick={addPrescriptionRow}
                        className="bg-[#10B981] hover:bg-[#059669] text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors"
                      >
                        <Plus size={16} />
                        <span>Thêm thuốc</span>
                      </button>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-medium text-[#334155] min-w-[200px]">
                                Tên thuốc{" "}
                                <span className="text-red-500">*</span>
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-[#334155] min-w-[120px]">
                                Liều lượng{" "}
                                <span className="text-red-500">*</span>
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-[#334155] min-w-[150px]">
                                Cách dùng{" "}
                                <span className="text-red-500">*</span>
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-[#334155] min-w-[140px]">
                                Ngày bắt đầu
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-[#334155] min-w-[140px]">
                                Ngày kết thúc
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-[#334155] min-w-[150px]">
                                Ghi chú
                              </th>
                              <th className="px-4 py-3 text-center text-sm font-medium text-[#334155] whitespace-nowrap min-w-[80px]">
                                Thao tác
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {prescriptionRows.map((row, index) => {
                              // Kiểm tra xem row có ít nhất 1 field được điền không
                              const hasAnyData =
                                row.drug || row.dosage || row.usage;
                              // Nếu có data, kiểm tra required fields
                              const missingDrug =
                                hasAnyData &&
                                (!row.drug || row.drug.trim() === "");
                              const missingDosage =
                                hasAnyData &&
                                (!row.dosage || row.dosage.trim() === "");
                              const missingUsage =
                                hasAnyData &&
                                (!row.usage || row.usage.trim() === "");

                              return (
                                <tr
                                  key={index}
                                  className="border-t border-gray-100"
                                >
                                  <td className="px-4 py-3">
                                    <input
                                      type="text"
                                      placeholder="Nhập tên thuốc..."
                                      value={row.drug}
                                      onChange={(e) =>
                                        updatePrescriptionRow(
                                          index,
                                          "drug",
                                          e.target.value
                                        )
                                      }
                                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent text-sm ${
                                        missingDrug
                                          ? "border-red-300 bg-red-50"
                                          : "border-gray-200"
                                      }`}
                                    />
                                  </td>
                                  <td className="px-4 py-3">
                                    <input
                                      type="text"
                                      // placeholder="Nhập ..."
                                      value={row.dosage}
                                      onChange={(e) =>
                                        updatePrescriptionRow(
                                          index,
                                          "dosage",
                                          e.target.value
                                        )
                                      }
                                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent text-sm ${
                                        missingDosage
                                          ? "border-red-300 bg-red-50"
                                          : "border-gray-200"
                                      }`}
                                    />
                                  </td>
                                  <td className="px-4 py-3">
                                    <select
                                      value={row.usage}
                                      onChange={(e) =>
                                        updatePrescriptionRow(
                                          index,
                                          "usage",
                                          e.target.value
                                        )
                                      }
                                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent text-sm ${
                                        missingUsage
                                          ? "border-red-300 bg-red-50"
                                          : "border-gray-200"
                                      }`}
                                    >
                                      <option value="">Chọn cách dùng</option>
                                      <option value="MORNING">Sáng</option>
                                      <option value="AFTERNOON">Chiều</option>
                                      <option value="EVENING">Tối</option>
                                      <option value="MORNING,AFTERNOON">
                                        Sáng & Chiều
                                      </option>
                                      <option value="MORNING,EVENING">
                                        Sáng & Tối
                                      </option>
                                      <option value="AFTERNOON,EVENING">
                                        Chiều & Tối
                                      </option>
                                      <option value="MORNING,AFTERNOON,EVENING">
                                        Sáng, Chiều & Tối
                                      </option>
                                    </select>
                                  </td>
                                  <td className="px-4 py-3">
                                    <input
                                      type="date"
                                      value={row.startDate}
                                      onChange={(e) =>
                                        updatePrescriptionRow(
                                          index,
                                          "startDate",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent text-sm"
                                    />
                                  </td>
                                  <td className="px-4 py-3">
                                    <input
                                      type="date"
                                      value={row.endDate}
                                      onChange={(e) =>
                                        updatePrescriptionRow(
                                          index,
                                          "endDate",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent text-sm"
                                    />
                                  </td>
                                  <td className="px-4 py-3">
                                    <input
                                      type="text"
                                      // placeholder="Uống sau ăn"
                                      value={row.notes}
                                      onChange={(e) =>
                                        updatePrescriptionRow(
                                          index,
                                          "notes",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent text-sm"
                                    />
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <button
                                      onClick={() =>
                                        removePrescriptionRow(index)
                                      }
                                      className="text-[#EF4444] hover:bg-[#EF4444]/10 p-1 rounded transition-colors"
                                    >
                                      <X size={16} />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Prescription Notes */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                      <h5 className="font-semibold text-[#0F172A] mb-3">
                        Hướng dẫn sử dụng
                      </h5>
                      <textarea
                        rows={6}
                        value={prescriptionNotes}
                        onChange={(e) => setPrescriptionNotes(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent resize-none"
                      />
                    </div>

                    {/* Follow-up */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <input
                          type="checkbox"
                          id="enableFollowUp"
                          checked={enableFollowUp}
                          onChange={(e) => {
                            setEnableFollowUp(e.target.checked);
                            if (!e.target.checked) {
                              // Reset các field khi uncheck
                              setFollowUpDate("");
                              setFollowUpTimeSlot(null);
                              setFollowUpTimeSlots([]);
                              setFollowUpNote("");
                            }
                          }}
                          className="w-5 h-5 text-[#1E75FF] border-gray-300 rounded focus:ring-2 focus:ring-[#1E75FF] cursor-pointer"
                        />
                        <label
                          htmlFor="enableFollowUp"
                          className="font-semibold text-[#0F172A] cursor-pointer"
                        >
                          Đặt lịch tái khám
                        </label>
                      </div>
                      {enableFollowUp && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-[#334155] mb-2">
                                Ngày tái khám
                              </label>
                              <input
                                type="date"
                                value={followUpDate}
                                onChange={(e) => {
                                  setFollowUpDate(e.target.value);
                                  setFollowUpTimeSlot(null);
                                }}
                                min={
                                  new Date(Date.now() + 86400000)
                                    .toISOString()
                                    .split("T")[0]
                                }
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-[#334155] mb-2">
                                Loại khám
                              </label>
                              <select
                                value={followUpType}
                                onChange={(e) =>
                                  setFollowUpType(e.target.value)
                                }
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent"
                              >
                                <option value="Tái khám">Tái khám</option>
                                <option value="Xét nghiệm">Xét nghiệm</option>
                                <option value="Khám trực tiếp">
                                  Khám trực tiếp
                                </option>
                                <option value="Tư vấn online">
                                  Tư vấn online
                                </option>
                              </select>
                            </div>
                          </div>

                          {/* Time Slots - Hiển thị khi có ngày */}
                          {followUpDate && (
                            <div className="mt-4">
                              <label className="block text-sm font-medium text-[#334155] mb-2">
                                Chọn giờ <span className="text-red-500">*</span>
                              </label>

                              {loadingFollowUpSlots ? (
                                <div className="text-sm text-gray-500 py-4 text-center">
                                  Đang tải lịch làm việc...
                                </div>
                              ) : followUpTimeSlots &&
                                followUpTimeSlots.length > 0 ? (
                                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                                  {followUpTimeSlots.map((slot) => (
                                    <button
                                      key={slot.slotId}
                                      type="button"
                                      onClick={() =>
                                        setFollowUpTimeSlot(slot.slotId)
                                      }
                                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                        followUpTimeSlot === slot.slotId
                                          ? "bg-[#1E75FF] text-white shadow-md"
                                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                      }`}
                                    >
                                      {slot.startTime.substring(0, 5)}
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-sm text-gray-600 py-4 px-4 bg-gray-50 rounded-lg border border-gray-200">
                                  <p className="font-medium">
                                    ⚠️ Không có lịch làm việc trong ngày này.
                                  </p>
                                  <p className="mt-1 text-xs">
                                    Bạn có thể đăng ký lịch làm việc cho ngày
                                    này để đặt lịch tái khám.
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setOpenScheduleModalForFollowUp(true)
                                    }
                                    className="mt-3 inline-flex items-center px-3 py-2 rounded-lg bg-[#1E75FF] text-white hover:bg-[#175dcc]"
                                  >
                                    Đăng ký lịch làm việc cho ngày này
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Confirm message khi đã chọn đủ */}
                          {followUpDate && followUpTimeSlot && (
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                              <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-blue-700">
                                Lịch tái khám sẽ được đặt tự động với trạng thái{" "}
                                <strong>Đã xác nhận</strong>
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Doctor Signature */}
                    <SignaturePad
                      onSignatureSaved={(signatureValue) =>
                        setSignature(signatureValue)
                      }
                      disabled={medicalRecordLoading || prescriptionsLoading}
                    />
                  </div>
                )}
                {/* Schedule Registration Modal for Follow-up convenience */}
                {openScheduleModalForFollowUp && (
                  <DoctorScheduleRegistrationModal
                    isOpen={openScheduleModalForFollowUp}
                    onClose={() => setOpenScheduleModalForFollowUp(false)}
                    onSave={async () => {
                      // Sau khi đăng ký xong -> refetch lịch cho followUpDate
                      if (followUpDate && me?.userId) {
                        await fetchDoctorSchedule(me.userId, followUpDate);
                      }
                      setOpenScheduleModalForFollowUp(false);
                    }}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Modal Footer */}
          <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              onClick={() => setShowExaminationModal(false)}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-[#334155] rounded-xl font-medium transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleCompleteExamination}
              disabled={medicalRecordLoading || prescriptionsLoading}
              className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors ${
                medicalRecordLoading || prescriptionsLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#10B981] hover:bg-[#059669]"
              } text-white`}
            >
              {medicalRecordLoading || prescriptionsLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <UserCheck size={16} />
                  <span>Hoàn thành khám</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    );
  };
  const renderAppointments = () => {
    // Filter appointments by tab
    const currentAppointments = normalizedAppointments.filter((appointment) => {
      if (appointmentTab === "pending") {
        return appointment.status === "pending";
      } else if (appointmentTab === "confirmed") {
        return appointment.status === "confirmed";
      } else if (appointmentTab === "completed") {
        return appointment.status === "completed";
      }
      return false;
    });

    // Apply search and filter
    const filteredAppointments = filterAppointments(currentAppointments);

    // Categorize appointments by time (same for all tabs)
    let categorizedData = categorizeAppointmentsByTime(filteredAppointments);

    // For pending tab, sort from oldest to newest by appointment date and time
    if (appointmentTab === "pending") {
      // Sort all appointments from oldest to newest (date ASC, time ASC)
      // Combine all categories and sort as a single list
      const allPendingAppointments = [
        ...categorizedData.pastAppointments,
        ...categorizedData.todayAppointments,
        ...categorizedData.futureAppointments,
      ];

      allPendingAppointments.sort((a, b) => {
        const dateCompare =
          new Date(a.date).getTime() - new Date(b.date).getTime();
        if (dateCompare !== 0) return dateCompare;
        return a.time.localeCompare(b.time);
      });

      // Update categorizedData with sorted appointments
      categorizedData = {
        pastAppointments: [],
        todayAppointments: [],
        futureAppointments: allPendingAppointments,
      };
    }
    return (
      <div className="p-6 space-y-6">
        <div
          className="flex items-center justify-between"
          style={{
            display: "none",
          }}
        >
          <h1 className="text-3xl font-bold text-[#0F172A]">
            Quản lý lịch hẹn
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_10px_24px_rgba(16,24,40,0.08)] overflow-hidden">
          <div className="border-b border-gray-100">
            <div className="flex">
              {(() => {
                // Calculate counts for each tab
                const pendingCount = normalizedAppointments.filter(
                  (apt) => apt.status === "pending"
                ).length;
                const confirmedCount = normalizedAppointments.filter(
                  (apt) => apt.status === "confirmed"
                ).length;
                const completedCount = normalizedAppointments.filter(
                  (apt) => apt.status === "completed"
                ).length;

                return [
                  {
                    id: "pending",
                    label: "Chờ Xác Nhận",
                    count: pendingCount,
                    badgeColor:
                      pendingCount > 0 ? "bg-orange-500" : "bg-gray-400",
                  },
                  {
                    id: "confirmed",
                    label: "Lịch Hẹn",
                    count: confirmedCount,
                    badgeColor: "bg-blue-500",
                  },
                  {
                    id: "completed",
                    label: "Đã Hoàn Thành",
                    count: completedCount,
                    badgeColor: "bg-gray-500",
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setAppointmentTab(tab.id)}
                    className={`px-6 py-4 font-medium transition-colors relative ${appointmentTab === tab.id ? "text-[#1E75FF] border-b-2 border-[#1E75FF]" : "text-[#334155] hover:text-[#1E75FF]"}`}
                  >
                    <span className="flex items-center gap-2">
                      {tab.label}
                      {tab.count > 0 && (
                        <span
                          className={`${tab.badgeColor} text-white px-2 py-0.5 rounded-full text-xs font-medium`}
                        >
                          {tab.count}
                        </span>
                      )}
                    </span>
                  </button>
                ));
              })()}
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
            {(doctorAptLoading ||
              (appointmentTab === "completed" && completedLoading)) && (
              <div className="text-center py-8 text-[#334155]">
                Đang tải lịch hẹn...
              </div>
            )}
            {(doctorAptError ||
              (appointmentTab === "completed" && completedError)) && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-700">
                    {doctorAptError || completedError}
                  </span>
                </div>
                <button
                  onClick={
                    appointmentTab === "completed"
                      ? clearCompletedError
                      : clearDoctorAptError
                  }
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Thử lại
                </button>
              </div>
            )}
            {/* Render categorized content based on tab */}
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-[#334155] mb-4">
                  {appointmentTab === "pending" &&
                    "Không có lịch hẹn nào chờ xác nhận"}
                  {appointmentTab === "confirmed" && "Không có lịch hẹn nào"}
                  {appointmentTab === "completed" &&
                    "Chưa có lịch hẹn nào hoàn thành"}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {appointmentTab === "pending" ? (
                  /* For pending tab: single list sorted from oldest to newest */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categorizedData.futureAppointments.map(
                      (apt: any, idx: number) => renderAppointmentCard(apt, idx)
                    )}
                  </div>
                ) : (
                  /* For other tabs: categorized structure */
                  <>
                    {/* 1. Lịch hẹn sắp tới */}
                    {categorizedData.futureAppointments.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                          <span className="w-1 h-4 bg-blue-500 rounded"></span>
                          LỊCH HẸN SẮP TỚI (
                          {categorizedData.futureAppointments.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {categorizedData.futureAppointments.map(
                            (apt: any, idx: number) =>
                              renderAppointmentCard(apt, idx)
                          )}
                        </div>
                      </div>
                    )}

                    {/* 2. Cuộc hẹn hôm nay */}
                    {categorizedData.todayAppointments.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                          <span className="w-1 h-4 bg-orange-500 rounded"></span>
                          CUỘC HẸN HÔM NAY (
                          {categorizedData.todayAppointments.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {categorizedData.todayAppointments.map(
                            (apt: any, idx: number) =>
                              renderAppointmentCard(apt, idx)
                          )}
                        </div>
                      </div>
                    )}

                    {/* 3. Lịch sử khám bệnh */}
                    {categorizedData.pastAppointments.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                          <span className="w-1 h-4 bg-gray-400 rounded"></span>
                          LỊCH SỬ KHÁM BỆNH (
                          {categorizedData.pastAppointments.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {categorizedData.pastAppointments.map(
                            (apt: any, idx: number) =>
                              renderAppointmentCard(apt, idx)
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
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
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isMuted ? "bg-[#EF4444] hover:bg-[#DC2626]" : "bg-white/20 hover:bg-white/30"}`}
                >
                  {isMuted ? (
                    <MicOff size={20} className="text-white" />
                  ) : (
                    <Mic size={20} className="text-white" />
                  )}
                </button>
                <button
                  onClick={() => setIsVideoOn(!isVideoOn)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${!isVideoOn ? "bg-[#EF4444] hover:bg-[#DC2626]" : "bg-white/20 hover:bg-white/30"}`}
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
                      className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${consultationTab === tab.id ? "text-[#1E75FF] border-b-2 border-[#1E75FF]" : "text-[#334155] hover:text-[#1E75FF]"}`}
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
                            className={`flex ${message.sender === "doctor" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[80%] p-3 rounded-2xl ${message.sender === "doctor" ? "bg-[#1E75FF] text-white" : "bg-gray-100 text-[#0F172A]"}`}
                            >
                              <p className="text-sm">{message.message}</p>
                              <p
                                className={`text-xs mt-1 ${message.sender === "doctor" ? "text-white/70" : "text-[#334155]"}`}
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
    // Week days configuration (Monday to Sunday)
    const weekDays = [
      {
        key: "mon",
        label: "T2",
        fullName: "Thứ Hai",
      },
      {
        key: "tue",
        label: "T3",
        fullName: "Thứ Ba",
      },
      {
        key: "wed",
        label: "T4",
        fullName: "Thứ Tư",
      },
      {
        key: "thu",
        label: "T5",
        fullName: "Thứ Năm",
      },
      {
        key: "fri",
        label: "T6",
        fullName: "Thứ Sáu",
      },
      {
        key: "sat",
        label: "T7",
        fullName: "Thứ Bảy",
      },
      {
        key: "sun",
        label: "CN",
        fullName: "Chủ Nhật",
      },
    ];

    // Dynamic time slots: combine default slots with actual appointment times
    const defaultTimeSlots = [
      "08:00",
      "08:30",
      "09:00",
      "09:30",
      "10:00",
      "10:30",
      "11:00",
      "11:30",
      "14:00",
      "14:30",
      "15:00",
      "15:30",
      "16:00",
      "16:30",
      "17:00",
      "17:30",
    ];

    // Extract unique time slots from actual appointments
    const appointmentTimeSlots =
      doctorWeekAppointments
        ?.map((apt) => apt.timeSlot?.startTime?.substring(0, 5))
        .filter((time): time is string => Boolean(time)) || [];

    // Combine and deduplicate
    const combinedSlots = [...defaultTimeSlots, ...appointmentTimeSlots];
    const uniqueSlots = combinedSlots.filter(
      (slot, index) => combinedSlots.indexOf(slot) === index
    );
    const allTimeSlots = uniqueSlots;

    // Sort time slots
    const timeSlots = allTimeSlots.sort((a, b) => {
      const timeA = a.split(":").map(Number);
      const timeB = b.split(":").map(Number);
      const minutesA = timeA[0] * 60 + timeA[1];
      const minutesB = timeB[0] * 60 + timeB[1];
      return minutesA - minutesB;
    });

    // Get current date for today indicator
    const today = new Date();
    const currentWeekStart = new Date(currentWeek);

    // Helper function to get current day key
    const getCurrentDayKey = () => {
      const dayIndex = today.getDay();
      return dayIndex === 0 ? "sun" : weekDays[dayIndex - 1]?.key || "mon";
    };

    // Helper function to get week dates
    const getWeekDates = () => {
      const startOfWeek = new Date(currentWeekStart);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      return weekDays.map((_, index) => {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + index);
        return date;
      });
    };

    // Navigation handlers
    const handlePreviousWeek = () => {
      const newWeek = new Date(currentWeek);
      newWeek.setDate(newWeek.getDate() - 7);
      setCurrentWeek(newWeek);
    };

    const handleNextWeek = () => {
      const newWeek = new Date(currentWeek);
      newWeek.setDate(newWeek.getDate() + 7);
      setCurrentWeek(newWeek);
    };

    // Utility function to normalize date format
    const normalizeDateForComparison = (inputDate: string | Date): string => {
      if (typeof inputDate === "string") {
        // Handle different formats: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD
        if (inputDate.includes("/")) {
          // DD/MM/YYYY format
          const [day, month, year] = inputDate.split("/");
          return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
        } else if (inputDate.includes("-")) {
          // Could be DD-MM-YYYY or YYYY-MM-DD
          const parts = inputDate.split("-");
          if (parts[0].length === 4) {
            // Already YYYY-MM-DD
            return inputDate;
          } else {
            // DD-MM-YYYY
            const [day, month, year] = parts;
            return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
          }
        }
        // If no separators, try to parse as is
        return inputDate;
      } else if (inputDate instanceof Date) {
        return inputDate.toISOString().split("T")[0];
      }
      return String(inputDate);
    };

    // Get appointment by date and time
    const getAppointmentForSlot = (date: Date, time: string) => {
      if (!doctorWeekAppointments) return null;

      const searchDateStr = normalizeDateForComparison(date); // YYYY-MM-DD

      // Removed debug logs

      const foundAppointment = doctorWeekAppointments.find((apt) => {
        // Normalize appointment date for comparison
        const aptDateNormalized = normalizeDateForComparison(apt.date);

        // Removed debug logs

        // Compare normalized dates
        if (aptDateNormalized !== searchDateStr) {
          return false;
        }

        if (!apt.timeSlot) {
          return false;
        }

        // Convert time slot to HH:mm format for comparison
        const slotStartTime = apt.timeSlot.startTime.substring(0, 5); // "08:00:00" -> "08:00"
        const isTimeMatch = slotStartTime === time;

        return isTimeMatch;
      });

      return foundAppointment;
    };

    // Get status color and styling for appointment
    const getStatusColor = (status: string) => {
      switch (status) {
        case "CONFIRMED":
          return "bg-[#1E75FF]/10 border-[#1E75FF]/20 text-[#1E75FF]";
        case "PENDING":
          return "bg-[#F59E0B]/10 border-[#F59E0B]/20 text-[#F59E0B]";
        case "COMPLETED":
          return "bg-[#10B981]/10 border-[#10B981]/20 text-[#10B981]";
        case "CANCELED":
          return "bg-[#EF4444]/10 border-[#EF4444]/20 text-[#EF4444]";
        case "REJECTED":
          return "bg-[#DC2626]/10 border-[#DC2626]/20 text-[#DC2626]";
        case "NO_SHOW":
          return "bg-[#9CA3AF]/10 border-[#9CA3AF]/20 text-[#9CA3AF]";
        case "RESCHEDULED":
          return "bg-[#8B5CF6]/10 border-[#8B5CF6]/20 text-[#8B5CF6]";
        default:
          return "bg-gray-100 border-gray-200 text-gray-600";
      }
    };

    // Get Vietnamese status label
    const getStatusLabel = (status: string) => {
      switch (status) {
        case "CONFIRMED":
          return "Đã xác nhận";
        case "PENDING":
          return "Chờ xác nhận";
        case "COMPLETED":
          return "Hoàn thành";
        case "CANCELED":
          return "Đã hủy";
        case "REJECTED":
          return "Từ chối";
        case "NO_SHOW":
          return "Không đến";
        case "RESCHEDULED":
          return "Dời lịch";
        default:
          return status;
      }
    };

    const currentDayKey = getCurrentDayKey();
    const weekDates = getWeekDates();

    // Removed debug logs
    return (
      <div className="p-6 space-y-6">
        {/* Remove duplicate title - header already shows "Lịch làm việc" */}

        <div className="bg-white rounded-2xl shadow-[0_10px_24px_rgba(16,24,40,0.08)]">
          {/* Clean header - only show "Lịch làm việc" */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePreviousWeek}
                    disabled={doctorAptLoading}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>

                  <span className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium min-w-[200px] text-center">
                    {formatWeekRange(currentWeek)}
                  </span>

                  <button
                    onClick={handleNextWeek}
                    disabled={doctorAptLoading}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* Loading indicator */}
                {doctorAptLoading && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Đang tải...</span>
                  </div>
                )}

                {/* Error indicator */}
                {doctorAptError && (
                  <div className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-lg">
                    Lỗi: {doctorAptError}
                  </div>
                )}
              </div>

              {/* Legend + Register button */}
              <div className="flex items-center gap-4">
                {/* Legend - hidden on very small screens */}
                <div className="hidden md:flex items-center gap-3 text-xs text-[#334155]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1E75FF]"></span>
                    <span>Đã xác nhận</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span>
                    <span>Hoàn thành</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="bg-[#1E75FF] hover:bg-[#1659C9] text-white px-6 py-3 rounded-2xl font-medium flex items-center gap-2 transition-colors"
                >
                  <Plus size={20} />
                  <span>Đăng ký lịch làm việc</span>
                </button>
              </div>
            </div>
          </div>

          {/* Content area */}
          <div className="p-6">
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Header with day names and dates */}
                <div className="grid grid-cols-8 gap-4 mb-4">
                  <div className="text-right pr-4">
                    <span className="text-sm text-gray-500">Thời gian</span>
                  </div>

                  {weekDays.map((day, index) => {
                    const isToday = day.key === currentDayKey;
                    const date = weekDates[index];
                    return (
                      <div key={day.key} className="text-center">
                        <div
                          className={`py-3 px-3 rounded-lg transition-all cursor-pointer
                          ${isToday ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-200" : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"}`}
                        >
                          <div className="text-sm font-medium">
                            {day.fullName}
                          </div>
                          <div className="text-xs mt-1 opacity-80">
                            {date.getDate().toString().padStart(2, "0")}/
                            {(date.getMonth() + 1).toString().padStart(2, "0")}/
                            {date.getFullYear()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Time slots grid */}
                {timeSlots.map((time) => (
                  <div key={time} className="grid grid-cols-8 gap-4 mb-2">
                    <div className="p-3 text-sm font-medium text-[#334155] text-right">
                      {time}
                    </div>
                    {weekDays.map((day, dayIndex) => {
                      const cellDate = weekDates[dayIndex];
                      const appointment = getAppointmentForSlot(cellDate, time);

                      return (
                        <div
                          key={`${time}-${day.key}`}
                          className="p-2 border border-gray-100 rounded-lg min-h-[60px] hover:bg-gray-50 transition-colors"
                        >
                          {appointment && (
                            <div
                              className={`${getStatusColor(appointment.status)} rounded-lg p-2 text-xs cursor-pointer hover:shadow-sm transition-all relative`}
                              onClick={() => {
                                // Handle appointment click - could open details modal
                              }}
                              title={`Bệnh nhân: ${appointment.patientName}\nTrạng thái: ${getStatusLabel(appointment.status)}\nGhi chú: ${appointment.note || "Không có"}\nNgày: ${appointment.date}\nGiờ: ${appointment.timeSlot?.startTime} - ${appointment.timeSlot?.endTime}`}
                            >
                              {/* Removed status indicator dot */}

                              <p className="font-medium truncate pr-3">
                                {appointment.patientName}
                              </p>
                              <p className="text-[#334155] text-[10px] truncate mt-1">
                                {appointment.note || "Khám tổng quát"}
                              </p>
                              <p className="text-[10px] opacity-70 mt-1 font-medium">
                                {getStatusLabel(appointment.status)}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Registration Modal */}
        <DoctorScheduleRegistrationModal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          onSave={handleSaveScheduleFromModal}
          existingSchedules={[]}
        />
      </div>
    );
  };

  // @return
  return (
    <div className="h-full bg-[#F6F7FB]">
      {activeView === "appointments" && renderAppointments()}
      {activeView === "consultation" && renderConsultation()}
      {activeView === "schedule" && renderSchedule()}

      {/* Examination Modal */}
      <AnimatePresence>
        {showExaminationModal && renderExaminationModal()}
      </AnimatePresence>

      {/* Medical Result Modal */}
      <MedicalResultModal
        isOpen={showResultModal}
        onClose={handleCloseResultModal}
        appointmentId={selectedAppointmentId}
        patientInfo={selectedPatientInfo ?? undefined}
        doctorInfo={selectedDoctorInfo ?? undefined}
      />

      {/* Reject Appointment Modal */}
      <AnimatePresence>
        {showRejectModal && selectedAppointmentForAction && (
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
                  Xác nhận từ chối lịch hẹn
                </h3>
                <p className="text-gray-600 mb-6">
                  Bạn có chắc chắn muốn từ chối lịch hẹn này không? Bệnh nhân sẽ
                  nhận được thông báo về việc từ chối lịch hẹn.
                </p>

                {/* Thông tin lịch hẹn */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Bệnh nhân:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedAppointmentForAction.patient ||
                        selectedAppointmentForAction.patientName ||
                        "Chưa có thông tin"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Dịch vụ:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedAppointmentForAction.service || "Khám trực tiếp"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Ngày:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedAppointmentForAction.date
                        ? new Date(
                            selectedAppointmentForAction.date
                          ).toLocaleDateString("vi-VN")
                        : "Chưa có thông tin"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Giờ:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedAppointmentForAction.time ||
                        selectedAppointmentForAction.timeSlot?.startTime ||
                        "Chưa có thông tin"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      if (!isRejecting) {
                        setShowRejectModal(false);
                        setSelectedAppointmentForAction(null);
                      }
                    }}
                    disabled={isRejecting}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleRejectAppointment}
                    disabled={isRejecting}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isRejecting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang xử lý...</span>
                      </>
                    ) : (
                      <span>Xác nhận từ chối</span>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
