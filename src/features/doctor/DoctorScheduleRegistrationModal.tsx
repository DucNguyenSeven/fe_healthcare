"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, ChevronLeft, ChevronRight, Check, Save, RotateCcw, AlertTriangle, Sun, Sunrise, Sunset, BookOpen, History, Star, Zap, Users, Timer } from 'lucide-react';

// Types and interfaces
interface TimeSlot {
  id: string;
  time: string;
  selected: boolean;
  available: boolean;
  conflicted?: boolean;
}
interface ScheduleTemplate {
  id: string;
  name: string;
  description: string;
  timeSlots: string[];
  type: 'available' | 'blocked';
  recurring: {
    enabled: boolean;
    pattern: 'weekly' | 'biweekly' | 'monthly';
    endDate?: string;
  };
  usage: number; // How many times used
  lastUsed: string; // Last used date
  patientCount: number; // Average patients per session
}
interface ScheduleFormData {
  date: string;
  timeSlots: string[];
  type: 'available' | 'blocked';
  recurring: boolean; // NEW: Weekly recurring option
  recurringEndDate?: string; // NEW: End date for recurring
  recurringType: 'indefinite' | 'endDate'; // NEW: 'indefinite' | 'endDate'
  note: string;
  template?: string;
  recurringDates?: string[]; // NEW: Generated recurring dates
}
interface DoctorScheduleRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ScheduleFormData) => void;
  existingSchedules?: any[];
}

// Sample data
const timeSlotData: TimeSlot[] = [{
  id: '08:00',
  time: '08:00',
  selected: false,
  available: true
}, {
  id: '08:30',
  time: '08:30',
  selected: false,
  available: true
}, {
  id: '09:00',
  time: '09:00',
  selected: false,
  available: true
}, {
  id: '09:30',
  time: '09:30',
  selected: false,
  available: true
}, {
  id: '10:00',
  time: '10:00',
  selected: false,
  available: true
}, {
  id: '10:30',
  time: '10:30',
  selected: false,
  available: true
}, {
  id: '11:00',
  time: '11:00',
  selected: false,
  available: true
}, {
  id: '11:30',
  time: '11:30',
  selected: false,
  available: true
}, {
  id: '14:00',
  time: '14:00',
  selected: false,
  available: true
}, {
  id: '14:30',
  time: '14:30',
  selected: false,
  available: true
}, {
  id: '15:00',
  time: '15:00',
  selected: false,
  available: true
}, {
  id: '15:30',
  time: '15:30',
  selected: false,
  available: true
}, {
  id: '16:00',
  time: '16:00',
  selected: false,
  available: true
}, {
  id: '16:30',
  time: '16:30',
  selected: false,
  available: true
}, {
  id: '17:00',
  time: '17:00',
  selected: false,
  available: true
}, {
  id: '17:30',
  time: '17:30',
  selected: false,
  available: true
}];

// Updated schedule templates with more realistic data
const scheduleTemplates: ScheduleTemplate[] = [{
  id: 'morning-intensive',
  name: 'Ca sáng tăng cường',
  description: 'Lịch sáng với 15 phút/bệnh nhân, phù hợp cho khám chi tiết',
  timeSlots: ['08:00', '08:15', '08:30', '08:45', '09:00', '09:15', '09:30', '09:45', '10:00', '10:15', '10:30', '10:45'],
  type: 'available',
  recurring: {
    enabled: true,
    pattern: 'weekly'
  },
  usage: 24,
  lastUsed: '2024-01-10',
  patientCount: 12
}, {
  id: 'afternoon-standard',
  name: 'Ca chiều tiêu chuẩn',
  description: 'Lịch chiều với 30 phút/bệnh nhân, thích hợp cho tư vấn',
  timeSlots: ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'],
  type: 'available',
  recurring: {
    enabled: true,
    pattern: 'weekly'
  },
  usage: 18,
  lastUsed: '2024-01-08',
  patientCount: 8
}, {
  id: 'weekend-special',
  name: 'Cuối tuần đặc biệt',
  description: 'Lịch cuối tuần với thời gian linh hoạt cho bệnh nhân khó khăn',
  timeSlots: ['09:00', '09:45', '10:30', '11:15', '14:00', '14:45', '15:30', '16:15'],
  type: 'available',
  recurring: {
    enabled: false,
    pattern: 'weekly'
  },
  usage: 6,
  lastUsed: '2024-01-06',
  patientCount: 8
}, {
  id: 'emergency-block',
  name: 'Chặn khẩn cấp',
  description: 'Chặn thời gian cho các trường hợp khẩn cấp hoặc nghỉ phép',
  timeSlots: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'],
  type: 'blocked',
  recurring: {
    enabled: false,
    pattern: 'weekly'
  },
  usage: 3,
  lastUsed: '2024-01-05',
  patientCount: 0
}];
export default function DoctorScheduleRegistrationModal({
  isOpen,
  onClose,
  onSave,
  existingSchedules = []
}: DoctorScheduleRegistrationModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(timeSlotData);
  const [selectedDate, setSelectedDate] = useState('');
  const [dragStart, setDragStart] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [formData, setFormData] = useState<ScheduleFormData>({
    date: '',
    timeSlots: [],
    type: 'available',
    recurring: false,
    // NEW: Weekly recurring option
    recurringEndDate: '',
    // NEW: End date for recurring
    recurringType: 'indefinite',
    // NEW: 'indefinite' | 'endDate'
    note: '',
    template: ''
  });
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [showConflictWarning, setShowConflictWarning] = useState(false);

  // Helper function for recurring date calculation
  const generateRecurringDates = (startDate: string, endDate?: string, recurring: boolean = false) => {
    if (!recurring) return [startDate];
    const dates = [startDate];
    let currentDate = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 3 months default

    while (currentDate < end) {
      currentDate.setDate(currentDate.getDate() + 7);
      if (currentDate <= end) {
        dates.push(currentDate.toISOString().split('T')[0]);
      }
    }
    return dates;
  };

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setTimeSlots(timeSlotData);
      setFormData({
        date: '',
        timeSlots: [],
        type: 'available',
        recurring: false,
        recurringEndDate: undefined,
        recurringType: 'indefinite',
        note: '',
        template: ''
      });
      setConflicts([]);
      setShowConflictWarning(false);
    }
  }, [isOpen]);

  // Check for conflicts when date or time slots change
  useEffect(() => {
    if (formData.date && formData.timeSlots.length > 0) {
      const conflictingSlots = formData.timeSlots.filter(slot => existingSchedules.some(schedule => schedule.date === formData.date && schedule.timeSlots.includes(slot)));
      setConflicts(conflictingSlots);
      setShowConflictWarning(conflictingSlots.length > 0);
    }
  }, [formData.date, formData.timeSlots, existingSchedules]);
  const steps = [{
    id: 1,
    title: 'Chọn ngày & giờ',
    icon: Calendar
  }, {
    id: 2,
    title: 'Xác nhận',
    icon: Check
  }];
  const handleTimeSlotClick = (slotId: string) => {
    setTimeSlots(prev => prev.map(slot => slot.id === slotId ? {
      ...slot,
      selected: !slot.selected
    } : slot));
    setFormData(prev => ({
      ...prev,
      timeSlots: timeSlots.map(slot => slot.id === slotId ? {
        ...slot,
        selected: !slot.selected
      } : slot).filter(slot => slot.selected).map(slot => slot.id)
    }));
  };
  const handleDragStart = (slotId: string) => {
    setDragStart(slotId);
    setIsDragging(true);
  };
  const handleDragOver = (slotId: string) => {
    if (!isDragging || !dragStart) return;
    const startIndex = timeSlots.findIndex(slot => slot.id === dragStart);
    const endIndex = timeSlots.findIndex(slot => slot.id === slotId);
    if (startIndex === -1 || endIndex === -1) return;
    const start = Math.min(startIndex, endIndex);
    const end = Math.max(startIndex, endIndex);
    setTimeSlots(prev => prev.map((slot, index) => ({
      ...slot,
      selected: index >= start && index <= end
    })));
  };
  const handleDragEnd = () => {
    setIsDragging(false);
    setDragStart(null);
    setFormData(prev => ({
      ...prev,
      timeSlots: timeSlots.filter(slot => slot.selected).map(slot => slot.id)
    }));
  };
  const applyTemplate = (templateId: string) => {
    const template = scheduleTemplates.find(t => t.id === templateId);
    if (!template) return;
    setTimeSlots(prev => prev.map(slot => ({
      ...slot,
      selected: template.timeSlots.includes(slot.id)
    })));
    setFormData(prev => ({
      ...prev,
      timeSlots: template.timeSlots,
      type: template.type,
      recurring: template.recurring.enabled,
      recurringType: 'indefinite',
      template: templateId
    }));
  };
  const getQuickPresetSlots = (preset: string) => {
    switch (preset) {
      case 'morning':
        return ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];
      case 'afternoon':
        return ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];
      case 'full-day':
        return ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];
      default:
        return [];
    }
  };
  const applyQuickPreset = (preset: string) => {
    const slots = getQuickPresetSlots(preset);
    setTimeSlots(prev => prev.map(slot => ({
      ...slot,
      selected: slots.includes(slot.id)
    })));
    setFormData(prev => ({
      ...prev,
      timeSlots: slots,
      type: 'available' // Quick presets are always available
    }));
  };
  const clearAllSlots = () => {
    setTimeSlots(prev => prev.map(slot => ({
      ...slot,
      selected: false
    })));
    setFormData(prev => ({
      ...prev,
      timeSlots: []
    }));
  };
  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  const handleSave = () => {
    const finalData = {
      ...formData,
      date: selectedDate,
      timeSlots: timeSlots.filter(slot => slot.selected).map(slot => slot.id),
      recurringDates: generateRecurringDates(selectedDate, formData.recurringType === 'endDate' ? formData.recurringEndDate : undefined, formData.recurring)
    };
    onSave(finalData);
    onClose();
  };
  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return selectedDate && formData.timeSlots.length > 0;
      case 2:
        return true;
      default:
        return false;
    }
  };
  if (!isOpen) return null;
  return <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div initial={{
      opacity: 0,
      scale: 0.95,
      y: 20
    }} animate={{
      opacity: 1,
      scale: 1,
      y: 0
    }} exit={{
      opacity: 0,
      scale: 0.95,
      y: 20
    }} transition={{
      duration: 0.3,
      ease: "easeOut"
    }} className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-[#1E75FF]/5 to-[#10B981]/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[#1E75FF] to-[#10B981] rounded-2xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#0F172A]">Đăng ký lịch làm việc</h2>
                <p className="text-[#334155] mt-1" style={{
                display: "none"
              }}>Tạo lịch làm việc mới cho bệnh nhân đặt hẹn</p>
              </div>
            </div>
            <button onClick={onClose} className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-2xl flex items-center justify-center transition-colors group">
              <X size={20} className="text-[#334155] group-hover:text-[#0F172A]" />
            </button>
          </div>

          {/* Step Navigation */}
          <div className="flex items-center justify-center mt-8">
            <div className="flex items-center gap-4">
              {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              return <div key={step.id} className="flex items-center">
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300
                        ${isActive ? 'bg-[#1E75FF] text-white shadow-lg shadow-[#1E75FF]/25' : isCompleted ? 'bg-[#10B981] text-white' : 'bg-gray-100 text-[#334155]'}
                      `}>
                        {isCompleted ? <Check size={20} /> : <Icon size={20} />}
                      </div>
                      <div className="hidden md:block">
                        <p className={`font-medium ${isActive ? 'text-[#1E75FF]' : isCompleted ? 'text-[#10B981]' : 'text-[#334155]'}`}>
                          Bước {step.id}
                        </p>
                        <p className="text-sm text-[#334155]">{step.title}</p>
                      </div>
                    </div>
                    {index < steps.length - 1 && <div className={`
                        w-16 h-0.5 mx-4 transition-colors duration-300
                        ${currentStep > step.id ? 'bg-[#10B981]' : 'bg-gray-200'}
                      `} />}
                  </div>;
            })}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div key={currentStep} initial={{
            opacity: 0,
            x: 20
          }} animate={{
            opacity: 1,
            x: 0
          }} exit={{
            opacity: 0,
            x: -20
          }} transition={{
            duration: 0.3
          }} className="p-8">
              {/* Step 1: Date & Time Selection */}
              {currentStep === 1 && <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-[#0F172A] mb-2">Chọn ngày và khung giờ làm việc</h3>
                    <p className="text-[#334155] mb-6" style={{
                  display: "none"
                }}>Chọn ngày và khung giờ bạn muốn đăng ký lịch làm việc</p>
                    
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                      {/* Date Selection */}
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <label className="block text-sm font-medium text-[#334155]">
                            Ngày làm việc *
                          </label>
                          <input type="date" value={selectedDate} onChange={e => {
                        setSelectedDate(e.target.value);
                        setFormData(prev => ({
                          ...prev,
                          date: e.target.value
                        }));
                      }} min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent text-lg" />
                        </div>

                        {/* Quick Presets */}
                        <div className="space-y-3">
                          <label className="block text-sm font-medium text-[#334155]">
                            <Zap size={16} className="inline mr-2 text-[#F59E0B]" />
                            Chọn nhanh theo buổi
                          </label>
                          <p className="text-xs text-[#334155] mb-3">Chọn nhanh khung giờ cơ bản theo buổi làm việc</p>
                          <div className="grid grid-cols-1 gap-3">
                            <button onClick={() => applyQuickPreset('morning')} className="flex items-center gap-3 p-4 border border-gray-200 rounded-2xl hover:border-[#F59E0B] hover:bg-[#F59E0B]/5 transition-all group">
                              <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-xl flex items-center justify-center">
                                <Sunrise size={20} className="text-white" />
                              </div>
                              <div className="text-left">
                                <p className="font-medium text-[#0F172A] group-hover:text-[#F59E0B]">Buổi sáng</p>
                                <p className="text-sm text-[#334155]">8:00 - 12:00 (8 khung giờ)</p>
                              </div>
                            </button>
                            
                            <button onClick={() => applyQuickPreset('afternoon')} className="flex items-center gap-3 p-4 border border-gray-200 rounded-2xl hover:border-[#F59E0B] hover:bg-[#F59E0B]/5 transition-all group">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl flex items-center justify-center">
                                <Sunset size={20} className="text-white" />
                              </div>
                              <div className="text-left">
                                <p className="font-medium text-[#0F172A] group-hover:text-[#F59E0B]">Buổi chiều</p>
                                <p className="text-sm text-[#334155]">14:00 - 18:00 (8 khung giờ)</p>
                              </div>
                            </button>
                            
                            <button onClick={() => applyQuickPreset('full-day')} className="flex items-center gap-3 p-4 border border-gray-200 rounded-2xl hover:border-[#F59E0B] hover:bg-[#F59E0B]/5 transition-all group">
                              <div className="w-10 h-10 bg-gradient-to-r from-[#F59E0B] to-[#D97706] rounded-xl flex items-center justify-center">
                                <Sun size={20} className="text-white" />
                              </div>
                              <div className="text-left">
                                <p className="font-medium text-[#0F172A] group-hover:text-[#F59E0B]">Cả ngày</p>
                                <p className="text-sm text-[#334155]">8:00 - 18:00 (16 khung giờ)</p>
                              </div>
                            </button>
                          </div>
                        </div>

                        {/* Template Selection */}
                        <div className="space-y-3" style={{
                      display: "none"
                    }}>
                          <label className="block text-sm font-medium text-[#334155]">
                            <BookOpen size={16} className="inline mr-2 text-[#1E75FF]" />
                            Mẫu lịch từ lịch sử
                          </label>
                          <p className="text-xs text-[#334155] mb-3">Sử dụng lại các mẫu lịch đã tạo trước đây với cấu hình chi tiết</p>
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {scheduleTemplates.map(template => <button key={template.id} onClick={() => applyTemplate(template.id)} className="w-full flex items-start gap-3 p-4 border border-gray-200 rounded-xl hover:border-[#1E75FF] hover:bg-[#1E75FF]/5 transition-all text-left group">
                                <div className="flex-shrink-0">
                                  {template.type === 'available' ? <div className="w-8 h-8 bg-[#10B981]/10 rounded-lg flex items-center justify-center">
                                      <Check size={14} className="text-[#10B981]" />
                                    </div> : <div className="w-8 h-8 bg-[#EF4444]/10 rounded-lg flex items-center justify-center">
                                      <X size={14} className="text-[#EF4444]" />
                                    </div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-medium text-[#0F172A] group-hover:text-[#1E75FF] truncate">{template.name}</p>
                                    {template.usage > 10 && <Star size={12} className="text-[#F59E0B] flex-shrink-0" />}
                                  </div>
                                  <p className="text-xs text-[#334155] mb-2 line-clamp-2">{template.description}</p>
                                  <div className="flex items-center gap-4 text-xs text-[#334155]">
                                    <span className="flex items-center gap-1">
                                      <History size={10} />
                                      <span>Dùng {template.usage} lần</span>
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Users size={10} />
                                      <span>{template.patientCount} BN</span>
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Timer size={10} />
                                      <span>{template.timeSlots.length} slot</span>
                                    </span>
                                  </div>
                                </div>
                              </button>)}
                          </div>
                        </div>
                      </div>

                      {/* Time Slots Grid */}
                      <div className="xl:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="block text-sm font-medium text-[#334155]">
                            Khung giờ làm việc *
                          </label>
                          <button onClick={clearAllSlots} className="text-sm text-[#EF4444] hover:text-[#DC2626] font-medium flex items-center gap-1">
                            <RotateCcw size={14} />
                            <span>Xóa tất cả</span>
                          </button>
                        </div>
                        
                        <div className="bg-gray-50 rounded-2xl p-6">
                          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                            {timeSlots.map(slot => <motion.button key={slot.id} onClick={() => handleTimeSlotClick(slot.id)} onMouseDown={() => handleDragStart(slot.id)} onMouseEnter={() => handleDragOver(slot.id)} onMouseUp={handleDragEnd} whileHover={{
                          scale: 1.05
                        }} whileTap={{
                          scale: 0.95
                        }} className={`
                                  relative p-3 rounded-xl font-medium text-sm transition-all duration-200 select-none
                                  ${slot.selected ? 'bg-[#1E75FF] text-white shadow-lg shadow-[#1E75FF]/25' : slot.available ? 'bg-white border border-gray-200 text-[#334155] hover:border-[#1E75FF] hover:bg-[#1E75FF]/5' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                                  ${slot.conflicted ? 'border-[#EF4444] bg-[#EF4444]/5' : ''}
                                `} disabled={!slot.available}>
                                {slot.time}
                                {slot.selected && <motion.div initial={{
                            scale: 0
                          }} animate={{
                            scale: 1
                          }} className="absolute -top-1 -right-1 w-5 h-5 bg-[#10B981] rounded-full flex items-center justify-center">
                                    <Check size={12} className="text-white" />
                                  </motion.div>}
                                {slot.conflicted && <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#EF4444] rounded-full flex items-center justify-center">
                                    <AlertTriangle size={10} className="text-white" />
                                  </div>}
                              </motion.button>)}
                          </div>
                          
                          <div className="mt-6 text-center">
                            <p className="text-sm text-[#334155]">
                              Đã chọn: <span className="font-medium text-[#1E75FF]">{timeSlots.filter(slot => slot.selected).length}</span> khung giờ
                            </p>
                            <p className="text-xs text-[#334155] mt-1">
                              Kéo chuột để chọn nhiều khung giờ liên tiếp
                            </p>
                          </div>
                        </div>

                        {/* Conflict Warning */}
                        {showConflictWarning && <motion.div initial={{
                      opacity: 0,
                      y: -10
                    }} animate={{
                      opacity: 1,
                      y: 0
                    }} className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-2xl p-4">
                            <div className="flex items-start gap-3">
                              <AlertTriangle size={20} className="text-[#EF4444] mt-0.5" />
                              <div>
                                <p className="font-medium text-[#EF4444]">Phát hiện xung đột lịch</p>
                                <p className="text-sm text-[#334155] mt-1">
                                  Các khung giờ sau đã có lịch hẹn: {conflicts.join(', ')}
                                </p>
                              </div>
                            </div>
                          </motion.div>}

                        {/* Weekly Recurring Option */}
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                          <label className="flex items-center space-x-3">
                            <input type="checkbox" checked={formData.recurring} onChange={e => setFormData(prev => ({
                          ...prev,
                          recurring: e.target.checked
                        }))} className="w-4 h-4 text-blue-600 border-gray-300 rounded 
                                         focus:ring-blue-500 focus:ring-2" />
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-900">
                                Lặp lại hàng tuần
                              </span>
                              <p className="text-xs text-gray-600 mt-1">
                                Áp dụng lịch này cho tất cả các tuần tiếp theo
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-xs text-blue-600 font-medium">
                                🔄 Weekly
                              </span>
                            </div>
                          </label>
                          
                          {formData.recurring && <motion.div initial={{
                        opacity: 0,
                        height: 0
                      }} animate={{
                        opacity: 1,
                        height: 'auto'
                      }} className="mt-3 pl-7 space-y-2">
                              <div className="text-xs text-gray-600">
                                <strong>Áp dụng cho:</strong> Các tuần từ {selectedDate} trở đi
                              </div>
                              <div className="flex items-center space-x-4">
                                <label className="text-xs">
                                  <input type="radio" name="recurringEnd" value="indefinite" checked={formData.recurringType === 'indefinite'} onChange={e => setFormData(prev => ({
                              ...prev,
                              recurringType: 'indefinite'
                            }))} className="mr-1" />
                                  Không giới hạn
                                </label>
                                <label className="text-xs flex items-center">
                                  <input type="radio" name="recurringEnd" value="endDate" checked={formData.recurringType === 'endDate'} onChange={e => setFormData(prev => ({
                              ...prev,
                              recurringType: 'endDate'
                            }))} className="mr-1" />
                                  Đến ngày: 
                                  <input type="date" value={formData.recurringEndDate || ''} onChange={e => setFormData(prev => ({
                              ...prev,
                              recurringEndDate: e.target.value
                            }))} min={selectedDate} disabled={formData.recurringType !== 'endDate'} className="ml-1 text-xs border rounded px-1 py-0.5 disabled:bg-gray-100" />
                                </label>
                              </div>
                            </motion.div>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>}

              {/* Step 2: Confirmation */}
              {currentStep === 2 && <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-[#0F172A] mb-2">Xác nhận thông tin</h3>
                    <p className="text-[#334155] mb-6">Kiểm tra lại thông tin trước khi lưu lịch làm việc</p>
                  </div>

                  <div className="bg-gradient-to-r from-[#1E75FF]/5 to-[#10B981]/5 rounded-3xl p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Summary Card */}
                      <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <h4 className="text-lg font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
                          <Calendar size={20} className="text-[#1E75FF]" />
                          <span>Thông tin lịch làm việc</span>
                        </h4>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between py-3 border-b border-gray-100">
                            <span className="text-[#334155]">Ngày làm việc:</span>
                            <span className="font-medium text-[#0F172A]">
                              {new Date(selectedDate).toLocaleDateString('vi-VN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between py-3 border-b border-gray-100">
                            <span className="text-[#334155]">Số khung giờ:</span>
                            <span className="font-medium text-[#1E75FF]">
                              {timeSlots.filter(slot => slot.selected).length} khung giờ
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between py-3 border-b border-gray-100">
                            <span className="text-[#334155]">Loại lịch:</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${formData.type === 'available' ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#EF4444]/10 text-[#EF4444]'}`}>
                              {formData.type === 'available' ? 'Có thể đặt hẹn' : 'Không có mặt'}
                            </span>
                          </div>
                          
                          {formData.recurring && <div className="flex items-center justify-between py-3 border-b border-gray-100">
                              <span className="text-[#334155]">Lặp lại:</span>
                              <span className="font-medium text-[#0F172A]">
                                Hàng tuần
                                {formData.recurringType === 'endDate' && formData.recurringEndDate && ` đến ${new Date(formData.recurringEndDate).toLocaleDateString('vi-VN')}`}
                                {formData.recurringType === 'indefinite' && ' (không giới hạn)'}
                              </span>
                            </div>}
                        </div>
                      </div>

                      {/* Time Slots Preview */}
                      <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <h4 className="text-lg font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
                          <Clock size={20} className="text-[#10B981]" />
                          <span>Khung giờ đã chọn</span>
                        </h4>
                        
                        <div className="grid grid-cols-4 gap-2">
                          {timeSlots.filter(slot => slot.selected).map(slot => <div key={slot.id} className="bg-[#1E75FF]/10 border border-[#1E75FF]/20 rounded-xl p-3 text-center">
                              <span className="text-sm font-medium text-[#1E75FF]">{slot.time}</span>
                            </div>)}
                        </div>
                        
                        {formData.note && <div className="mt-6">
                            <h5 className="text-sm font-medium text-[#334155] mb-2">Ghi chú:</h5>
                            <p className="text-sm text-[#0F172A] bg-gray-50 rounded-xl p-3">{formData.note}</p>
                          </div>}

                        {/* Recurring Schedule Preview */}
                        {formData.recurring && <div className="mt-6">
                            <h5 className="text-sm font-medium text-[#334155] mb-2">📅 Lịch lặp lại:</h5>
                            <div className="bg-blue-50 rounded-xl p-3">
                              <div className="text-xs text-blue-700 mb-2">
                                <strong>Áp dụng cho {generateRecurringDates(selectedDate, formData.recurringType === 'endDate' ? formData.recurringEndDate : undefined, formData.recurring).length} tuần</strong>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {generateRecurringDates(selectedDate, formData.recurringType === 'endDate' ? formData.recurringEndDate : undefined, formData.recurring).slice(0, 8).map((date, index) => <span key={date} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                    {new Date(date).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit'
                            })}
                                  </span>)}
                                {generateRecurringDates(selectedDate, formData.recurringType === 'endDate' ? formData.recurringEndDate : undefined, formData.recurring).length > 8 && <span className="text-xs text-blue-600">
                                    +{generateRecurringDates(selectedDate, formData.recurringType === 'endDate' ? formData.recurringEndDate : undefined, formData.recurring).length - 8} tuần khác
                                  </span>}
                              </div>
                            </div>
                          </div>}
                      </div>
                    </div>

                    {/* Conflict Warning in Confirmation */}
                    {showConflictWarning && <motion.div initial={{
                  opacity: 0,
                  y: 10
                }} animate={{
                  opacity: 1,
                  y: 0
                }} className="mt-6 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-2xl p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-[#EF4444] rounded-2xl flex items-center justify-center flex-shrink-0">
                            <AlertTriangle size={24} className="text-white" />
                          </div>
                          <div>
                            <h5 className="font-semibold text-[#EF4444] mb-2">Cảnh báo xung đột lịch</h5>
                            <p className="text-[#334155] mb-3">
                              Các khung giờ sau đã có lịch hẹn và sẽ bị ghi đè: <strong>{conflicts.join(', ')}</strong>
                            </p>
                            <p className="text-sm text-[#334155]">
                              Bạn có chắc chắn muốn tiếp tục? Điều này có thể ảnh hưởng đến các lịch hẹn hiện có.
                            </p>
                          </div>
                        </div>
                      </motion.div>}
                  </div>
                </div>}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {currentStep > 1 && <button onClick={handlePrevious} className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-[#334155] rounded-2xl font-medium hover:bg-gray-50 transition-colors">
                  <ChevronLeft size={16} />
                  <span>Quay lại</span>
                </button>}
            </div>

            <div className="flex items-center gap-4">
              <button onClick={onClose} className="px-6 py-3 bg-white border border-gray-200 text-[#334155] rounded-2xl font-medium hover:bg-gray-50 transition-colors">
                Hủy bỏ
              </button>
              
              {currentStep < 2 ? <button onClick={handleNext} disabled={!canProceedToNext()} className="flex items-center gap-2 px-6 py-3 bg-[#1E75FF] hover:bg-[#1659C9] text-white rounded-2xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <span>Tiếp theo</span>
                  <ChevronRight size={16} />
                </button> : <button onClick={handleSave} className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white rounded-2xl font-medium transition-all shadow-lg shadow-[#10B981]/25">
                  <Save size={16} />
                  <span>Lưu lịch làm việc</span>
                </button>}
            </div>
          </div>
        </div>
      </motion.div>
    </div>;
}