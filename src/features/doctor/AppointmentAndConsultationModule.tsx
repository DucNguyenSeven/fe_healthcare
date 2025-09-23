'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Video, User, Phone, MessageSquare, FileText, Check, X, RotateCcw, ChevronLeft, ChevronRight, Plus, Send, Download, Mic, MicOff, VideoIcon, VideoOff, Search, Filter, CalendarDays, Repeat, Stethoscope, History, Brain, Activity, AlertTriangle, TrendingUp, TrendingDown, Minus, Eye, Save, UserCheck, Pill, ClipboardList, Heart, Thermometer, Weight, Zap } from 'lucide-react';
import DoctorScheduleRegistrationModal from './DoctorScheduleRegistrationModal';
import type { AppointmentWeekFilterResponse } from '@/lib/api/appointments';
import { useDoctorAppointments } from '@/hooks/appointments';
import { useAppointmentFilter } from '@/hooks/appointments/useAppointmentFilter';
import { useGetMe } from '@/hooks/auth/useGetMe';
import { useCreateMedicalRecord } from '@/hooks/medical-records';
import { useCreateMultiplePrescriptions } from '@/hooks/prescriptions';
import { updateAppointmentStatus, getAppointmentDetail } from '@/lib/api/appointments';
import { toast } from 'sonner';
import { MedicalResultModal } from '@/components/MedicalResultModal';
// Dữ liệu sẽ được lấy từ API, bỏ mock

// Sample patient data for examination modal
const patientData = {
  'patient-001': {
    name: 'Nguyễn Văn An',
    age: 45,
    gender: 'Nam',
    id: 'BN001',
    aiPrediction: {
      riskLevel: 'moderate',
      riskPercentage: 78,
      description: 'Chức năng thận giảm trung bình - cần theo dõi',
      keyIndicators: [{
        name: 'eGFR',
        value: '45 mL/min/1.73m²',
        status: 'low'
      }, {
        name: 'Creatinine',
        value: '1.8 mg/dL',
        status: 'high'
      }, {
        name: 'BUN',
        value: '28 mg/dL',
        status: 'high'
      }, {
        name: 'Protein niệu',
        value: '0.8g/kg',
        status: 'present'
      }],
      recommendations: ['Theo dõi chức năng thận định kỳ mỗi 3 tháng', 'Giảm lượng protein xuống 0.8g/kg cân nặng/ngày', 'Hạn chế muối dưới 5g/ngày', 'Kiểm tra định kỳ với bác sĩ chuyên khoa thận']
    },
    medicalHistory: [{
      date: '15/12/2023',
      doctor: 'Dr. Trần Minh Hoàng',
      diagnosis: 'CKD giai đoạn 2',
      treatment: 'ACE inhibitor, điều chỉnh chế độ ăn',
      labResults: {
        eGFR: 65,
        creatinine: 1.2
      }
    }, {
      date: '20/10/2023',
      doctor: 'Dr. Lê Minh Cường',
      symptoms: 'Mệt mỏi, tiểu đêm nhiều',
      findings: 'Phát hiện suy giảm chức năng thận nhẹ'
    }]
  }
};
const drugDatabase = [{
  id: 1,
  name: 'Lisinopril 10mg',
  category: 'ACE Inhibitor'
}, {
  id: 2,
  name: 'Amlodipine 5mg',
  category: 'Calcium Channel Blocker'
}, {
  id: 3,
  name: 'Furosemide 40mg',
  category: 'Diuretic'
}, {
  id: 4,
  name: 'Metformin 500mg',
  category: 'Antidiabetic'
}, {
  id: 5,
  name: 'Atorvastatin 20mg',
  category: 'Statin'
}];
const chatMessages = [{
  id: 1,
  sender: 'patient',
  message: 'Chào bác sĩ, con đang cảm thấy mệt mỏi nhiều hơn bình thường',
  time: '14:05'
}, {
  id: 2,
  sender: 'doctor',
  message: 'Chào anh, anh có thể mô tả cụ thể hơn về tình trạng mệt mỏi không?',
  time: '14:06'
}, {
  id: 3,
  sender: 'patient',
  message: 'Dạ, con thấy mệt ngay cả khi không làm gì nhiều, và hay buồn ngủ',
  time: '14:07'
}] as any[];
const quickSuggestions = ['Anh có uống đủ nước không?', 'Huyết áp của anh thế nào?', 'Anh có tuân thủ chế độ ăn không?', 'Khi nào anh cần tái khám?'];
interface AppointmentAndConsultationModuleProps {
  activeView?: string;
}

// @component: AppointmentAndConsultationModule
export const AppointmentAndConsultationModule = ({
  activeView = 'appointments'
}: AppointmentAndConsultationModuleProps) => {
  const [appointmentTab, setAppointmentTab] = useState('upcoming');
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [consultationTab, setConsultationTab] = useState('profile');
  const [chatMessage, setChatMessage] = useState('');
  const [prescription, setPrescription] = useState('');
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);

  // States cho Medical Result Modal
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>('');
  const [selectedDoctorInfo, setSelectedDoctorInfo] = useState<{name: string; specialty?: string; id?: string} | null>(null);
  const [selectedPatientInfo, setSelectedPatientInfo] = useState<{name: string; id: string; phone?: string; email?: string} | null>(null);

  // Fetch appointments theo tuần cho bác sĩ hiện tại
  const { data: me } = useGetMe();
  const { appointments: doctorWeekAppointments, loading: doctorAptLoading, error: doctorAptError, fetchDoctorAppointments, clearError: clearDoctorAptError } = useDoctorAppointments();

  // Hook cho filter appointments (tab Đã Hoàn Thành)
  const {
    appointments: completedAppointments,
    loading: completedLoading,
    error: completedError,
    fetchAppointments: fetchCompletedAppointments,
    clearError: clearCompletedError
  } = useAppointmentFilter();

  // Hooks for API calls
  const { create: createMedicalRecord, loading: medicalRecordLoading, error: medicalRecordError } = useCreateMedicalRecord();
  const { createMultiple: createPrescriptions, loading: prescriptionsLoading, error: prescriptionsError } = useCreateMultiplePrescriptions();

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
      start: startOfWeek.toISOString().split('T')[0], // YYYY-MM-DD
      end: endOfWeek.toISOString().split('T')[0] // YYYY-MM-DD
    };
  };

  const formatWeekRange = (date: Date) => {
    const { start, end } = getWeekStartEnd(date);
    const startDate = new Date(start);
    const endDate = new Date(end);

    const formatDate = (d: Date) =>
      `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  // Fetch appointments when currentWeek or doctorId changes
  React.useEffect(() => {
    if (!me?.userId) return;
    const { start, end } = getWeekStartEnd(currentWeek);
    fetchDoctorAppointments({ doctorId: me.userId, startTime: start, endTime: end });
  }, [me?.userId, currentWeek, fetchDoctorAppointments]);

  // Auto-navigate to week containing appointments if current week is empty
  React.useEffect(() => {
    if (!doctorAptLoading && doctorWeekAppointments && doctorWeekAppointments.length === 0 && me?.userId) {
      // No appointments in current week, try to find a week with appointments
      // For now, let's try the week containing 23/9/2025 based on the screenshots
      const targetDate = new Date('2025-09-23');
      const currentWeekStart = getWeekStartEnd(currentWeek).start;
      const targetWeekStart = getWeekStartEnd(targetDate).start;

      if (currentWeekStart !== targetWeekStart) {
        setCurrentWeek(targetDate);
      }
    }
  }, [doctorAptLoading, doctorWeekAppointments, me?.userId, currentWeek]);

  // Debug: Log appointments when they change
  React.useEffect(() => {
    // Removed verbose debug logs
  }, [doctorWeekAppointments, doctorAptLoading, doctorAptError]);

  // Fetch completed appointments khi chuyển sang tab completed
  React.useEffect(() => {
    if (appointmentTab === 'completed') {
      fetchCompletedAppointments({
        status: 'COMPLETED',
        page: 0,
        size: 50,
        sortBy: 'appointmentDate',
        sortDir: 'DESC'
      });
    }
  }, [appointmentTab, fetchCompletedAppointments]);

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Work schedule modal states
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    date: '',
    time: '',
    type: 'offline',
    repeat: 'none',
    notes: ''
  });

  // Examination modal states
  const [showExaminationModal, setShowExaminationModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [examinationTab, setExaminationTab] = useState('ai-result');
  const [labResults, setLabResults] = useState({
    creatinine: '',
    eGFR: '',
    BUN: '',
    calcium: '',
    ANA: '',
    complement: '',
    urineColor: '',
    oxalate: '',
    urinePH: ''
  });
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [customDiagnosis, setCustomDiagnosis] = useState('');
  const [diagnosisNotes, setDiagnosisNotes] = useState('');
  const [treatment, setTreatment] = useState('');
  const [doctorNote, setDoctorNote] = useState('');
  const [stage, setStage] = useState('');
  const [statusHealth, setStatusHealth] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [customServiceName, setCustomServiceName] = useState('');
  const [imageAttachments, setImageAttachments] = useState([]);
  const [prescriptionRows, setPrescriptionRows] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    return [{
      drug: '',
      dosage: '',
      quantity: '',
      usage: '',
      notes: '',
      startDate: today,
      endDate: nextWeek
    }];
  });
  const [prescriptionNotes, setPrescriptionNotes] = useState(`• Uống thuốc đều đặn theo giờ
• Theo dõi huyết áp hàng ngày
• Hạn chế muối trong thức ăn
• Tái khám sau 4 tuần
• Liên hệ ngay nếu có triệu chứng bất thường...`);
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpType, setFollowUpType] = useState('Khám định kỳ');
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-[#10B981]/10 text-[#10B981]';
      case 'pending':
        return 'bg-[#F59E0B]/10 text-[#F59E0B]';
      case 'cancelled':
        return 'bg-[#EF4444]/10 text-[#EF4444]';
      case 'completed':
        return 'bg-[#1E75FF]/10 text-[#1E75FF]';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };
  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Đã xác nhận';
      case 'pending':
        return 'Chờ xác nhận';
      case 'cancelled':
        return 'Đã hủy';
      case 'completed':
        return 'Hoàn thành';
      default:
        return 'Không xác định';
    }
  };
  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      setChatMessage('');
    }
  };
  const handleSavePrescription = () => {
    if (prescription.trim()) {
      toast.success('Đã lưu và gửi đơn thuốc cho bệnh nhân', {
        description: 'Đơn thuốc đã được gửi thành công',
        duration: 3000,
      });
      setPrescription('');
    }
  };
  const handleSaveSchedule = () => {
    if (scheduleForm.date && scheduleForm.time) {
      toast.success('Đã đăng ký lịch làm việc thành công', {
        description: 'Lịch làm việc đã được cập nhật',
        duration: 3000,
      });
      setShowScheduleModal(false);
      setScheduleForm({
        date: '',
        time: '',
        type: 'offline',
        repeat: 'none',
        notes: ''
      });
    }
  };
  const handleSaveScheduleFromModal = (data: any) => {
    // Schedule data đã được xử lý trong modal và gọi API
    // Modal sẽ tự động đóng sau khi API thành công

    // Refresh appointments data cho tuần hiện tại
    if (me?.userId) {
      const { start, end } = getWeekStartEnd(currentWeek);
      fetchDoctorAppointments({ doctorId: me.userId, startTime: start, endTime: end });
      toast.success('Đăng ký lịch làm việc thành công!');
    }
  };
  const openPatientExamination = (patientId: string, appointment: any) => {

    // Ưu tiên dữ liệu có sẵn trong mock nếu khớp id
    const patientFromMock = patientData[patientId as keyof typeof patientData];

    // Xác định patientId thực tế từ appointment data
    const actualPatientId = appointment.patientId || appointment.patientInfo?.id || patientId;


    // Tạo fallback patient từ dữ liệu cuộc hẹn nhận từ API
    const fallbackPatient = {
      name: appointment.patient || appointment.patientName || 'Bệnh nhân',
      age: appointment.patientInfo?.age || '',
      gender: appointment.patientInfo?.gender || 'Không rõ',
      id: actualPatientId || undefined, // Không gán 'N/A', để undefined nếu không có
    };

    const patient = patientFromMock || fallbackPatient;

    setSelectedPatient({
      ...patient,
      appointment
    });
    setShowExaminationModal(true);
    setExaminationTab('ai-result');
  };
  const viewPatientHistory = (patientId: string) => {
    const patient = patientData[patientId as keyof typeof patientData];
    if (patient) {
      setSelectedPatient(patient);
      setShowExaminationModal(true);
      setExaminationTab('history');
    }
  };

  // Handler cho Medical Result Modal
  const handleViewResult = (appointment: any) => {
    setSelectedAppointmentId(appointment.id);

    // Set doctor info (current user info)
    setSelectedDoctorInfo({
      name: me?.fullName || 'Bác sĩ',
      specialty: undefined, // TODO: Add specialty to user profile
      id: me?.userId || undefined
    });

    // Set patient info từ appointment data
    setSelectedPatientInfo({
      name: appointment.patient || 'Bệnh nhân',
      id: appointment.patientId || '',
      phone: appointment.patientPhone || undefined,
      email: appointment.patientEmail || undefined
    });

    setShowResultModal(true);
  };

  const handleCloseResultModal = () => {
    setShowResultModal(false);
    setSelectedAppointmentId('');
    setSelectedDoctorInfo(null);
    setSelectedPatientInfo(null);
  };
  const addPrescriptionRow = () => {
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    setPrescriptionRows([...prescriptionRows, {
      drug: '',
      dosage: '',
      quantity: '',
      usage: '',
      notes: '',
      startDate: today,
      endDate: nextWeek
    }]);
  };
  const removePrescriptionRow = (index: number) => {
    if (prescriptionRows.length > 1) {
      setPrescriptionRows(prescriptionRows.filter((_, i) => i !== index));
    }
  };
  const updatePrescriptionRow = (index: number, field: string, value: string) => {
    const newRows = [...prescriptionRows];
    newRows[index] = {
      ...newRows[index],
      [field]: value
    };
    setPrescriptionRows(newRows);
  };
  const handleCompleteExamination = async () => {
    if (!selectedPatient?.appointment || !me?.userId) {
      toast.error('Không có thông tin lịch hẹn hoặc bác sĩ', {
        description: 'Vui lòng kiểm tra lại thông tin',
        duration: 4000,
      });
      return;
    }

    // Validation basic required fields
    if (!diagnosis && !customDiagnosis) {
      toast.error('Vui lòng nhập chẩn đoán', {
        description: 'Chẩn đoán là thông tin bắt buộc',
        duration: 4000,
      });
      return;
    }

    if (!serviceName) {
      toast.error('Vui lòng chọn dịch vụ khám', {
        description: 'Dịch vụ khám là thông tin bắt buộc',
        duration: 4000,
      });
      return;
    }

    if (serviceName === 'other' && !customServiceName.trim()) {
      toast.error('Vui lòng nhập tên dịch vụ khám', {
        description: 'Tên dịch vụ khám không được để trống',
        duration: 4000,
      });
      return;
    }

    try {
      // LẤY THÔNG TIN CHI TIẾT APPOINTMENT để có patientId

      const appointmentId = selectedPatient.appointment.id || selectedPatient.appointment.appointmentId;

      // Ưu tiên lấy patientId từ appointment data, KHÔNG dùng selectedPatient.id nếu nó là 'N/A'

      // Try ALL possible field names for patientId
      let patientId = selectedPatient.appointment.patientId ||
                     selectedPatient.appointment.patient_id ||
                     selectedPatient.appointment.userId ||
                     selectedPatient.appointment.user_id ||
                     selectedPatient.appointment.clientId ||
                     selectedPatient.appointment.client_id ||
                     selectedPatient.appointment.patientInfo?.id ||
                     selectedPatient.appointment.patient?.id;


      // Nếu không có trong appointment, thử lấy từ selectedPatient.id (nhưng không phải 'N/A')
      if (!patientId && selectedPatient.id && selectedPatient.id !== 'N/A') {
        patientId = selectedPatient.id;
      }


      // Validate patientId - không cho phép 'N/A' hoặc giá trị không hợp lệ
      if (!patientId || patientId === 'N/A' || patientId.trim() === '') {
        try {
          const appointmentDetail = await getAppointmentDetail(appointmentId);
          patientId = appointmentDetail.patientId;
        } catch (detailError) {
          // Fallback: sử dụng một ID giả định hoặc lỗi
          throw new Error('Không thể xác định patientId cho appointment này');
        }
      }

      // Final validation trước khi gửi
      if (!patientId || patientId === 'N/A' || patientId.trim() === '') {
        throw new Error('Không thể xác định PatientId hợp lệ cho cuộc hẹn này');
      }

      // BƯỚC 1: Tạo medical record

      const medicalRecordData = {
        appointmentId,
        patientId,
        doctorId: me.userId,
        serviceName: serviceName === 'other' ? customServiceName : (serviceName || 'Khám tổng quát'),
        diagnosis: diagnosis === 'other' ? customDiagnosis : diagnosis,
        symptoms: symptoms || '',
        treatment: treatment || '',
        doctorNote: prescriptionNotes || '', // Map từ tab Kê đơn thuốc
        followUpDate: followUpDate || '',
        imageAttachments: imageAttachments || [],
        stage: stage ? parseInt(stage) : 0,
        statusHealth: statusHealth || 'stable'
      };

      const medicalRecord = await createMedicalRecord(medicalRecordData);

      // Kiểm tra recordId từ response (theo type definition chỉ có recordId field)
      const recordId = medicalRecord?.recordId;


      if (!medicalRecord || !recordId) {
        console.error('Medical record response:', medicalRecord);
        throw new Error('Không thể tạo hồ sơ khám - không nhận được recordId');
      }

      // Cập nhật medicalRecord để đảm bảo có recordId
      medicalRecord.recordId = recordId;

      // BƯỚC 2: Tạo prescriptions (chỉ những dòng có thuốc)
      const validPrescriptions = prescriptionRows
        .filter(row => row.drug && row.drug.trim() !== '' && row.dosage && row.usage)
        .map(row => ({
          medicalRecordId: recordId, // Sử dụng recordId đã extract
          medicalName: row.drug,
          dosage: row.dosage,
          frequency: row.usage ? row.usage.split(',') : [], // Transform string to array
          startDate: row.startDate || '',
          endDate: row.endDate || '',
          notes: row.notes || ''
        }));

      if (validPrescriptions.length > 0) {
        const prescriptionResult = await createPrescriptions(validPrescriptions);

        if (prescriptionResult.failed.length > 0) {
        }
      }

      // BƯỚC 3: Cập nhật appointment status
      await updateAppointmentStatus(selectedPatient.appointment.id || selectedPatient.appointment.appointmentId, 'COMPLETED');

      // SUCCESS: Đóng modal, reset form và refresh data
      toast.success('Đã hoàn thành khám bệnh và lưu hồ sơ thành công!', {
        description: 'Hồ sơ khám bệnh và đơn thuốc đã được lưu',
        duration: 3000,
      });
      setShowExaminationModal(false);
      resetFormData();

      // Refresh danh sách appointments
      if (me?.userId) {
        const { start, end } = getWeekStartEnd(currentWeek);
        fetchDoctorAppointments({ doctorId: me.userId, startTime: start, endTime: end });
      }

    } catch (error: any) {
      console.error('Lỗi khi hoàn thành khám:', error);
      toast.error('Có lỗi xảy ra khi khám bệnh', {
        description: error.message || 'Không thể hoàn thành khám bệnh',
        duration: 5000,
      });
    }
  };

  const resetFormData = () => {
    // Reset form data
    setLabResults({
      creatinine: '',
      eGFR: '',
      BUN: '',
      calcium: '',
      ANA: '',
      complement: '',
      urineColor: '',
      oxalate: '',
      urinePH: ''
    });
    setSymptoms('');
    setDiagnosis('');
    setCustomDiagnosis('');
    setDiagnosisNotes('');
    setTreatment('');
    setDoctorNote('');
    setStage('');
    setStatusHealth('');
    setServiceName('');
    setCustomServiceName('');
    setImageAttachments([]);

    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    setPrescriptionRows([{
      drug: '',
      dosage: '',
      quantity: '',
      usage: '',
      notes: '',
      startDate: today,
      endDate: nextWeek
    }]);
    setFollowUpDate('');
  };
  // Chuyển dữ liệu API thành format cũ của UI
  const normalizedAppointments = React.useMemo(() => {
    // Transform doctor week appointments (cho tab upcoming)
    const weekAppointments = (doctorWeekAppointments ?? []).map((apt: AppointmentWeekFilterResponse, idx: number) => ({
      id: apt.appointmentId || idx,
      patient: apt.patientName,
      time: apt.timeSlot?.startTime || '',
      date: typeof apt.date === 'string' ? apt.date : new Date(apt.date as any).toISOString().split('T')[0],
      service: apt.note || 'Khám trực tiếp',
      status: (apt.status || 'CONFIRMED').toString().toLowerCase(),
      type: 'offline',
      hasAIPrediction: false,
      patientId: apt.patientId || ''
    }));

    // Transform completed appointments (cho tab completed)
    const completedAppointmentsNormalized = (completedAppointments ?? []).map((apt: any, idx: number) => ({
      id: apt.appointmentId || `completed-${idx}`,
      patient: apt.patient?.fullName || apt.patient?.name || 'Bệnh nhân',
      time: apt.timeSlot?.startTime || '',
      date: apt.appointmentDate || '',
      service: apt.note || 'Khám trực tiếp',
      status: 'completed',
      type: apt.consultationType === 'ONLINE_CONSULTATION' ? 'online' : 'offline',
      hasAIPrediction: false,
      patientId: apt.patient?.id || ''
    }));

    // Merge cả 2 sources
    return [...weekAppointments, ...completedAppointmentsNormalized];
  }, [doctorWeekAppointments, completedAppointments]);

  const filterAppointments = (appointments: any[]) => {
    return appointments.filter(appointment => {
      const matchesSearch = appointment.patient.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || appointment.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  };
  const renderExaminationModal = () => {
    if (!selectedPatient) return null;
    return <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div initial={{
        opacity: 0,
        scale: 0.95
      }} animate={{
        opacity: 1,
        scale: 1
      }} exit={{
        opacity: 0,
        scale: 0.95
      }} className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl">
          {/* Modal Header */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#1E75FF] rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#0F172A]">{selectedPatient.name}</h3>
                <p className="text-[#334155]">{selectedPatient.gender}, {selectedPatient.age} tuổi • ID: {selectedPatient.id}</p>
                {selectedPatient.appointment && <span className="inline-block mt-1 px-3 py-1 bg-[#E3F2FD] text-[#1565C0] rounded-full text-sm">
                    {selectedPatient.appointment.service}
                  </span>}
              </div>
            </div>
            <button onClick={() => setShowExaminationModal(false)} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
              <X size={16} className="text-[#334155]" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 px-6">
            <div className="flex">
              {[{
              id: 'ai-result',
              label: 'Kết quả AI',
              icon: Brain
            }, {
              id: 'history',
              label: 'Lịch sử khám',
              icon: History
            }, {
              id: 'examination',
              label: 'Khám bệnh',
              icon: Stethoscope
            }, {
              id: 'prescription',
              label: 'Kê đơn thuốc',
              icon: Pill
            }].map(tab => {
              const Icon = tab.icon;
              return <button key={tab.id} onClick={() => setExaminationTab(tab.id)} className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 ${examinationTab === tab.id ? 'text-[#1E75FF] border-[#1E75FF]' : 'text-[#334155] border-transparent hover:text-[#1E75FF]'}`}>
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </button>;
            })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              <motion.div key={examinationTab} initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} exit={{
              opacity: 0,
              y: -20
            }} transition={{
              duration: 0.2
            }}>
                {/* AI Results Tab */}
                {examinationTab === 'ai-result' && (
                  <div className="space-y-6">
                    {selectedPatient.aiPrediction ? (
                      <>
                        <div className="bg-gradient-to-r from-[#F59E0B]/10 to-[#F57C00]/10 border border-[#F59E0B]/20 rounded-2xl p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-[#F59E0B] to-[#F57C00] rounded-full flex items-center justify-center">
                              <AlertTriangle className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-[#0F172A]">
                                Nguy cơ {selectedPatient.aiPrediction.riskLevel === 'moderate' ? 'Trung bình' : 'Cao'} - {selectedPatient.aiPrediction.riskPercentage}%
                              </h4>
                              <p className="text-[#334155]">{selectedPatient.aiPrediction.description}</p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-white border border-gray-200 rounded-2xl p-6">
                            <h4 className="text-lg font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
                              <Activity className="w-5 h-5 text-[#1E75FF]" />
                              <span>Các chỉ số quan trọng</span>
                            </h4>
                            <div className="space-y-3">
                              {selectedPatient.aiPrediction.keyIndicators.map((indicator: any, index: number) => <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                  <div>
                                    <p className="font-medium text-[#0F172A]">{indicator.name}</p>
                                    <p className="text-sm text-[#334155]">{indicator.value}</p>
                                  </div>
                                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${indicator.status === 'high' ? 'bg-[#EF4444]/10 text-[#EF4444]' : indicator.status === 'low' ? 'bg-[#F59E0B]/10 text-[#F59E0B]' : 'bg-[#10B981]/10 text-[#10B981]'}`}>
                                    {indicator.status === 'high' ? 'Cao' : indicator.status === 'low' ? 'Thấp' : 'Có'}
                                  </div>
                                </div>)}
                            </div>
                          </div>

                          <div className="bg-white border border-gray-200 rounded-2xl p-6">
                            <h4 className="text-lg font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
                              <Brain className="w-5 h-5 text-[#1E75FF]" />
                              <span>Khuyến nghị từ AI</span>
                            </h4>
                            <div className="space-y-3">
                              {selectedPatient.aiPrediction.recommendations.map((rec: string, index: number) => <div key={index} className="flex items-start gap-3 p-3 bg-[#1E75FF]/5 rounded-xl">
                                  <div className="w-2 h-2 bg-[#1E75FF] rounded-full mt-2 flex-shrink-0"></div>
                                  <p className="text-sm text-[#334155]">{rec}</p>
                                </div>)}
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <Brain size={48} className="text-gray-400 mx-auto mb-4" />
                        <p className="text-[#334155]">Không có dự đoán AI</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Medical History Tab */}
                {examinationTab === 'history' && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-[#0F172A] flex items-center gap-2">
                      <History className="w-5 h-5 text-[#1E75FF]" />
                      <span>Lịch sử khám bệnh</span>
                    </h4>
                    <div className="space-y-4">
                      {selectedPatient.medicalHistory && selectedPatient.medicalHistory.length > 0 ? (
                        selectedPatient.medicalHistory.map((record: any, index: number) => <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h5 className="font-semibold text-[#0F172A]">
                                  {record.diagnosis ? `Khám định kỳ - ${record.doctor}` : `Khám tổng quát - ${record.doctor}`}
                                </h5>
                                <p className="text-sm text-[#334155]">{record.date}</p>
                              </div>
                            </div>
                            <div className="space-y-3">
                              {record.diagnosis && <div>
                                  <p className="text-sm font-medium text-[#334155]">Chẩn đoán:</p>
                                  <p className="text-[#0F172A]">{record.diagnosis}</p>
                                </div>}
                              {record.treatment && <div>
                                  <p className="text-sm font-medium text-[#334155]">Điều trị:</p>
                                  <p className="text-[#0F172A]">{record.treatment}</p>
                                </div>}
                              {record.symptoms && <div>
                                  <p className="text-sm font-medium text-[#334155]">Triệu chứng:</p>
                                  <p className="text-[#0F172A]">{record.symptoms}</p>
                                </div>}
                              {record.findings && <div>
                                  <p className="text-sm font-medium text-[#334155]">Kết quả:</p>
                                  <p className="text-[#0F172A]">{record.findings}</p>
                                </div>}
                              {record.labResults && <div className="flex gap-4 mt-3">
                                  <span className="px-3 py-1 bg-gray-100 rounded-lg text-sm">
                                    eGFR: {record.labResults.eGFR}
                                  </span>
                                  <span className="px-3 py-1 bg-gray-100 rounded-lg text-sm">
                                    Creatinine: {record.labResults.creatinine}
                                  </span>
                                </div>}
                            </div>
                          </div>)
                      ) : (
                        <div className="text-center py-12">
                          <History size={48} className="text-gray-400 mx-auto mb-4" />
                          <p className="text-[#334155]">Chưa có lịch sử khám</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Examination Tab */}
                {examinationTab === 'examination' && <div className="space-y-6">
                    {/* Vital Signs */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                      <h4 className="text-lg font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-[#1E75FF]" />
                        <span>Kết quả xét nghiệm</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[#334155] mb-2">
                            Creatinin huyết thanh (mg/dL)
                          </label>
                          <input type="number" step="0.1" placeholder="1.0" value={labResults.creatinine} onChange={e => setLabResults({
                        ...labResults,
                        creatinine: e.target.value
                      })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#334155] mb-2">
                            eGFR (ml/min)
                          </label>
                          <input type="number" placeholder="95" value={labResults.eGFR} onChange={e => setLabResults({
                        ...labResults,
                        eGFR: e.target.value
                      })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#334155] mb-2">
                            Ure máu (BUN) (mg/dL)
                          </label>
                          <input type="number" placeholder="15" value={labResults.BUN} onChange={e => setLabResults({
                        ...labResults,
                        BUN: e.target.value
                      })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#334155] mb-2">
                            Canxi huyết thanh (mg/dL)
                          </label>
                          <input type="number" step="0.1" placeholder="10.0" value={labResults.calcium} onChange={e => setLabResults({
                        ...labResults,
                        calcium: e.target.value
                      })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#334155] mb-2">
                            ANA
                          </label>
                          <select value={labResults.ANA} onChange={e => setLabResults({
                        ...labResults,
                        ANA: e.target.value
                      })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent">
                            <option value="">Chọn kết quả</option>
                            <option value="Âm tính">Âm tính</option>
                            <option value="Dương tính">Dương tính</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#334155] mb-2">
                            Bổ thể C3/C4 (mg/dL)
                          </label>
                          <input type="number" placeholder="130" value={labResults.complement} onChange={e => setLabResults({
                        ...labResults,
                        complement: e.target.value
                      })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#334155] mb-2">
                            Đái màu
                          </label>
                          <select value={labResults.urineColor} onChange={e => setLabResults({
                        ...labResults,
                        urineColor: e.target.value
                      })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent">
                            <option value="">Chọn màu</option>
                            <option value="Âm tính">Âm tính</option>
                            <option value="Dương tính">Dương tính</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#334155] mb-2">
                            Nồng độ oxalat (mg/day)
                          </label>
                          <input type="number" step="0.1" placeholder="1.8" value={labResults.oxalate} onChange={e => setLabResults({
                        ...labResults,
                        oxalate: e.target.value
                      })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#334155] mb-2">
                            pH nước tiểu
                          </label>
                          <input type="number" step="0.1" placeholder="7.0" value={labResults.urinePH} onChange={e => setLabResults({
                        ...labResults,
                        urinePH: e.target.value
                      })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent" />
                        </div>
                      </div>
                    </div>

                    {/* Symptoms & Clinical Examination */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                      <h4 className="text-lg font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
                        <Stethoscope className="w-5 h-5 text-[#1E75FF]" />
                        <span>Triệu chứng & Khám lâm sàng</span>
                      </h4>
                      <textarea placeholder="Ghi chú triệu chứng hiện tại, kết quả khám lâm sàng..." rows={4} value={symptoms} onChange={e => setSymptoms(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent resize-none" />
                    </div>

                    {/* Diagnosis */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                      <h4 className="text-lg font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-[#1E75FF]" />
                        <span>Chẩn đoán</span>
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-[#334155] mb-2">
                            Chẩn đoán chính
                          </label>
                          <select value={diagnosis} onChange={e => setDiagnosis(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent">
                            <option value="">Chọn chẩn đoán chính</option>
                            <option value="N18.3">Bệnh thận mạn giai đoạn 3A (N18.3)</option>
                            <option value="N18.4">Bệnh thận mạn giai đoạn 3B (N18.4)</option>
                            <option value="I12.9">Tăng huyết áp thận (I12.9)</option>
                            <option value="other">Khác...</option>
                          </select>
                        </div>
                        {diagnosis === 'other' && (
                          <div>
                            <label className="block text-sm font-medium text-[#334155] mb-2">
                              Nhập chẩn đoán
                            </label>
                            <input
                              type="text"
                              placeholder="Nhập chẩn đoán cụ thể..."
                              value={customDiagnosis}
                              onChange={e => setCustomDiagnosis(e.target.value)}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Treatment Plan */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                      <h4 className="text-lg font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-[#1E75FF]" />
                        <span>Kế hoạch điều trị</span>
                      </h4>
                      <textarea placeholder="Nhập kế hoạch điều trị chi tiết..." rows={4} value={treatment} onChange={e => setTreatment(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent resize-none" />
                    </div>

{/* Stage and Health Status */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                      <h4 className="text-lg font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-[#1E75FF]" />
                        <span>Tình trạng bệnh</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[#334155] mb-2">
                            Dịch vụ khám
                          </label>
                          <select value={serviceName} onChange={e => setServiceName(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent">
                            <option value="">Chọn dịch vụ khám</option>
                            <option value="Khám tổng quát">Khám tổng quát</option>
                            <option value="Nội tổng quát">Nội tổng quát</option>
                            <option value="Tim mạch">Tim mạch</option>
                            <option value="Thận - Tiết niệu">Thận - Tiết niệu</option>
                            <option value="Nội tiết">Nội tiết</option>
                            <option value="Khám định kỳ">Khám định kỳ</option>
                            <option value="Tái khám">Tái khám</option>
                            <option value="other">Khác...</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#334155] mb-2">
                            Giai đoạn bệnh
                          </label>
                          <select value={stage} onChange={e => setStage(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent">
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
                          <select value={statusHealth} onChange={e => setStatusHealth(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent">
                            <option value="">Chọn tình trạng</option>
                            <option value="stable">Ổn định</option>
                            <option value="improving">Cải thiện</option>
                            <option value="declining">Suy giảm</option>
                            <option value="critical">Nguy kịch</option>
                          </select>
                        </div>
                      </div>
                      {serviceName === 'other' && (
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-[#334155] mb-2">
                            Nhập dịch vụ khám
                          </label>
                          <input
                            type="text"
                            placeholder="Nhập tên dịch vụ khám cụ thể..."
                            value={customServiceName}
                            onChange={e => setCustomServiceName(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent"
                          />
                        </div>
                      )}
                    </div>
                  </div>}

                {/* Prescription Tab */}
                {examinationTab === 'prescription' && <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-[#0F172A] flex items-center gap-2">
                        <Pill className="w-5 h-5 text-[#1E75FF]" />
                        <span>Kê đơn thuốc</span>
                      </h4>
                      <button onClick={addPrescriptionRow} className="bg-[#10B981] hover:bg-[#059669] text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors">
                        <Plus size={16} />
                        <span>Thêm thuốc</span>
                      </button>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-medium text-[#334155]">Tên thuốc</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-[#334155]">Liều lượng</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-[#334155]">Số lượng</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-[#334155]">Cách dùng</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-[#334155]">Ngày bắt đầu</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-[#334155]">Ngày kết thúc</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-[#334155]">Ghi chú</th>
                              <th className="px-4 py-3 text-center text-sm font-medium text-[#334155]">Thao tác</th>
                            </tr>
                          </thead>
                          <tbody>
                            {prescriptionRows.map((row, index) => <tr key={index} className="border-t border-gray-100">
                                <td className="px-4 py-3">
                                  <select value={row.drug} onChange={e => updatePrescriptionRow(index, 'drug', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent text-sm">
                                    <option value="">Tìm thuốc...</option>
                                    {drugDatabase.map(drug => <option key={drug.id} value={drug.name}>{drug.name}</option>)}
                                  </select>
                                </td>
                                <td className="px-4 py-3">
                                  <input type="text" placeholder="10mg" value={row.dosage} onChange={e => updatePrescriptionRow(index, 'dosage', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent text-sm" />
                                </td>
                                <td className="px-4 py-3">
                                  <input type="number" placeholder="30" value={row.quantity} onChange={e => updatePrescriptionRow(index, 'quantity', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent text-sm" />
                                </td>
                                <td className="px-4 py-3">
                                  <select value={row.usage} onChange={e => updatePrescriptionRow(index, 'usage', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent text-sm">
                                    <option value="">Chọn cách dùng</option>
                                    <option value="MORNING">Sáng</option>
                                    <option value="AFTERNOON">Chiều</option>
                                    <option value="EVENING">Tối</option>
                                    <option value="MORNING,AFTERNOON">Sáng & Chiều</option>
                                    <option value="MORNING,EVENING">Sáng & Tối</option>
                                    <option value="AFTERNOON,EVENING">Chiều & Tối</option>
                                    <option value="MORNING,AFTERNOON,EVENING">Sáng, Chiều & Tối</option>
                                  </select>
                                </td>
                                <td className="px-4 py-3">
                                  <input type="date" value={row.startDate} onChange={e => updatePrescriptionRow(index, 'startDate', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent text-sm" />
                                </td>
                                <td className="px-4 py-3">
                                  <input type="date" value={row.endDate} onChange={e => updatePrescriptionRow(index, 'endDate', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent text-sm" />
                                </td>
                                <td className="px-4 py-3">
                                  <input type="text" placeholder="Uống sau ăn" value={row.notes} onChange={e => updatePrescriptionRow(index, 'notes', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent text-sm" />
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <button onClick={() => removePrescriptionRow(index)} className="text-[#EF4444] hover:bg-[#EF4444]/10 p-1 rounded transition-colors">
                                    <X size={16} />
                                  </button>
                                </td>
                              </tr>)}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Prescription Notes */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                      <h5 className="font-semibold text-[#0F172A] mb-3">📝 Hướng dẫn sử dụng & Lưu ý</h5>
                      <textarea rows={6} value={prescriptionNotes} onChange={e => setPrescriptionNotes(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent resize-none" />
                    </div>

                    {/* Follow-up */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                      <h5 className="font-semibold text-[#0F172A] mb-4">📅 Lịch tái khám</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[#334155] mb-2">
                            Ngày tái khám
                          </label>
                          <input type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#334155] mb-2">
                            Loại khám
                          </label>
                          <select value={followUpType} onChange={e => setFollowUpType(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent">
                            <option value="Khám định kỳ">Khám định kỳ</option>
                            <option value="Xét nghiệm kiểm tra">Xét nghiệm kiểm tra</option>
                            <option value="Khám cấp cứu nếu cần">Khám cấp cứu nếu cần</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Modal Footer */}
          <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
            <button onClick={() => setShowExaminationModal(false)} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-[#334155] rounded-xl font-medium transition-colors">
              Hủy
            </button>
            <button onClick={() => toast.success('Đã lưu nháp khám bệnh', {
              description: 'Thông tin khám bệnh đã được lưu tạm thời',
              duration: 3000,
            })} className="px-6 py-3 bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-xl font-medium flex items-center gap-2 transition-colors">
              <Save size={16} />
              <span>Lưu nháp</span>
            </button>
            <button
              onClick={handleCompleteExamination}
              disabled={medicalRecordLoading || prescriptionsLoading}
              className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors ${
                medicalRecordLoading || prescriptionsLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#10B981] hover:bg-[#059669]'
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
      </div>;
  };
  const renderAppointments = () => {
    // Lọc appointments theo tab hiện tại
    const currentAppointments = normalizedAppointments.filter(appointment => {
      if (appointmentTab === 'upcoming') {
        // Tab "Sắp tới": hiển thị appointments có status là CONFIRMED hoặc PENDING
        return appointment.status === 'confirmed' || appointment.status === 'pending';
      } else if (appointmentTab === 'completed') {
        // Tab "Đã Hoàn Thành": hiển thị appointments có status là COMPLETED
        return appointment.status === 'completed';
      }
      return false;
    });
    const filteredAppointments = filterAppointments(currentAppointments);
    return <div className="p-6 space-y-6">
        <div className="flex items-center justify-between" style={{
        display: "none"
      }}>
          <h1 className="text-3xl font-bold text-[#0F172A]">Quản lý lịch hẹn</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_10px_24px_rgba(16,24,40,0.08)] overflow-hidden">
          <div className="border-b border-gray-100">
            <div className="flex">
              {[{
              id: 'upcoming',
              label: 'Sắp tới'
            }, {
              id: 'completed',
              label: 'Đã Hoàn Thành'
            }].map(tab => <button key={tab.id} onClick={() => setAppointmentTab(tab.id)} className={`px-6 py-4 font-medium transition-colors ${appointmentTab === tab.id ? 'text-[#1E75FF] border-b-2 border-[#1E75FF]' : 'text-[#334155] hover:text-[#1E75FF]'}`}>
                  {tab.label}
                </button>)}
            </div>
          </div>

          {/* Filter and Search Toolbar */}
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#334155]" />
                <input type="text" placeholder="Tìm kiếm theo tên bệnh nhân..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent" />
              </div>
              <div className="flex items-center gap-2">
                <Filter size={20} className="text-[#334155]" />
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent">
                  <option value="all">Tất cả loại khám</option>
                  <option value="online">Trực tuyến</option>
                  <option value="offline">Trực tiếp</option>
                </select>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent">
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
            {(doctorAptLoading || (appointmentTab === 'completed' && completedLoading)) && (
              <div className="text-center py-8 text-[#334155]">Đang tải lịch hẹn...</div>
            )}
            {(doctorAptError || (appointmentTab === 'completed' && completedError)) && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-700">{doctorAptError || completedError}</span>
                </div>
                <button onClick={appointmentTab === 'completed' ? clearCompletedError : clearDoctorAptError} className="mt-2 text-sm text-red-600 hover:text-red-800 underline">Thử lại</button>
              </div>
            )}
            {filteredAppointments.length === 0 ? <div className="text-center py-12">
                <Calendar size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-[#334155] mb-4">Chưa có lịch hẹn nào trong mục này</p>
              </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAppointments.map((appointment, index) => <motion.div key={appointment.id} initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: index * 0.1
            }} className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {appointment.type === 'online' ? <Video size={20} className="text-[#1E75FF]" /> : <User size={20} className="text-[#10B981]" />}
                        <span className="text-sm font-medium text-[#334155]">
                          {appointment.type === 'online' ? 'Trực tuyến' : 'Trực tiếp'}
                        </span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      <h3 className="font-semibold text-[#0F172A]">{appointment.patient}</h3>
                      <p className="text-sm text-[#334155]">{appointment.service}</p>
                      <div className="flex items-center gap-2 text-sm text-[#334155]">
                        <Clock size={16} />
                        <span>{appointment.time} - {new Date(appointment.date).toLocaleDateString('vi-VN')}</span>
                      </div>
                      {appointment.hasAIPrediction && <div className="flex items-center gap-2">
                          <div className="px-3 py-1 bg-gradient-to-r from-[#1E75FF] to-[#10B981] text-white rounded-full text-xs font-medium flex items-center gap-1">
                            <Brain size={12} />
                            <span>Có kết quả dự đoán AI</span>
                          </div>
                        </div>}
                    </div>

                    {/* Updated Action Buttons */}
                    {appointmentTab === 'upcoming' && appointment.status === 'confirmed' && <div className="flex gap-2">
                        <button onClick={() => openPatientExamination(appointment.patientId, appointment)} className="flex-1 bg-[#10B981] hover:bg-[#059669] text-white py-2 px-3 rounded-xl text-sm font-medium flex items-center justify-center gap-1 transition-colors">
                          <Stethoscope size={16} />
                          <span>Bắt đầu khám</span>
                        </button>
                        <button onClick={() => viewPatientHistory(appointment.patientId)} className="flex-1 bg-[#F59E0B] hover:bg-[#D97706] text-white py-2 px-3 rounded-xl text-sm font-medium flex items-center justify-center gap-1 transition-colors">
                          <History size={16} />
                          <span>Xem lịch sử</span>
                        </button>
                      </div>}

                    {appointmentTab === 'upcoming' && appointment.status === 'pending' && <div className="flex gap-2">
                        <button className="flex-1 bg-[#10B981] hover:bg-[#059669] text-white py-2 px-3 rounded-xl text-sm font-medium flex items-center justify-center gap-1 transition-colors">
                          <Check size={16} />
                          <span>Chấp nhận</span>
                        </button>
                        <button className="flex-1 bg-[#EF4444] hover:bg-[#DC2626] text-white py-2 px-3 rounded-xl text-sm font-medium flex items-center justify-center gap-1 transition-colors">
                          <X size={16} />
                          <span>Từ chối</span>
                        </button>
                      </div>}

                    {appointmentTab === 'completed' && appointment.status === 'completed' && <button onClick={() => handleViewResult(appointment)} className="w-full bg-[#1E75FF] hover:bg-[#1659C9] text-white py-2 px-3 rounded-xl text-sm font-medium flex items-center justify-center gap-1 transition-colors">
                        <Eye size={16} />
                        <span>Xem kết quả</span>
                      </button>}
                  </motion.div>)}
              </div>}
          </div>
        </div>
      </div>;
  };
  const renderConsultation = () => <div className="p-6 h-full">
      <div className="bg-white rounded-2xl shadow-[0_10px_24px_rgba(16,24,40,0.08)] h-full flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[#0F172A]">Tư vấn trực tuyến</h1>
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
                <button onClick={() => setIsMuted(!isMuted)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-[#EF4444] hover:bg-[#DC2626]' : 'bg-white/20 hover:bg-white/30'}`}>
                  {isMuted ? <MicOff size={20} className="text-white" /> : <Mic size={20} className="text-white" />}
                </button>
                <button onClick={() => setIsVideoOn(!isVideoOn)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${!isVideoOn ? 'bg-[#EF4444] hover:bg-[#DC2626]' : 'bg-white/20 hover:bg-white/30'}`}>
                  {isVideoOn ? <VideoIcon size={20} className="text-white" /> : <VideoOff size={20} className="text-white" />}
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
                {[{
                id: 'profile',
                label: 'Hồ sơ',
                icon: User
              }, {
                id: 'chat',
                label: 'Chat',
                icon: MessageSquare
              }, {
                id: 'prescription',
                label: 'Chỉ định',
                icon: FileText
              }].map(tab => {
                const Icon = tab.icon;
                return <button key={tab.id} onClick={() => setConsultationTab(tab.id)} className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${consultationTab === tab.id ? 'text-[#1E75FF] border-b-2 border-[#1E75FF]' : 'text-[#334155] hover:text-[#1E75FF]'}`}>
                      <Icon size={16} />
                      <span>{tab.label}</span>
                    </button>;
              })}
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div key={consultationTab} initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} exit={{
                opacity: 0,
                y: -20
              }} transition={{
                duration: 0.2
              }}>
                  {consultationTab === 'profile' && <div className="space-y-4">
                      <h3 className="font-semibold text-[#0F172A] mb-3">Thông tin bệnh nhân</h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-gray-50 rounded-xl">
                          <p className="text-xs text-[#334155] mb-1">Họ tên</p>
                          <p className="font-medium text-[#0F172A]">Nguyễn Văn An</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-xl">
                          <p className="text-xs text-[#334155] mb-1">Tuổi</p>
                          <p className="font-medium text-[#0F172A]">65 tuổi</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-xl">
                          <p className="text-xs text-[#334155] mb-1">eGFR mới nhất</p>
                          <p className="font-medium text-[#0F172A]">45 ml/min</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-xl">
                          <p className="text-xs text-[#334155] mb-1">Giai đoạn CKD</p>
                          <p className="font-medium text-[#0F172A]">Giai đoạn 3</p>
                        </div>
                        <div className="p-3 bg-[#EF4444]/5 border border-[#EF4444]/20 rounded-xl">
                          <p className="text-xs text-[#EF4444] mb-1">Dị ứng</p>
                          <p className="font-medium text-[#0F172A]">Penicillin</p>
                        </div>
                      </div>
                    </div>}

                  {consultationTab === 'chat' && <div className="flex flex-col h-full">
                      <div className="flex-1 space-y-3 mb-4">
                        {chatMessages.map(message => <div key={message.id} className={`flex ${message.sender === 'doctor' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-2xl ${message.sender === 'doctor' ? 'bg-[#1E75FF] text-white' : 'bg-gray-100 text-[#0F172A]'}`}>
                              <p className="text-sm">{message.message}</p>
                              <p className={`text-xs mt-1 ${message.sender === 'doctor' ? 'text-white/70' : 'text-[#334155]'}`}>
                                {message.time}
                              </p>
                            </div>
                          </div>)}
                      </div>

                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {quickSuggestions.map((suggestion, index) => <button key={index} onClick={() => setChatMessage(suggestion)} className="text-xs bg-gray-100 hover:bg-gray-200 text-[#334155] px-3 py-2 rounded-xl transition-colors">
                              {suggestion}
                            </button>)}
                        </div>
                        <div className="flex gap-2">
                          <input type="text" value={chatMessage} onChange={e => setChatMessage(e.target.value)} placeholder="Nhập tin nhắn..." className="flex-1 px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent text-sm" onKeyPress={e => e.key === 'Enter' && handleSendMessage()} />
                          <button onClick={handleSendMessage} className="bg-[#1E75FF] hover:bg-[#1659C9] text-white p-2 rounded-xl transition-colors">
                            <Send size={16} />
                          </button>
                        </div>
                      </div>
                    </div>}

                  {consultationTab === 'prescription' && <div className="space-y-4">
                      <h3 className="font-semibold text-[#0F172A]">Đơn thuốc & Chỉ định</h3>
                      <textarea value={prescription} onChange={e => setPrescription(e.target.value)} placeholder="Nhập đơn thuốc và chỉ định điều trị..." rows={12} className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent text-sm resize-none" />
                      <button onClick={handleSavePrescription} className="w-full bg-[#10B981] hover:bg-[#059669] text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors">
                        <Download size={16} />
                        <span>Lưu & Gửi PDF</span>
                      </button>
                    </div>}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>;
  const renderSchedule = () => {
    // Week days configuration (Monday to Sunday)
    const weekDays = [{
      key: 'mon',
      label: 'T2',
      fullName: 'Thứ Hai'
    }, {
      key: 'tue',
      label: 'T3',
      fullName: 'Thứ Ba'
    }, {
      key: 'wed',
      label: 'T4',
      fullName: 'Thứ Tư'
    }, {
      key: 'thu',
      label: 'T5',
      fullName: 'Thứ Năm'
    }, {
      key: 'fri',
      label: 'T6',
      fullName: 'Thứ Sáu'
    }, {
      key: 'sat',
      label: 'T7',
      fullName: 'Thứ Bảy'
    }, {
      key: 'sun',
      label: 'CN',
      fullName: 'Chủ Nhật'
    }];

    // Dynamic time slots: combine default slots with actual appointment times
    const defaultTimeSlots = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];

    // Extract unique time slots from actual appointments
    const appointmentTimeSlots = doctorWeekAppointments
      ?.map(apt => apt.timeSlot?.startTime?.substring(0, 5))
      .filter((time): time is string => Boolean(time)) || [];

    // Combine and deduplicate
    const combinedSlots = [...defaultTimeSlots, ...appointmentTimeSlots];
    const uniqueSlots = combinedSlots.filter((slot, index) => combinedSlots.indexOf(slot) === index);
    const allTimeSlots = uniqueSlots;

    // Sort time slots
    const timeSlots = allTimeSlots.sort((a, b) => {
      const timeA = a.split(':').map(Number);
      const timeB = b.split(':').map(Number);
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
      return dayIndex === 0 ? 'sun' : weekDays[dayIndex - 1]?.key || 'mon';
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
      if (typeof inputDate === 'string') {
        // Handle different formats: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD
        if (inputDate.includes('/')) {
          // DD/MM/YYYY format
          const [day, month, year] = inputDate.split('/');
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        } else if (inputDate.includes('-')) {
          // Could be DD-MM-YYYY or YYYY-MM-DD
          const parts = inputDate.split('-');
          if (parts[0].length === 4) {
            // Already YYYY-MM-DD
            return inputDate;
          } else {
            // DD-MM-YYYY
            const [day, month, year] = parts;
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          }
        }
        // If no separators, try to parse as is
        return inputDate;
      } else if (inputDate instanceof Date) {
        return inputDate.toISOString().split('T')[0];
      }
      return String(inputDate);
    };

    // Get appointment by date and time
    const getAppointmentForSlot = (date: Date, time: string) => {
      if (!doctorWeekAppointments) return null;

      const searchDateStr = normalizeDateForComparison(date); // YYYY-MM-DD

      // Removed debug logs

      const foundAppointment = doctorWeekAppointments.find(apt => {
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
        case 'CONFIRMED':
          return 'bg-[#1E75FF]/10 border-[#1E75FF]/20 text-[#1E75FF]';
        case 'PENDING':
          return 'bg-[#F59E0B]/10 border-[#F59E0B]/20 text-[#F59E0B]';
        case 'COMPLETED':
          return 'bg-[#10B981]/10 border-[#10B981]/20 text-[#10B981]';
        case 'CANCELED':
          return 'bg-[#EF4444]/10 border-[#EF4444]/20 text-[#EF4444]';
        case 'REJECTED':
          return 'bg-[#DC2626]/10 border-[#DC2626]/20 text-[#DC2626]';
        case 'NO_SHOW':
          return 'bg-[#9CA3AF]/10 border-[#9CA3AF]/20 text-[#9CA3AF]';
        case 'RESCHEDULED':
          return 'bg-[#8B5CF6]/10 border-[#8B5CF6]/20 text-[#8B5CF6]';
        default:
          return 'bg-gray-100 border-gray-200 text-gray-600';
      }
    };

    // Get Vietnamese status label
    const getStatusLabel = (status: string) => {
      switch (status) {
        case 'CONFIRMED': return 'Đã xác nhận';
        case 'PENDING': return 'Chờ xác nhận';
        case 'COMPLETED': return 'Hoàn thành';
        case 'CANCELED': return 'Đã hủy';
        case 'REJECTED': return 'Từ chối';
        case 'NO_SHOW': return 'Không đến';
        case 'RESCHEDULED': return 'Dời lịch';
        default: return status;
      }
    };

    const currentDayKey = getCurrentDayKey();
    const weekDates = getWeekDates();

    // Removed debug logs
    return <div className="p-6 space-y-6">
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
                  return <div key={day.key} className="text-center">
                        <div className={`py-3 px-3 rounded-lg transition-all cursor-pointer
                          ${isToday ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-200' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'}`}>
                          <div className="text-sm font-medium">{day.fullName}</div>
                          <div className="text-xs mt-1 opacity-80">
                            {date.getDate().toString().padStart(2, '0')}/{(date.getMonth() + 1).toString().padStart(2, '0')}/{date.getFullYear()}
                          </div>
                        </div>
                      </div>;
                })}
                </div>
                
                {/* Time slots grid */}
                {timeSlots.map(time => <div key={time} className="grid grid-cols-8 gap-4 mb-2">
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
                              title={`Bệnh nhân: ${appointment.patientName}\nTrạng thái: ${getStatusLabel(appointment.status)}\nGhi chú: ${appointment.note || 'Không có'}\nNgày: ${appointment.date}\nGiờ: ${appointment.timeSlot?.startTime} - ${appointment.timeSlot?.endTime}`}
                            >
                              {/* Removed status indicator dot */}

                              <p className="font-medium truncate pr-3">{appointment.patientName}</p>
                              <p className="text-[#334155] text-[10px] truncate mt-1">
                                {appointment.note || 'Khám tổng quát'}
                              </p>
                              <p className="text-[10px] opacity-70 mt-1 font-medium">
                                {getStatusLabel(appointment.status)}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>)}
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
      </div>;
  };

  // @return
  return <div className="h-full bg-[#F6F7FB]">
      {activeView === 'appointments' && renderAppointments()}
      {activeView === 'consultation' && renderConsultation()}
      {activeView === 'schedule' && renderSchedule()}
      
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
    </div>;
};