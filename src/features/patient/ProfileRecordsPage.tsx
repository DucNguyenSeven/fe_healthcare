"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User as UserIcon, Phone, Mail, MapPin, Calendar, Heart, AlertTriangle, Upload, FileText, Download, Trash2, Edit3, Save, X, Plus, Clock, Shield, Camera, Check, Activity, Pill, CalendarCheck, ClipboardList, Loader2 } from 'lucide-react';
import { useGetMe } from '@/hooks/auth/useGetMe';
import { useCreateHealthMetricPanel } from '@/hooks/health-metrics/useCreatePanel';
import { usePatientHealthPanels } from '@/hooks/health-metrics/usePatientPanels';
import { useUpdateUser } from '@/hooks/auth/useUpdateUser';
import { useUpdateAvatar } from '@/hooks/auth/useUpdateAvatar';
import { useGetMedicalRecords } from '@/hooks/medical-records';
import { getMedicalRecordTimeline } from '@/lib/api/medical-records';
import type { MedicalRecordTimelineResponse } from '@/lib/api/medical-records';
import { MedicalRecordTimeline } from '@/components/medical-records/MedicalRecordTimeline';
import { useSearchParams } from 'next/navigation';
import type { GetMeResponse } from '@/types/auth';
import type { UpdateUserRequest } from '@/lib/api/types';
import type { MedicalRecordWithPrescriptions } from '@/types/medical-record';
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ProfileRecordsPageProps {}
interface MedicalFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  category: 'lab' | 'imaging' | 'prescription' | 'report' | 'other';
}
interface MedicalHistory {
  id: string;
  condition: string;
  diagnosedDate: string;
  status: 'active' | 'resolved' | 'chronic';
  notes?: string;
}
interface Allergy {
  id: string;
  allergen: string;
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe';
}
interface TestResult {
  id: string;
  date: string;
  egfr: string;
  creatinine: string;
  bun: string;
  bloodPressure: string;
}
interface NewTestResult {
  date: string;
  creatinine: string;
  egfr: string;
  bun: string;
  serumCalcium: string;
  ana: string;
  c3c4: string;
  hematuria: string;
  oxalateLevels: string;
  urinePH: string;
}
export function ProfileRecordsPage(_props: ProfileRecordsPageProps = {}) {
  // Get user data from API
  const { data: user, isLoading, error, refetch } = useGetMe();
  
  // Update user hook
  const { updateUser, isLoading: isUpdating, error: updateError } = useUpdateUser();
  
  // Update avatar hook
  const { updateAvatar, isLoading: isUploadingAvatar, error: avatarError, progress } = useUpdateAvatar();

  // Read query params to handle deep linking (e.g., from dashboard "Xem biểu đồ")
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  // Map tab query param to activeTab state
  const getInitialTab = (): 'personal' | 'testHistory' | 'medical' | 'files' => {
    if (tabParam === 'test-results') return 'testHistory';
    if (tabParam === 'medical') return 'medical';
    if (tabParam === 'files') return 'files';
    return 'personal';
  };

  const [activeTab, setActiveTab] = useState<'personal' | 'testHistory' | 'medical' | 'files'>(getInitialTab());

  // Update activeTab when query param changes
  useEffect(() => {
    if (tabParam === 'test-results') {
      setActiveTab('testHistory');
    } else if (tabParam === 'medical') {
      setActiveTab('medical');
    } else if (tabParam === 'files') {
      setActiveTab('files');
    }
  }, [tabParam]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showTestModal, setShowTestModal] = useState(false);
  const [isAddingTest, setIsAddingTest] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showUpdateSuccessNotification, setShowUpdateSuccessNotification] = useState(false);
  const [showUpdateErrorNotification, setShowUpdateErrorNotification] = useState(false);
  const [showAvatarSuccessNotification, setShowAvatarSuccessNotification] = useState(false);
  const [showAvatarErrorNotification, setShowAvatarErrorNotification] = useState(false);
  const [dateError, setDateError] = useState<string>('');
  const { createPanel, isLoading: isCreatingPanel, error: createPanelError } = useCreateHealthMetricPanel();

  // Medical Records - Use API hook instead of mock data
  const {
    records: medicalRecords,
    loading: medicalRecordsLoading,
    error: medicalRecordsError,
    refetch: refetchMedicalRecords
  } = useGetMedicalRecords(user?.userId);

  const [selectedRecord, setSelectedRecord] = useState<MedicalRecordWithPrescriptions | null>(null);
  const [showRecordDetailModal, setShowRecordDetailModal] = useState(false);

  // Timeline state
  const [recordDetailTab, setRecordDetailTab] = useState<'current' | 'timeline'>('current');
  const [recordTimeline, setRecordTimeline] = useState<MedicalRecordTimelineResponse | null>(null);
  const [loadingRecordTimeline, setLoadingRecordTimeline] = useState(false);
  const [recordTimelineError, setRecordTimelineError] = useState<string | null>(null);

  // New test result form data
  const [newTestData, setNewTestData] = useState<NewTestResult>({
    date: '',
    creatinine: '',
    egfr: '',
    bun: '',
    serumCalcium: '',
    ana: '',
    c3c4: '',
    hematuria: '',
    oxalateLevels: '',
    urinePH: ''
  });

  // Form data state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    insuranceType: 'BHYT',
    insuranceNumber: '',
    insuranceExpiry: '',
    height: '',
    weight: '',
    bloodType: '',
    bmi: ''
  });

  // Update form data when user data is loaded
  useEffect(() => {
    if (user) {
      const formatDate = (dateString: string | null) => {
        if (!dateString) return '';
        try {
          const date = new Date(dateString);
          return date.toLocaleDateString('vi-VN');
        } catch {
          return '';
        }
      };

      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: formatDate(user.dob),
        gender: mapGenderFromAPI(user.gender || ''),
        address: user.address || '',
        insuranceType: user.insurance || 'BHYT',
        insuranceNumber: '',
        insuranceExpiry: '',
        height: user.height ? user.height.toString() : '',
        weight: user.weight ? user.weight.toString() : '',
        bloodType: user.bloodType || '',
        bmi: user.bmi ? user.bmi.toString() : ''
      });
      
      // Set avatar if available
      if (user.avatarUrl) {
        setAvatar(user.avatarUrl);
      }
    }
  }, [user]);

  // Health metric panels list
  const { panels, loading: panelsLoading, error: panelsError, refetchPanels } = usePatientHealthPanels(user?.userId);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  useEffect(() => {
    // Map panels to table rows with new fields included later in modal
    if (!panels) return;
    const mapped: TestResult[] = panels.map((p) => {
      const egfr = p.metrics?.gfr?.value;
      const creatinine = p.metrics?.serum_creatinine?.value;
      const bun = p.metrics?.bun?.value;
      return {
        id: p.id,
        date: new Date(p.measuredAt).toLocaleDateString('vi-VN'),
        egfr: egfr !== undefined ? `${egfr} ml/min` : '-',
        creatinine: creatinine !== undefined ? `${creatinine} mg/dL` : '-',
        bun: bun !== undefined ? `${bun} mg/dL` : '-',
        bloodPressure: '-',
      };
    }).sort((a, b) => {
      const dateA = new Date(a.date.split('/').reverse().join('-')).getTime();
      const dateB = new Date(b.date.split('/').reverse().join('-')).getTime();
      return dateB - dateA;
    });
    setTestResults(mapped);
  }, [panels]);

  // Mock data
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory[]>([{
    id: '1',
    condition: 'Bệnh thận mạn tính giai đoạn 3',
    diagnosedDate: '2022-03-15',
    status: 'chronic',
    notes: 'Theo dõi định kỳ, kiểm soát huyết áp'
  }, {
    id: '2',
    condition: 'Tăng huyết áp',
    diagnosedDate: '2021-08-20',
    status: 'active',
    notes: 'Điều trị bằng thuốc ACE inhibitor'
  }, {
    id: '3',
    condition: 'Tiểu đường type 2',
    diagnosedDate: '2020-11-10',
    status: 'active',
    notes: 'Kiểm soát đường huyết bằng Metformin'
  }]);
  const [allergies, setAllergies] = useState<Allergy[]>([{
    id: '1',
    allergen: 'Penicillin',
    reaction: 'Phát ban, ngứa',
    severity: 'moderate'
  }, {
    id: '2',
    allergen: 'Tôm cua',
    reaction: 'Sưng môi, khó thở',
    severity: 'severe'
  }]);
  const [medicalFiles, setMedicalFiles] = useState<MedicalFile[]>([{
    id: '1',
    name: 'Kết quả xét nghiệm máu 15-01-2024.pdf',
    type: 'PDF',
    size: '2.3 MB',
    uploadDate: '2024-01-15',
    category: 'lab'
  }, {
    id: '2',
    name: 'Siêu âm thận 10-01-2024.jpg',
    type: 'JPG',
    size: '1.8 MB',
    uploadDate: '2024-01-10',
    category: 'imaging'
  }, {
    id: '3',
    name: 'Đơn thuốc BS.Hoàng 08-01-2024.pdf',
    type: 'PDF',
    size: '0.5 MB',
    uploadDate: '2024-01-08',
    category: 'prescription'
  }]);
  const tabs = [{
    id: 'personal',
    label: 'Thông tin cá nhân',
    icon: UserIcon
  }, {
    id: 'testHistory',
    label: 'Lịch sử xét nghiệm',
    icon: Activity
  }, {
    id: 'medical',
    label: 'Hồ sơ khám',
    icon: FileText
  }, {
    id: 'files',
    label: 'Tệp y khoa',
    icon: FileText
  }] as any[];
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear date error when user types
    if (field === 'dateOfBirth') {
      setDateError('');
    }
  };
  const handleSave = async () => {
    if (!user?.userId) {
      setShowUpdateErrorNotification(true);
      setTimeout(() => setShowUpdateErrorNotification(false), 3000);
      return;
    }

    // Validate date before saving
    if (formData.dateOfBirth) {
      const dateValidationError = validateDate(formData.dateOfBirth);
      if (dateValidationError) {
        setDateError(dateValidationError);
        return;
      }
    }

    setIsSaving(true);

    try {
      // Prepare data for API - only include fields that have values
      const updateData: UpdateUserRequest = {
        userId: user.userId,
      };

      // Add fields that have actual values
      if (formData.fullName && formData.fullName.trim()) {
        updateData.fullName = formData.fullName.trim();
      }
      if (formData.gender) {
        // Sử dụng validateGender để đảm bảo format đúng
        const validatedGender = validateGender(formData.gender);
        if (validatedGender) {
          updateData.gender = validatedGender;
        }
      }
      if (formData.dateOfBirth) {
        updateData.dob = formatDateForAPI(formData.dateOfBirth);
      }
      if (formData.phone && formData.phone.trim()) {
        updateData.phone = formData.phone.trim();
      }
      if (formData.address && formData.address.trim()) {
        updateData.address = formData.address.trim();
      }
      
      // Always include role for user updates
      updateData.role = 'PATIENT';


      // Check if there are any fields to update (besides userId)
      const fieldsToUpdate = Object.keys(updateData).filter(key => key !== 'userId');
      if (fieldsToUpdate.length === 0) {
        // No fields to update, just exit edit mode
        setIsEditing(false);
        setShowUpdateSuccessNotification(true);
        setTimeout(() => setShowUpdateSuccessNotification(false), 3000);
        return;
      }

      // Call update API
      const result = await updateUser(updateData);

      if (result) {
        // Success - refetch user data and show success notification
        await refetch();
        setIsEditing(false);
        setShowUpdateSuccessNotification(true);
        setTimeout(() => setShowUpdateSuccessNotification(false), 3000);
      } else {
        // Error - show error notification
        setShowUpdateErrorNotification(true);
        setTimeout(() => setShowUpdateErrorNotification(false), 3000);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setShowUpdateErrorNotification(true);
      setTimeout(() => setShowUpdateErrorNotification(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to format date for API
  const formatDateForAPI = (dateString: string): string => {
    try {
      // Convert from dd/mm/yyyy to YYYY-MM-DD format (not full ISO)
      const [day, month, year] = dateString.split('/');
      const paddedDay = day.padStart(2, '0');
      const paddedMonth = month.padStart(2, '0');
      return `${year}-${paddedMonth}-${paddedDay}`;
    } catch {
      return dateString; // Return as-is if parsing fails
    }
  };

  // Validation function để đảm bảo gender đúng format
  const validateGender = (value: string): 'MALE' | 'FEMALE' | 'OTHER' | undefined => {
    if (!value) return undefined;
    
    const upperValue = value.toUpperCase();
    const validValues = ['MALE', 'FEMALE', 'OTHER'];
    
    return validValues.includes(upperValue) 
      ? upperValue as 'MALE' | 'FEMALE' | 'OTHER'
      : undefined;
  };

  // Helper function to convert gender display value to API value
  const mapGenderForAPI = (displayGender: string): string => {
    // Với format mới, gender values đã là uppercase trong form
    if (displayGender && ['MALE', 'FEMALE', 'OTHER'].includes(displayGender)) {
      return displayGender;
    }
    
    // Fallback cho trường hợp cũ
    switch (displayGender) {
      case 'Nam':
        return 'MALE';
      case 'Nữ':
        return 'FEMALE';
      case 'Khác':
        return 'OTHER';
      default:
        return displayGender; // Return as-is if unknown
    }
  };

  // Helper function to convert gender API value to display value for UI
  const mapGenderFromAPI = (apiGender: string): string => {
    switch (apiGender) {
      case 'MALE':
        return 'MALE'; // Trả về giá trị form để tương thích với dropdown
      case 'FEMALE':
        return 'FEMALE';
      case 'OTHER':
        return 'OTHER';
      default:
        return apiGender || ''; // Return as-is if unknown
    }
  };

  // Helper function to format date for HTML date input (YYYY-MM-DD)
  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return '';
    
    try {
      // If it's already in YYYY-MM-DD format, return as-is
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }
      
      // If it's in dd/mm/yyyy format, convert to YYYY-MM-DD
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
        const [day, month, year] = dateString.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      
      // Try to parse as date and format
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  // Helper function to handle date change from date picker
  const handleDateChange = (dateValue: string) => {
    if (!dateValue) {
      handleInputChange('dateOfBirth', '');
      return;
    }
    
    try {
      // Convert YYYY-MM-DD to dd/mm/yyyy for display consistency
      const [year, month, day] = dateValue.split('-');
      const formattedDate = `${day}/${month}/${year}`;
      handleInputChange('dateOfBirth', formattedDate);
    } catch {
      // If parsing fails, use the raw value
      handleInputChange('dateOfBirth', dateValue);
    }
  };

  // Helper function to validate date format
  const validateDate = (dateString: string): string => {
    if (!dateString) return '';
    
    let date: Date;
    
    // Check if it's in dd/mm/yyyy format
    const ddmmyyyyPattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match = dateString.match(ddmmyyyyPattern);
    
    if (match) {
      const [, day, month, year] = match;
      const dayNum = parseInt(day, 10);
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);
      
      // Basic validation
      if (monthNum < 1 || monthNum > 12) {
        return 'Tháng không hợp lệ (1-12)';
      }
      
      if (dayNum < 1 || dayNum > 31) {
        return 'Ngày không hợp lệ (1-31)';
      }
      
      // Check if date is valid
      date = new Date(yearNum, monthNum - 1, dayNum);
      if (date.getDate() !== dayNum || date.getMonth() !== monthNum - 1 || date.getFullYear() !== yearNum) {
        return 'Ngày không tồn tại';
      }
    } else {
      // Try to parse as ISO date from date picker
      date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Ngày không hợp lệ';
      }
    }
    
    // Check if date is not in future
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of today
    if (date > today) {
      return 'Ngày sinh không thể trong tương lai';
    }
    
    // Check if date is reasonable (not too old)
    const minYear = today.getFullYear() - 150;
    if (date.getFullYear() < minYear) {
      return 'Năm sinh không hợp lệ';
    }
    
    return '';
  };
  const handleCancel = () => {
    if (user) {
      const formatDate = (dateString: string | null) => {
        if (!dateString) return '';
        try {
          const date = new Date(dateString);
          return date.toLocaleDateString('vi-VN');
        } catch {
          return '';
        }
      };

      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: formatDate(user.dob),
        gender: mapGenderFromAPI(user.gender || ''),
        address: user.address || '',
        insuranceType: user.insurance || 'BHYT',
        insuranceNumber: '',
        insuranceExpiry: '',
        height: user.height ? user.height.toString() : '',
        weight: user.weight ? user.weight.toString() : '',
        bloodType: user.bloodType || '',
        bmi: user.bmi ? user.bmi.toString() : ''
      });
    }
    setDateError(''); // Clear date error
    setIsEditing(false);
  };
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.userId) {
      return;
    }

    try {
      // Show loading state by updating avatar with a loading preview
      const reader = new FileReader();
      reader.onload = e => {
        setAvatar(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Call API to upload avatar
      const avatarUrl = await updateAvatar(user.userId, file);
      
      if (avatarUrl) {
        // Success - update avatar state with the actual URL from Cloudinary
        setAvatar(avatarUrl);
        
        // Refetch user data to get updated avatar
        await refetch();
        
        // Show success notification
        setShowAvatarSuccessNotification(true);
        setTimeout(() => setShowAvatarSuccessNotification(false), 3000);
      } else {
        // Error - revert to original avatar
        setAvatar(user.avatarUrl || null);
        setShowAvatarErrorNotification(true);
        setTimeout(() => setShowAvatarErrorNotification(false), 3000);
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      // Revert to original avatar
      setAvatar(user.avatarUrl || null);
      setShowAvatarErrorNotification(true);
      setTimeout(() => setShowAvatarErrorNotification(false), 3000);
    }
    
    // Clear the input value so the same file can be selected again
    event.target.value = '';
  };
  const handleSelectFile = (fileId: string) => {
    setSelectedFiles(prev => prev.includes(fileId) ? prev.filter(id => id !== fileId) : [...prev, fileId]);
  };
  const handleDownloadSelected = () => {
    // Download selected files
    setSelectedFiles([]);
    setIsSelectionMode(false);
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-red-100 text-red-800';
      case 'chronic':
        return 'bg-orange-100 text-orange-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild':
        return 'bg-yellow-100 text-yellow-800';
      case 'moderate':
        return 'bg-orange-100 text-orange-800';
      case 'severe':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const getCategoryIcon = (category: string) => {
    return <FileText className="w-6 h-6 text-red-600" />;
  };
  const renderTestHistory = () => <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900" style={{
        display: "none"
      }}>Lịch sử xét nghiệm</h2>
      </div>

      {/* Test Results */}
      <div className="bg-white rounded-2xl shadow-[0_10px_24px_rgba(16,24,40,0.08)] p-8">
        <div className="bg-gradient-to-r from-[#1E75FF] to-[#1659C9] p-6 text-white rounded-2xl mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">Kết quả xét nghiệm</h3>
              <p className="text-white/80 text-sm">Theo dõi các chỉ số quan trọng của bạn</p>
            </div>
            <button onClick={() => setShowTestModal(true)} className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl font-medium transition-colors text-sm flex items-center gap-2">
              <Plus size={16} />
              <span>Thêm kết quả xét nghiệm</span>
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-[#0F172A]">Ngày</th>
                <th className="text-left py-4 px-4 font-semibold text-[#0F172A]">Creatinin huyết thanh</th>
                <th className="text-left py-4 px-4 font-semibold text-[#0F172A]">eGFR</th>
                <th className="text-left py-4 px-4 font-semibold text-[#0F172A]">Ure máu (BUN)</th>
                <th className="text-left py-4 px-4 font-semibold text-[#0F172A]">Canxi huyết thanh</th>
                <th className="text-left py-4 px-4 font-semibold text-[#0F172A]">ANA</th>
                <th className="text-left py-4 px-4 font-semibold text-[#0F172A]">Bổ thể C3/C4</th>
                <th className="text-left py-4 px-4 font-semibold text-[#0F172A]">Đái máu</th>
                <th className="text-left py-4 px-4 font-semibold text-[#0F172A]">Nồng độ oxalat</th>
                <th className="text-left py-4 px-4 font-semibold text-[#0F172A]">pH nước tiểu</th>
              </tr>
            </thead>
            <tbody>
              {panelsLoading && (
                <tr>
                  <td className="py-6 px-4 text-gray-500" colSpan={10}>Đang tải dữ liệu...</td>
                </tr>
              )}
              {!panelsLoading && testResults.length === 0 && (
                <tr>
                  <td className="py-6 px-4 text-gray-500" colSpan={10}>Chưa có dữ liệu xét nghiệm</td>
                </tr>
              )}
              {!panelsLoading && testResults.map((result, index) => {
                const p = panels.find(x => x.id === result.id);
                const m = p?.metrics || {} as any;
                const fmt = (name: string, unitFallback = '', stringFallback?: string) => {
                  const metric = m[name];
                  // If no metric from server, fallback to optimistic string value
                  if (metric === undefined) return stringFallback ?? '-';
                  if (metric.value === undefined || metric.value === null || metric.value === '') return stringFallback ?? '-';
                  if (name === 'ana' || name === 'hematuria') {
                    return Number(metric.value) === 1 ? 'Dương tính' : 'Âm tính';
                  }
                  return `${metric.value}${metric.unit ? ` ${metric.unit}` : unitFallback}`;
                };
                return (
                  <tr key={result.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index === 0 ? 'bg-blue-50' : ''}`}>
                    <td className="py-4 px-4 text-[#0F172A] font-medium">{result.date}</td>
                    <td className="py-4 px-4 text-[#0F172A]">{fmt('serum_creatinine', ' mg/dL', result.creatinine)}</td>
                    <td className="py-4 px-4 text-[#0F172A]">{fmt('gfr', ' ml/min', result.egfr)}</td>
                    <td className="py-4 px-4 text-[#0F172A]">{fmt('bun', ' mg/dL', result.bun)}</td>
                    <td className="py-4 px-4 text-[#0F172A]">{fmt('serum_calcium', ' mg/dL')}</td>
                    <td className="py-4 px-4 text-[#0F172A]">{fmt('ana')}</td>
                    <td className="py-4 px-4 text-[#0F172A]">{fmt('c3_c4', ' mg/dL')}</td>
                    <td className="py-4 px-4 text-[#0F172A]">{fmt('hematuria')}</td>
                    <td className="py-4 px-4 text-[#0F172A]">{fmt('oxalate_levels', ' mg/day')}</td>
                    <td className="py-4 px-4 text-[#0F172A]">{fmt('urine_ph', '')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Additional Info */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-start space-x-3">
            <Activity className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Thông tin quan trọng</h4>
              <p className="text-sm text-blue-700">
                Các kết quả xét nghiệm được cập nhật định kỳ để theo dõi tình trạng sức khỏe của bạn. 
                Nếu có bất kỳ thắc mắc nào về kết quả, vui lòng liên hệ với bác sĩ điều trị.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>;
  const renderPersonalInfo = () => <div className="space-y-6">
      {/* Profile Header Card */}
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} className="bg-gradient-to-r from-[#1E75FF] to-[#1659C9] p-6 text-white rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                {avatar ? <img src={avatar} alt="Avatar" className="w-full h-full object-cover" /> : <UserIcon size={28} className="text-white" />}
                
                {/* Loading overlay when uploading */}
                {isUploadingAvatar && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-1"></div>
                      <div className="text-xs">{progress}%</div>
                    </div>
                  </div>
                )}
              </div>
              {isEditing && <label className={`absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow ${isUploadingAvatar ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                  <Camera size={12} className="text-[#1E75FF]" />
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleAvatarUpload} 
                    className="hidden" 
                    disabled={isUploadingAvatar}
                  />
                </label>}
            </div>
            <div>
              <h1 className="text-xl font-bold mb-1">{formData.fullName || 'Chưa cập nhật tên'}</h1>
            </div>
          </div>
          <div className="flex gap-3">
            {!isEditing ? <button onClick={() => setIsEditing(true)} className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl font-medium transition-colors text-sm">
                <span>Chỉnh sửa</span>
              </button> : <div className="flex gap-2">
                <button onClick={handleCancel} className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl font-medium transition-colors text-sm">
                  <span>Hủy</span>
                </button>
                <button onClick={handleSave} disabled={isSaving || isUpdating} className="bg-white text-[#1E75FF] hover:bg-gray-100 px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50 text-sm">
                  {(isSaving || isUpdating) ? <div className="w-4 h-4 border-2 border-[#1E75FF] border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
                  <span>{(isSaving || isUpdating) ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                </button>
              </div>}
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="text-center">
            <div className="text-sm text-white/80 mb-1">Chiều cao:</div>
            <div className="font-semibold text-lg">{formData.height ? `${formData.height} cm` : '--'}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-white/80 mb-1">Cân nặng:</div>
            <div className="font-semibold text-lg">{formData.weight ? `${formData.weight} kg` : '--'}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-white/80 mb-1">Nhóm máu:</div>
            <div className="font-semibold text-lg">{formData.bloodType || '--'}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-white/80 mb-1">BMI:</div>
            <div className="font-semibold text-lg">{formData.bmi || '--'}</div>
          </div>
        </div>
      </motion.div>

      {/* Basic Information */}
      <div className="bg-white rounded-2xl shadow-[0_10px_24px_rgba(16,24,40,0.08)] p-8">
        <h2 className="text-2xl font-semibold text-[#0F172A] border-b border-gray-100 pb-3 mb-6">
          Thông tin cơ bản
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#334155]">
              Họ và tên
            </label>
            {isEditing ? <input type="text" value={formData.fullName} onChange={e => handleInputChange('fullName', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent transition-all" /> : <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-2xl">
                <UserIcon size={20} className="text-[#334155]" />
                <span className="text-[#0F172A]">{formData.fullName || 'Chưa cập nhật'}</span>
              </div>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#334155]">
              Ngày sinh
            </label>
            {isEditing ? (
              <div className="relative">
                {/* Date input with picker support */}
                <input 
                  type="date" 
                  value={formatDateForInput(formData.dateOfBirth)} 
                  onChange={e => handleDateChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent transition-all" 
                />
                {dateError && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <X size={14} />
                    {dateError}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-2xl">
                <Calendar size={20} className="text-[#334155]" />
                <span className="text-[#0F172A]">{formData.dateOfBirth || 'Chưa cập nhật'}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#334155]">
              Giới tính
            </label>
            {isEditing ? <select value={formData.gender} onChange={e => handleInputChange('gender', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent transition-all">
                <option value="">Chọn giới tính</option>
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
                <option value="OTHER">Khác</option>
              </select> : <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-2xl">
                <UserIcon size={20} className="text-[#334155]" />
                <span className="text-[#0F172A]">
                  {formData.gender === 'MALE' ? 'Nam' : 
                   formData.gender === 'FEMALE' ? 'Nữ' : 
                   formData.gender === 'OTHER' ? 'Khác' : 
                   'Chưa cập nhật'}
                </span>
              </div>}
          </div>


          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#334155]">
              Số điện thoại
            </label>
            {isEditing ? <input type="tel" value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent transition-all" /> : <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-2xl">
                <Phone size={20} className="text-[#334155]" />
                <span className="text-[#0F172A]">{formData.phone || 'Chưa cập nhật'}</span>
              </div>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#334155]">
              Email
            </label>
            {isEditing ? <input type="email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent transition-all" /> : <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-2xl">
                <Mail size={20} className="text-[#334155]" />
                <span className="text-[#0F172A]">{formData.email || 'Chưa cập nhật'}</span>
              </div>}
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="block text-sm font-medium text-[#334155]">
              Địa chỉ
            </label>
            {isEditing ? <input type="text" value={formData.address} onChange={e => handleInputChange('address', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent transition-all" /> : <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-2xl">
                <MapPin size={20} className="text-[#334155]" />
                <span className="text-[#0F172A]">{formData.address || 'Chưa cập nhật'}</span>
              </div>}
          </div>
        </div>
      </div>

      {/* Insurance Information */}
      <div className="bg-white rounded-2xl shadow-[0_10px_24px_rgba(16,24,40,0.08)] p-8" style={{
      display: "none"
    }}>
        <h3 className="text-lg font-semibold text-[#0F172A] mb-6">Thông tin bảo hiểm</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#334155]">
              Loại bảo hiểm
            </label>
            {isEditing ? <input type="text" value={formData.insuranceType} onChange={e => handleInputChange('insuranceType', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent transition-all" /> : <div className="px-4 py-3 bg-gray-50 rounded-2xl">
                <span className="text-[#0F172A]">{formData.insuranceType}</span>
              </div>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#334155]">
              Số thẻ BHYT
            </label>
            {isEditing ? <input type="text" value={formData.insuranceNumber} onChange={e => handleInputChange('insuranceNumber', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent transition-all" /> : <div className="px-4 py-3 bg-gray-50 rounded-2xl">
                <span className="text-[#0F172A]">{formData.insuranceNumber}</span>
              </div>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#334155]">
              Ngày hết hạn
            </label>
            {isEditing ? <input type="text" value={formData.insuranceExpiry} onChange={e => handleInputChange('insuranceExpiry', e.target.value)} placeholder="dd/mm/yyyy" className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent transition-all" /> : <div className="px-4 py-3 bg-gray-50 rounded-2xl">
                <span className="text-[#0F172A]">{formData.insuranceExpiry}</span>
              </div>}
          </div>
        </div>
      </div>
    </div>;
  const renderMedicalHistory = () => {
    const handleViewDetail = async (record: MedicalRecordWithPrescriptions) => {
      setSelectedRecord(record);
      setShowRecordDetailModal(true);
      setRecordDetailTab('current'); // Reset to current tab
      setRecordTimeline(null); // Reset timeline data
      setRecordTimelineError(null); // Reset error

      // Fetch timeline
      if (record.recordId) {
        setLoadingRecordTimeline(true);
        try {
          const response = await getMedicalRecordTimeline(record.recordId);
          if (response.success && response.data) {
            setRecordTimeline(response.data);
          } else {
            setRecordTimelineError(response.message || 'Không thể tải lịch sử khám');
          }
        } catch (err) {
          console.error('Error fetching timeline:', err);
          setRecordTimelineError('Có lỗi xảy ra khi tải lịch sử khám');
        } finally {
          setLoadingRecordTimeline(false);
        }
      }
    };

    return (
      <div className="space-y-6">
        {/* Medical Records List */}
        <div className="bg-white rounded-2xl shadow-[0_10px_24px_rgba(16,24,40,0.08)] p-8">

          {/* Loading State */}
          {medicalRecordsLoading && (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-[#1E75FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải hồ sơ khám...</p>
            </div>
          )}

          {/* Error State */}
          {medicalRecordsError && !medicalRecordsLoading && (
            <div className="text-center py-12">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{medicalRecordsError}</p>
              <button
                onClick={() => refetchMedicalRecords()}
                className="px-4 py-2 bg-[#1E75FF] text-white rounded-xl hover:bg-[#1659C9] transition-colors"
              >
                Thử lại
              </button>
            </div>
          )}

          {/* Empty State */}
          {!medicalRecordsLoading && !medicalRecordsError && medicalRecords.length === 0 && (
            <div className="text-center py-12">
              <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Chưa có hồ sơ khám bệnh nào</p>
            </div>
          )}

          {/* Records List */}
          {!medicalRecordsLoading && !medicalRecordsError && medicalRecords.length > 0 && (
            <div className="space-y-4">
              {medicalRecords.map((record, index) => (
                <div
                  key={record.recordId}
                  className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#0F172A] text-lg mb-2">
                          Cuộc khám ngày {formatDate(record.createdAt)}
                        </h4>
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <UserIcon className="w-4 h-4" />
                            <span>BS. {record.doctorName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Activity className="w-4 h-4" />
                            <span>{record.serviceName}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <ClipboardList className="w-4 h-4 text-gray-500 mt-0.5" />
                            <div>
                              <span className="text-sm font-medium text-gray-700">Chẩn đoán: </span>
                              <span className="text-sm text-gray-600">{record.diagnosis}</span>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-gray-500 mt-0.5" />
                            <div>
                              <span className="text-sm font-medium text-gray-700">Triệu chứng: </span>
                              <span className="text-sm text-gray-600">
                                {record.symptoms && record.symptoms.length > 100
                                  ? `${record.symptoms.substring(0, 100)}...`
                                  : record.symptoms || 'Không có thông tin'}
                              </span>
                            </div>
                          </div>
                          {record.followUpDate && (
                            <div className="flex items-center gap-2">
                              <CalendarCheck className="w-4 h-4 text-orange-500" />
                              <span className="text-sm font-medium text-orange-600">
                                Tái khám: {formatDate(record.followUpDate)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewDetail(record)}
                      className="px-4 py-2 bg-[#1E75FF] text-white rounded-xl hover:bg-[#1659C9] transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Xem chi tiết
                    </button>
                  </div>

                  {/* Prescriptions Summary */}
                  {record.prescriptions.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Pill className="w-4 h-4 text-blue-600" />
                        <h5 className="font-medium text-gray-900">
                          Đơn thuốc ({record.prescriptions.length} loại)
                        </h5>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {record.prescriptions.slice(0, 4).map((prescription) => {
                          const frequencies = parseFrequency(prescription.frequency);
                          return (
                            <div
                              key={prescription.prescriptionId}
                              className="bg-blue-50 p-3 rounded-xl"
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium text-gray-900 text-sm">
                                    {prescription.medicationName}
                                  </p>
                                  <p className="text-xs text-gray-600 mt-1">
                                    Liều: {prescription.dosage}
                                  </p>
                                  <div className="flex items-center gap-1 mt-1">
                                    {frequencies.map((freq, idx) => (
                                      <span
                                        key={idx}
                                        className="px-2 py-0.5 bg-white rounded-full text-xs text-gray-700"
                                      >
                                        {frequencyMap[freq] || freq}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {record.prescriptions.length > 4 && (
                        <p className="text-sm text-blue-600 mt-2">
                          +{record.prescriptions.length - 4} thuốc khác
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Info Notice */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Lưu ý quan trọng</h4>
                <p className="text-sm text-blue-700">
                  Hồ sơ khám bệnh được lưu trữ an toàn và chỉ bạn cùng bác sĩ điều trị có quyền truy cập.
                  Vui lòng tuân thủ đơn thuốc và lịch tái khám của bác sĩ.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const renderMedicalFiles = () => <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Tệp y khoa</h2>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Tải lên tệp y khoa</h3>
          <p className="text-gray-600 mb-4">Kéo thả tệp vào đây hoặc nhấp để chọn</p>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
            Chọn tệp
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Hỗ trợ: PDF, JPG, PNG, DOCX (tối đa 10MB)
          </p>
        </div>
      </div>

      {/* Files List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Tệp đã tải lên</h3>
          <div className="flex items-center space-x-3">
            {isSelectionMode && selectedFiles.length > 0 && <button onClick={handleDownloadSelected} className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-sm font-medium">
                <Download className="w-4 h-4" />
                <span>Tải về ({selectedFiles.length})</span>
              </button>}
            <button onClick={() => {
            setIsSelectionMode(!isSelectionMode);
            setSelectedFiles([]);
          }} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${isSelectionMode ? 'bg-gray-600 text-white hover:bg-gray-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
              {isSelectionMode ? 'Hủy' : 'Chọn'}
            </button>
          </div>
        </div>
        
        <div className="space-y-3">
          {medicalFiles.map(file => <div key={file.id} className={`flex items-center space-x-4 p-4 border rounded-xl transition-colors ${isSelectionMode && selectedFiles.includes(file.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
              <div className="text-2xl">{getCategoryIcon(file.category)}</div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">{file.name}</h4>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-sm text-gray-500">{file.type}</span>
                  <span className="text-sm text-gray-500">{file.size}</span>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {new Date(file.uploadDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {isSelectionMode && <button onClick={() => handleSelectFile(file.id)} className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${selectedFiles.includes(file.id) ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 hover:border-blue-400'}`}>
                    {selectedFiles.includes(file.id) && <Check className="w-3 h-3" />}
                  </button>}
                {!isSelectionMode && <>
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>}
              </div>
            </div>)}
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Bảo mật thông tin</h4>
            <p className="text-sm text-blue-700">
              Tất cả tệp y khoa được mã hóa và chỉ có bạn và bác sĩ được ủy quyền mới có thể truy cập. 
              Chúng tôi tuân thủ nghiêm ngặt các quy định về bảo mật dữ liệu y tế.
            </p>
          </div>
        </div>
      </div>
    </div>;
  const handleNewTestInputChange = (field: keyof NewTestResult, value: string) => {
    setNewTestData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleAddTestResult = async () => {
    if (!user?.userId) return;
    setIsAddingTest(true);

    // Build payload for backend
    const measuredAtIso = (() => {
      try {
        // newTestData.date is yyyy-mm-dd from input type=date
        return new Date(newTestData.date).toISOString();
      } catch {
        return new Date().toISOString();
      }
    })();

    // Normalize numeric inputs (support both comma and dot decimals)
    const toNumber = (v: string) => {
      const n = Number(String(v ?? '').replace(',', '.'));
      return Number.isFinite(n) ? n : NaN;
    };

    const egfrNum = toNumber(newTestData.egfr);
    const creaNum = toNumber(newTestData.creatinine);
    const bunNum = toNumber(newTestData.bun);
    const caNum = toNumber(newTestData.serumCalcium);
    const c3c4Num = toNumber(newTestData.c3c4);
    const oxalateNum = toNumber(newTestData.oxalateLevels);
    const urinePhNum = toNumber(newTestData.urinePH);

    // Basic validation to prevent server 500 when values are NaN
    const invalid = [egfrNum, creaNum, bunNum, caNum, c3c4Num, oxalateNum, urinePhNum].some((n) => isNaN(n));
    if (invalid) {
      setIsAddingTest(false);
      alert('Vui lòng nhập số hợp lệ (dùng dấu "." cho phần thập phân).');
      return;
    }

    const payload = {
      patientId: user.userId,
      measuredAt: measuredAtIso,
      metrics: [
        { name: 'gfr', value: egfrNum, unit: 'ml/min' },
        { name: 'serum_creatinine', value: creaNum, unit: 'mg/dL' },
        { name: 'bun', value: bunNum, unit: 'mg/dL' },
        { name: 'serum_calcium', value: caNum, unit: 'mg/dL' },
        { name: 'ana', value: Number(newTestData.ana), unit: '0|1' },
        { name: 'c3_c4', value: c3c4Num, unit: 'mg/dL' },
        { name: 'hematuria', value: Number(newTestData.hematuria), unit: '0|1' },
        { name: 'oxalate_levels', value: oxalateNum, unit: 'mg/day' },
        { name: 'urine_ph', value: urinePhNum, unit: 'pH' },
      ],
    } as const;

    // Debug: log payload to help diagnose backend validation errors
    console.debug('[create-panel] payload', payload);
    const ok = await createPanel(payload as any);

    if (ok) {
      // Update UI table optimistically
      const newResult: TestResult = {
        id: Date.now().toString(),
        date: new Date(measuredAtIso).toLocaleDateString('vi-VN'),
        egfr: `${newTestData.egfr} ml/min`,
        creatinine: `${newTestData.creatinine} mg/dL`,
        bun: `${newTestData.bun} mg/dL`,
        bloodPressure: '-'
      };

      setTestResults(prev => {
        const updated = [newResult, ...prev];
        return updated.sort((a, b) => {
          const dateA = new Date(a.date.split('/').reverse().join('-'));
          const dateB = new Date(b.date.split('/').reverse().join('-'));
          return dateB.getTime() - dateA.getTime();
        });
      });
      // Refetch server data to sync
      refetchPanels();

      // Reset form and close modal
      setNewTestData({
        date: '',
        creatinine: '',
        egfr: '',
        bun: '',
        serumCalcium: '',
        ana: '',
        c3c4: '',
        hematuria: '',
        oxalateLevels: '',
        urinePH: ''
      });
      setShowTestModal(false);
      setShowSuccessNotification(true);
      setTimeout(() => setShowSuccessNotification(false), 3000);
    } else {
      alert(`Không thể lưu kết quả xét nghiệm: ${createPanelError || 'Lỗi máy chủ'}`);
    }

    setIsAddingTest(false);
  };
  const handleCancelAddTest = () => {
    setNewTestData({
      date: '',
      creatinine: '',
      egfr: '',
      bun: '',
      serumCalcium: '',
      ana: '',
      c3c4: '',
      hematuria: '',
      oxalateLevels: '',
      urinePH: ''
    });
    setShowTestModal(false);
  };
  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-[#1E75FF] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">Đang tải thông tin người dùng...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Không thể tải thông tin</h3>
            <p className="text-gray-600 mb-4">Đã xảy ra lỗi khi tải thông tin người dùng. Vui lòng thử lại sau.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-[#1E75FF] text-white rounded-xl hover:bg-[#1659C9] transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No user data
  if (!user) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-gray-400 text-5xl mb-4">👤</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy thông tin người dùng</h3>
            <p className="text-gray-600">Vui lòng đăng nhập lại để xem thông tin cá nhân.</p>
          </div>
        </div>
      </div>
    );
  }

  // Helper functions for medical records
  const parseFrequency = (freq: string[] | string): string[] => {
    try {
      if (Array.isArray(freq)) {
        return freq;
      }
      const cleaned = freq.replace(/[{}]/g, '');
      return cleaned.split(',').map(f => f.trim());
    } catch {
      return [];
    }
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '--';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch {
      return '--';
    }
  };

  const frequencyMap: Record<string, string> = {
    'MORNING': 'Sáng',
    'AFTERNOON': 'Trưa',
    'EVENING': 'Tối'
  };

  return <div className="p-6 max-w-7xl mx-auto">
      {/* Medical Record Detail Modal */}
      <AnimatePresence>
        {showRecordDetailModal && selectedRecord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowRecordDetailModal(false);
                setSelectedRecord(null);
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative z-[10000]"
            >
              {/* Appointment Info Header - Full width with rounded top corners */}
              <div className="bg-gradient-to-r from-[#1E75FF] to-[#1659C9] p-6 text-white relative">
                {/* Close button */}
                <button
                  onClick={() => {
                    setShowRecordDetailModal(false);
                    setSelectedRecord(null);
                  }}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>

                {/* Title */}
                <h2 className="text-2xl font-semibold mb-6 pr-12">
                  Chi tiết hồ sơ khám - {formatDate(selectedRecord.createdAt)}
                </h2>

                {/* Appointment Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/80 text-sm mb-1">Bác sĩ</p>
                    <p className="font-medium">BS. {selectedRecord.doctorName}</p>
                  </div>
                  <div>
                    <p className="text-white/80 text-sm mb-1">Dịch vụ</p>
                    <p className="font-medium">{selectedRecord.serviceName}</p>
                  </div>
                  <div>
                    <p className="text-white/80 text-sm mb-1">Ngày khám</p>
                    <p className="font-medium">{formatDate(selectedRecord.createdAt)}</p>
                  </div>
                  {selectedRecord.followUpDate && (
                    <div>
                      <p className="text-white/80 text-sm mb-1">Ngày tái khám</p>
                      <p className="font-medium">{formatDate(selectedRecord.followUpDate)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="px-8 pt-6 pb-0">
                <div className="flex gap-2">
                  <button
                    onClick={() => setRecordDetailTab('current')}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                      recordDetailTab === 'current'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <FileText className="w-4 h-4" />
                      Kết quả lần này
                    </span>
                  </button>
                  <button
                    onClick={() => setRecordDetailTab('timeline')}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                      recordDetailTab === 'timeline'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Lịch sử khám đầy đủ
                    </span>
                  </button>
                </div>
              </div>

              {/* Scrollable Content Area */}
              <div className="p-8 overflow-y-auto max-h-[calc(90vh-280px)]">
                {/* Current Tab Content */}
                {recordDetailTab === 'current' && (
                  <div className="space-y-6">
                {/* Patient Information */}
                {selectedRecord.patient && (
                  <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl mb-6">
                    <h4 className="font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
                      <UserIcon className="w-5 h-5 text-blue-600" />
                      Thông tin bệnh nhân
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Họ và tên</p>
                        <p className="font-semibold text-gray-900">{selectedRecord.patient.fullName}</p>
                      </div>
                      
                      {selectedRecord.patient.email && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            Email
                          </p>
                          <p className="font-medium text-gray-900">{selectedRecord.patient.email}</p>
                        </div>
                      )}
                      
                      {selectedRecord.patient.phone && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            Số điện thoại
                          </p>
                          <p className="font-medium text-gray-900">{selectedRecord.patient.phone}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Medical Details */}
                <div className="space-y-6">
                {/* Diagnosis */}
                <div className="bg-gray-50 p-6 rounded-2xl">
                  <h4 className="font-semibold text-[#0F172A] mb-3 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-blue-600" />
                    Chẩn đoán
                  </h4>
                  <p className="text-gray-700">{selectedRecord.diagnosis}</p>
                </div>

                {/* Symptoms */}
                <div className="bg-gray-50 p-6 rounded-2xl">
                  <h4 className="font-semibold text-[#0F172A] mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    Triệu chứng
                  </h4>
                  <p className="text-gray-700 whitespace-pre-line">{selectedRecord.symptoms}</p>
                </div>

                {/* Treatment */}
                <div className="bg-gray-50 p-6 rounded-2xl">
                  <h4 className="font-semibold text-[#0F172A] mb-3 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-600" />
                    Điều trị
                  </h4>
                  <p className="text-gray-700">{selectedRecord.treatment}</p>
                </div>

                {/* Doctor Notes */}
                {selectedRecord.doctorNote && (
                  <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl">
                    <h4 className="font-semibold text-[#0F172A] mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-amber-600" />
                      Ghi chú của bác sĩ
                    </h4>
                    <p className="text-gray-700">{selectedRecord.doctorNote}</p>
                  </div>
                )}

                {/* Prescriptions */}
                {selectedRecord.prescriptions.length > 0 && (
                  <div className="bg-blue-50 p-6 rounded-2xl">
                    <h4 className="font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
                      <Pill className="w-5 h-5 text-blue-600" />
                      Đơn thuốc ({selectedRecord.prescriptions.length} loại thuốc)
                    </h4>
                    <div className="space-y-3">
                      {selectedRecord.prescriptions.map((prescription, index) => {
                        const frequencies = parseFrequency(prescription.frequency);
                        return (
                          <div
                            key={prescription.prescriptionId}
                            className="bg-white p-4 rounded-xl border border-blue-200"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-sm font-medium text-blue-600">
                                    {index + 1}
                                  </span>
                                </div>
                                <div>
                                  <h5 className="font-semibold text-gray-900 mb-1">
                                    {prescription.medicationName}
                                  </h5>
                                  <p className="text-sm text-gray-600">
                                    Liều lượng: <span className="font-medium">{prescription.dosage}</span>
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600 mb-1">Tần suất:</p>
                                <div className="flex flex-wrap gap-1">
                                  {frequencies.map((freq, idx) => (
                                    <span
                                      key={idx}
                                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium"
                                    >
                                      {frequencyMap[freq] || freq}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-gray-600 mb-1">Thời gian:</p>
                                <p className="font-medium text-gray-900">
                                  {formatDate(prescription.startDate)} - {formatDate(prescription.endDate)}
                                </p>
                              </div>
                            </div>
                            {prescription.notes && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Ghi chú:</span> {prescription.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Doctor Signature */}
                {selectedRecord.signatureUrl && (
                  <div className="bg-indigo-50 border border-indigo-200 p-6 rounded-2xl">
                    <h4 className="font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      Chữ ký bác sĩ
                    </h4>
                    <div className="flex justify-center">
                      <img
                        src={selectedRecord.signatureUrl}
                        alt="Chữ ký bác sĩ"
                        className="max-w-[300px] h-auto border border-indigo-300 rounded-xl bg-white p-4"
                      />
                    </div>
                  </div>
                )}
                </div>

                {/* Close Button for Current Tab */}
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => {
                      setShowRecordDetailModal(false);
                      setSelectedRecord(null);
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-2xl hover:bg-gray-300 transition-colors font-medium"
                  >
                    Đóng
                  </button>
                </div>
                  </div>
                )}

                {/* Timeline Tab Content */}
                {recordDetailTab === 'timeline' && (
                  <div className="space-y-6">
                    {/* Loading State for Timeline */}
                    {loadingRecordTimeline && (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mr-3" />
                        <span className="text-gray-600">Đang tải lịch sử khám...</span>
                      </div>
                    )}

                    {/* Timeline Error State */}
                    {recordTimelineError && !loadingRecordTimeline && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                        <div className="flex items-center">
                          <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
                          <div>
                            <h3 className="font-medium text-red-800">Không thể tải lịch sử khám</h3>
                            <p className="text-red-600 mt-1">{recordTimelineError}</p>
                          </div>
                        </div>
                        <button
                          onClick={async () => {
                            if (selectedRecord?.recordId) {
                              setLoadingRecordTimeline(true);
                              setRecordTimelineError(null);
                              try {
                                const response = await getMedicalRecordTimeline(selectedRecord.recordId);
                                if (response.success && response.data) {
                                  setRecordTimeline(response.data);
                                } else {
                                  setRecordTimelineError(response.message || 'Không thể tải lịch sử khám');
                                }
                              } catch (err) {
                                setRecordTimelineError('Có lỗi xảy ra khi tải lịch sử khám');
                              } finally {
                                setLoadingRecordTimeline(false);
                              }
                            }
                          }}
                          className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                        >
                          Thử lại
                        </button>
                      </div>
                    )}

                    {/* Timeline Component */}
                    {recordTimeline && !loadingRecordTimeline && !recordTimelineError && (
                      <div className="bg-gray-50 p-6 rounded-2xl">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-blue-600" />
                          Lịch sử khám bệnh đầy đủ
                        </h3>
                        <MedicalRecordTimeline
                          rootRecord={recordTimeline.rootRecord}
                          followUpRecords={recordTimeline.followUpRecords}
                        />
                      </div>
                    )}

                    {/* Close Button for Timeline Tab */}
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={() => {
                          setShowRecordDetailModal(false);
                          setSelectedRecord(null);
                        }}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-2xl hover:bg-gray-300 transition-colors font-medium"
                      >
                        Đóng
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Notification */}
      <AnimatePresence>
        {showSuccessNotification && <motion.div initial={{
        opacity: 0,
        y: -50
      }} animate={{
        opacity: 1,
        y: 0
      }} exit={{
        opacity: 0,
        y: -50
      }} className="fixed top-4 right-4 z-[10001] bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
            <Check size={20} />
            <span>Đã thêm kết quả xét nghiệm thành công</span>
          </motion.div>}
      </AnimatePresence>

      {/* Update Success Notification */}
      <AnimatePresence>
        {showUpdateSuccessNotification && <motion.div initial={{
        opacity: 0,
        y: -50
      }} animate={{
        opacity: 1,
        y: 0
      }} exit={{
        opacity: 0,
        y: -50
      }} className="fixed top-4 right-4 z-[10001] bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
            <Check size={20} />
            <span>Cập nhật thông tin thành công!</span>
          </motion.div>}
      </AnimatePresence>

      {/* Update Error Notification */}
      <AnimatePresence>
        {showUpdateErrorNotification && <motion.div initial={{
        opacity: 0,
        y: -50
      }} animate={{
        opacity: 1,
        y: 0
      }} exit={{
        opacity: 0,
        y: -50
      }} className="fixed top-4 right-4 z-[10001] bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
            <X size={20} />
            <span>Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại!</span>
          </motion.div>}
      </AnimatePresence>

      {/* Avatar Success Notification */}
      <AnimatePresence>
        {showAvatarSuccessNotification && <motion.div initial={{
        opacity: 0,
        y: -50
      }} animate={{
        opacity: 1,
        y: 0
      }} exit={{
        opacity: 0,
        y: -50
      }} className="fixed top-4 right-4 z-[10001] bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
            <Check size={20} />
            <span>Cập nhật ảnh đại diện thành công!</span>
          </motion.div>}
      </AnimatePresence>

      {/* Avatar Error Notification */}
      <AnimatePresence>
        {showAvatarErrorNotification && <motion.div initial={{
        opacity: 0,
        y: -50
      }} animate={{
        opacity: 1,
        y: 0
      }} exit={{
        opacity: 0,
        y: -50
      }} className="fixed top-4 right-4 z-[10001] bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
            <X size={20} />
            <span>{avatarError || 'Có lỗi xảy ra khi upload ảnh đại diện. Vui lòng thử lại!'}</span>
          </motion.div>}
      </AnimatePresence>

      {/* Add Test Result Modal */}
      <AnimatePresence>
        {showTestModal && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4" onClick={e => e.target === e.currentTarget && handleCancelAddTest()}>
            <motion.div initial={{
          scale: 0.95,
          opacity: 0
        }} animate={{
          scale: 1,
          opacity: 1
        }} exit={{
          scale: 0.95,
          opacity: 0
        }} className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-[10000]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-[#0F172A]">Thêm kết quả xét nghiệm mới</h2>
                <button onClick={handleCancelAddTest} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <form onSubmit={e => {
            e.preventDefault();
            handleAddTestResult();
          }} className="space-y-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-[#334155] mb-2">
                      Ngày xét nghiệm <span className="text-red-500">*</span>
                    </label>
                    <input type="date" value={newTestData.date} onChange={e => handleNewTestInputChange('date', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent transition-all" required />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[#334155] mb-2">
                        Creatinin huyết thanh (mg/dL) <span className="text-red-500">*</span>
                      </label>
                      <input type="number" step="0.1" value={newTestData.creatinine} onChange={e => handleNewTestInputChange('creatinine', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent transition-all" placeholder="1.0" required />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#334155] mb-2">
                        eGFR (ml/min) <span className="text-red-500">*</span>
                      </label>
                      <input type="number" step="0.1" value={newTestData.egfr} onChange={e => handleNewTestInputChange('egfr', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent transition-all" placeholder="95.0" required />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#334155] mb-2">
                        Ure máu (BUN) (mg/dL) <span className="text-red-500">*</span>
                      </label>
                      <input type="number" step="0.1" value={newTestData.bun} onChange={e => handleNewTestInputChange('bun', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent transition-all" placeholder="15.0" required />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#334155] mb-2">
                        Canxi huyết thanh (mg/dL)
                      </label>
                      <input type="number" step="0.1" value={newTestData.serumCalcium} onChange={e => handleNewTestInputChange('serumCalcium', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent transition-all" placeholder="10.0" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#334155] mb-2">
                        ANA
                      </label>
                      <select value={newTestData.ana} onChange={e => handleNewTestInputChange('ana', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent transition-all">
                        <option value="">Chọn kết quả</option>
                        <option value="1">Dương tính</option>
                        <option value="0">Âm tính</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#334155] mb-2">
                        Bổ thể C3/C4 (mg/dL)
                      </label>
                      <input type="number" step="0.1" value={newTestData.c3c4} onChange={e => handleNewTestInputChange('c3c4', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent transition-all" placeholder="130.0" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#334155] mb-2">
                        Đái máu
                      </label>
                      <select value={newTestData.hematuria} onChange={e => handleNewTestInputChange('hematuria', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent transition-all">
                        <option value="">Chọn kết quả</option>
                        <option value="1">Dương tính</option>
                        <option value="0">Âm tính</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#334155] mb-2">
                        Nồng độ oxalat (mg/day)
                      </label>
                      <input type="number" step="0.1" value={newTestData.oxalateLevels} onChange={e => handleNewTestInputChange('oxalateLevels', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent transition-all" placeholder="2.0" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#334155] mb-2">
                        pH nước tiểu
                      </label>
                      <input type="number" step="0.1" value={newTestData.urinePH} onChange={e => handleNewTestInputChange('urinePH', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent transition-all" placeholder="7.0" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={handleCancelAddTest} className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 transition-colors font-medium">
                    Hủy
                  </button>
                  <button type="submit" disabled={isAddingTest || isCreatingPanel} className="flex-1 px-6 py-3 bg-[#1E75FF] text-white rounded-2xl hover:bg-[#1659C9] transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50">
                    {isAddingTest || isCreatingPanel ? <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Đang lưu...</span>
                      </> : <>
                        <Save size={16} />
                        <span>Lưu kết quả</span>
                      </>}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>}
      </AnimatePresence>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map(tab => {
            const Icon = tab.icon;
            return <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`
                    flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                  `}>
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>;
          })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'personal' && renderPersonalInfo()}
      {activeTab === 'testHistory' && renderTestHistory()}
      {activeTab === 'medical' && renderMedicalHistory()}
      {activeTab === 'files' && renderMedicalFiles()}
    </div>;
}