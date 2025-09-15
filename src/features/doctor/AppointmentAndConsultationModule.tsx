import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Video, User, Phone, MessageSquare, FileText, Check, X, RotateCcw, ChevronLeft, ChevronRight, Plus, Send, Download, Mic, MicOff, VideoIcon, VideoOff, Search, Filter, CalendarDays, Repeat, Stethoscope, History, Brain, Activity, AlertTriangle, TrendingUp, TrendingDown, Minus, Eye, Save, UserCheck, Pill, ClipboardList, Heart, Thermometer, Weight, Zap } from 'lucide-react';
import DoctorScheduleRegistrationModal from './DoctorScheduleRegistrationModal';
const appointmentData = [{
  id: 1,
  patient: 'Nguyễn Văn An',
  time: '09:00',
  date: '2024-01-16',
  service: 'Tư vấn CKD giai đoạn 3',
  status: 'confirmed',
  type: 'online',
  hasAIPrediction: true,
  patientId: 'patient-001'
}, {
  id: 2,
  patient: 'Trần Thị Bình',
  time: '10:30',
  date: '2024-01-16',
  service: 'Theo dõi định kỳ',
  status: 'confirmed',
  type: 'offline',
  hasAIPrediction: false,
  patientId: 'patient-002'
}, {
  id: 3,
  patient: 'Lê Minh Cường',
  time: '14:00',
  date: '2024-01-16',
  service: 'Tư vấn điều trị',
  status: 'confirmed',
  type: 'online',
  hasAIPrediction: true,
  patientId: 'patient-003'
}] as any[];
const pastAppointments = [{
  id: 5,
  patient: 'Hoàng Văn Em',
  time: '09:00',
  date: '2024-01-15',
  service: 'Tư vấn CKD',
  status: 'completed',
  type: 'online',
  hasAIPrediction: true,
  patientId: 'patient-005'
}, {
  id: 6,
  patient: 'Vũ Thị Phương',
  time: '11:00',
  date: '2024-01-15',
  service: 'Theo dõi',
  status: 'completed',
  type: 'offline',
  hasAIPrediction: false,
  patientId: 'patient-006'
}] as any[];

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
  activeView: string;
}

// @component: AppointmentAndConsultationModule
export const AppointmentAndConsultationModule = ({
  activeView
}: AppointmentAndConsultationModuleProps) => {
  const [appointmentTab, setAppointmentTab] = useState('upcoming');
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [consultationTab, setConsultationTab] = useState('profile');
  const [chatMessage, setChatMessage] = useState('');
  const [prescription, setPrescription] = useState('');
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);

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
  const [vitalSigns, setVitalSigns] = useState({
    bloodPressure: '',
    heartRate: '',
    weight: '',
    temperature: ''
  });
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [diagnosisNotes, setDiagnosisNotes] = useState('');
  const [prescriptionRows, setPrescriptionRows] = useState([{
    drug: '',
    dosage: '',
    quantity: '',
    usage: '',
    notes: ''
  }]);
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
      alert('Đã lưu và gửi đơn thuốc cho bệnh nhân');
      setPrescription('');
    }
  };
  const handleSaveSchedule = () => {
    if (scheduleForm.date && scheduleForm.time) {
      alert('Đã đăng ký lịch làm việc thành công');
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
    console.log('Saving schedule data:', data);
    alert('Đã đăng ký lịch làm việc thành công!');
    // Here you would typically save to your backend
  };
  const openPatientExamination = (patientId: string, appointment: any) => {
    const patient = patientData[patientId as keyof typeof patientData];
    if (patient) {
      setSelectedPatient({
        ...patient,
        appointment
      });
      setShowExaminationModal(true);
      setExaminationTab('ai-result');
    }
  };
  const viewPatientHistory = (patientId: string) => {
    const patient = patientData[patientId as keyof typeof patientData];
    if (patient) {
      setSelectedPatient(patient);
      setShowExaminationModal(true);
      setExaminationTab('history');
    }
  };
  const addPrescriptionRow = () => {
    setPrescriptionRows([...prescriptionRows, {
      drug: '',
      dosage: '',
      quantity: '',
      usage: '',
      notes: ''
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
  const handleCompleteExamination = () => {
    alert('Đã hoàn thành khám bệnh và lưu hồ sơ');
    setShowExaminationModal(false);
    // Reset form data
    setVitalSigns({
      bloodPressure: '',
      heartRate: '',
      weight: '',
      temperature: ''
    });
    setSymptoms('');
    setDiagnosis('');
    setDiagnosisNotes('');
    setPrescriptionRows([{
      drug: '',
      dosage: '',
      quantity: '',
      usage: '',
      notes: ''
    }]);
    setFollowUpDate('');
  };
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
              label: '🤖 Kết quả AI',
              icon: Brain
            }, {
              id: 'history',
              label: '📋 Lịch sử khám',
              icon: History
            }, {
              id: 'examination',
              label: '🩺 Khám bệnh',
              icon: Stethoscope
            }, {
              id: 'prescription',
              label: '💊 Kê đơn thuốc',
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
                {examinationTab === 'ai-result' && selectedPatient.aiPrediction && <div className="space-y-6">
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
                  </div>}

                {/* Medical History Tab */}
                {examinationTab === 'history' && <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-[#0F172A] flex items-center gap-2">
                      <History className="w-5 h-5 text-[#1E75FF]" />
                      <span>Lịch sử khám bệnh</span>
                    </h4>
                    <div className="space-y-4">
                      {selectedPatient.medicalHistory?.map((record: any, index: number) => <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6">
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
                        </div>)}
                    </div>
                  </div>}

                {/* Examination Tab */}
                {examinationTab === 'examination' && <div className="space-y-6">
                    {/* Vital Signs */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                      <h4 className="text-lg font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-[#1E75FF]" />
                        <span>Sinh hiệu</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[#334155] mb-2">
                            Huyết áp (mmHg)
                          </label>
                          <input type="text" placeholder="120/80" value={vitalSigns.bloodPressure} onChange={e => setVitalSigns({
                        ...vitalSigns,
                        bloodPressure: e.target.value
                      })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#334155] mb-2">
                            Nhịp tim (bpm)
                          </label>
                          <input type="number" placeholder="72" value={vitalSigns.heartRate} onChange={e => setVitalSigns({
                        ...vitalSigns,
                        heartRate: e.target.value
                      })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#334155] mb-2">
                            Cân nặng (kg)
                          </label>
                          <input type="number" placeholder="70" value={vitalSigns.weight} onChange={e => setVitalSigns({
                        ...vitalSigns,
                        weight: e.target.value
                      })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#334155] mb-2">
                            Nhiệt độ (°C)
                          </label>
                          <input type="number" step="0.1" placeholder="36.5" value={vitalSigns.temperature} onChange={e => setVitalSigns({
                        ...vitalSigns,
                        temperature: e.target.value
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
                        <div>
                          <label className="block text-sm font-medium text-[#334155] mb-2">
                            Chẩn đoán phụ và ghi chú
                          </label>
                          <textarea placeholder="Chẩn đoán phụ và ghi chú..." rows={3} value={diagnosisNotes} onChange={e => setDiagnosisNotes(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent resize-none" />
                        </div>
                      </div>
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
                                    <option value="1 viên/ngày">1 viên/ngày</option>
                                    <option value="2 viên/ngày">2 viên/ngày</option>
                                    <option value="1 viên/12h">1 viên/12h</option>
                                    <option value="Theo chỉ định">Theo chỉ định</option>
                                  </select>
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
            <button onClick={() => alert('Đã lưu nháp khám bệnh')} className="px-6 py-3 bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-xl font-medium flex items-center gap-2 transition-colors">
              <Save size={16} />
              <span>Lưu nháp</span>
            </button>
            <button onClick={handleCompleteExamination} className="px-6 py-3 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl font-medium flex items-center gap-2 transition-colors">
              <UserCheck size={16} />
              <span>Hoàn thành khám</span>
            </button>
          </div>
        </motion.div>
      </div>;
  };
  const renderAppointments = () => {
    const currentAppointments = appointmentTab === 'upcoming' ? appointmentData : appointmentTab === 'past' ? pastAppointments : appointmentData.filter(apt => apt.status === 'cancelled');
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
              id: 'past',
              label: 'Đã qua'
            }, {
              id: 'cancelled',
              label: 'Đã hủy'
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
            {filteredAppointments.length === 0 ? <div className="text-center py-12">
                <Calendar size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-[#334155] mb-4">Chưa có lịch hẹn nào trong mục này</p>
                <button onClick={() => setShowScheduleModal(true)} className="bg-[#1E75FF] hover:bg-[#1659C9] text-white px-6 py-3 rounded-2xl font-medium flex items-center gap-2 transition-colors">
                  <Plus size={20} />
                  <span>Đăng ký lịch làm việc</span>
                </button>
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

                    {appointmentTab === 'past' && appointment.status === 'completed' && <button onClick={() => viewPatientHistory(appointment.patientId)} className="w-full bg-[#1E75FF] hover:bg-[#1659C9] text-white py-2 px-3 rounded-xl text-sm font-medium flex items-center justify-center gap-1 transition-colors">
                        <Eye size={16} />
                        <span>Xem kết quả khám</span>
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
    // Updated week days order: Monday to Sunday (T2 → CN)
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

    // Updated time slots to match the registration form exactly
    const timeSlots = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];

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
      // Set to Monday (day 1)
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      return weekDays.map((_, index) => {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + index);
        return date;
      });
    };
    const currentDayKey = getCurrentDayKey();
    const weekDates = getWeekDates();
    return <div className="p-6 space-y-6">
        {/* Remove duplicate title - header already shows "Lịch làm việc" */}
        
        <div className="bg-white rounded-2xl shadow-[0_10px_24px_rgba(16,24,40,0.08)]">
          {/* Clean header - only show "Lịch làm việc" */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                
                {/* Simplified view - only show "Tuần" */}
                <span className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                  Tuần
                </span>
                
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              
              {/* Move register button to right side */}
              <button onClick={() => setShowScheduleModal(true)} className="bg-[#1E75FF] hover:bg-[#1659C9] text-white px-6 py-3 rounded-2xl font-medium flex items-center gap-2 transition-colors">
                <Plus size={20} />
                <span>Đăng ký lịch làm việc</span>
              </button>
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
                    {weekDays.map((day, dayIndex) => <div key={`${time}-${day.key}`} className="p-2 border border-gray-100 rounded-lg min-h-[60px] hover:bg-gray-50 transition-colors">
                        {dayIndex === 0 && time === '09:00' && <div className="bg-[#1E75FF]/10 border border-[#1E75FF]/20 rounded-lg p-2 text-xs">
                            <p className="font-medium text-[#1E75FF]">Nguyễn Văn An</p>
                            <p className="text-[#334155]">Tư vấn CKD</p>
                          </div>}
                        {dayIndex === 2 && time === '14:00' && <div className="bg-[#10B981]/10 border border-[#10B981]/20 rounded-lg p-2 text-xs">
                            <p className="font-medium text-[#10B981]">Trần Thị Bình</p>
                            <p className="text-[#334155]">Theo dõi</p>
                          </div>}
                      </div>)}
                  </div>)}
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Registration Modal - Use the new advanced modal */}
        <DoctorScheduleRegistrationModal isOpen={showScheduleModal} onClose={() => setShowScheduleModal(false)} onSave={handleSaveScheduleFromModal} existingSchedules={[]} // Pass existing schedules for conflict detection
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
    </div>;
};