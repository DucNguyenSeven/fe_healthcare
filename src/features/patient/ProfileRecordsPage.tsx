"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User as UserIcon, Phone, Mail, MapPin, Calendar, Heart, AlertTriangle, Upload, FileText, Download, Trash2, Edit3, Save, X, Plus, Clock, Shield, Camera, Check, Activity } from 'lucide-react';
import { useGetMe } from '@/hooks/auth/useGetMe';
import { useUpdateUser } from '@/hooks/auth/useUpdateUser';
import type { GetMeResponse } from '@/types/auth';
import type { UpdateUserRequest } from '@/lib/api/types';
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
  egfr: string;
  creatinine: string;
  bun: string;
  systolic: string;
  diastolic: string;
}
export function ProfileRecordsPage(_props: ProfileRecordsPageProps = {}) {
  // Get user data from API
  const { data: user, isLoading, error, refetch } = useGetMe();
  
  // Update user hook
  const { updateUser, isLoading: isUpdating, error: updateError } = useUpdateUser();
  const [activeTab, setActiveTab] = useState<'personal' | 'testHistory' | 'medical' | 'files'>('personal');
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
  const [dateError, setDateError] = useState<string>('');

  // New test result form data
  const [newTestData, setNewTestData] = useState<NewTestResult>({
    date: '',
    egfr: '',
    creatinine: '',
    bun: '',
    systolic: '',
    diastolic: ''
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

  // Mock test results data
  const [testResults, setTestResults] = useState<TestResult[]>([{
    id: '1',
    date: '15/1/2024',
    egfr: '45 ml/min',
    creatinine: '1.8 mg/dL',
    bun: '28 mg/dL',
    bloodPressure: '140/85 mmHg'
  }, {
    id: '2',
    date: '1/1/2024',
    egfr: '42 ml/min',
    creatinine: '1.9 mg/dL',
    bun: '32 mg/dL',
    bloodPressure: '145/88 mmHg'
  }, {
    id: '3',
    date: '15/12/2023',
    egfr: '48 ml/min',
    creatinine: '1.7 mg/dL',
    bun: '25 mg/dL',
    bloodPressure: '138/82 mmHg'
  }, {
    id: '4',
    date: '1/12/2023',
    egfr: '50 ml/min',
    creatinine: '1.6 mg/dL',
    bun: '23 mg/dL',
    bloodPressure: '135/80 mmHg'
  }]);

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
    label: 'Tiền sử & dị ứng',
    icon: Heart
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

      // Only add fields that have actual values
      if (formData.fullName && formData.fullName.trim()) {
        updateData.fullName = formData.fullName.trim();
      }
      if (formData.gender) {
        updateData.gender = mapGenderForAPI(formData.gender);
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

      // Debug log
      console.log('Sending update data:', updateData);
      console.log('Original dateOfBirth:', formData.dateOfBirth);
      console.log('Formatted dob for API:', updateData.dob);

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

  // Helper function to convert gender display value to API value
  const mapGenderForAPI = (displayGender: string): string => {
    switch (displayGender) {
      case 'Nam':
        return 'MALE';
      case 'Nữ':
        return 'FEMALE';
      default:
        return displayGender; // Return as-is if unknown
    }
  };

  // Helper function to convert gender API value to display value
  const mapGenderFromAPI = (apiGender: string): string => {
    switch (apiGender) {
      case 'MALE':
        return 'Nam';
      case 'FEMALE':
        return 'Nữ';
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
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        setAvatar(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
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
                <th className="text-left py-4 px-4 font-semibold text-[#0F172A]">eGFR</th>
                <th className="text-left py-4 px-4 font-semibold text-[#0F172A]">Creatinine</th>
                <th className="text-left py-4 px-4 font-semibold text-[#0F172A]">BUN</th>
                <th className="text-left py-4 px-4 font-semibold text-[#0F172A]">Huyết áp</th>
              </tr>
            </thead>
            <tbody>
              {testResults.map((result, index) => <tr key={result.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index === 0 ? 'bg-blue-50' : ''}`}>
                  <td className="py-4 px-4 text-[#0F172A] font-medium">{result.date}</td>
                  <td className="py-4 px-4 text-[#0F172A]">{result.egfr}</td>
                  <td className="py-4 px-4 text-[#0F172A]">{result.creatinine}</td>
                  <td className="py-4 px-4 text-[#0F172A]">{result.bun}</td>
                  <td className="py-4 px-4 text-[#0F172A]">{result.bloodPressure}</td>
                </tr>)}
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
              </div>
              {isEditing && <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-shadow">
                  <Camera size={12} className="text-[#1E75FF]" />
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
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
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select> : <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-2xl">
                <UserIcon size={20} className="text-[#334155]" />
                <span className="text-[#0F172A]">{formData.gender || 'Chưa cập nhật'}</span>
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
  const renderMedicalHistory = () => <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Tiền sử bệnh & Dị ứng</h2>
      </div>

      {/* Current Medications */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-500" />
            Đang dùng thuốc
          </h3>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
            <Plus className="w-4 h-4 mr-1" />
            Thêm thuốc mới
          </button>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div>
                <p className="font-medium text-gray-900">Penicillin</p>
                <p className="text-sm text-gray-600">Sử dụng từ ngày 15/6/2023</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                Dị ứng
              </span>
              <button className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-200">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div>
                <p className="font-medium text-gray-900">Aspirin</p>
                <p className="text-sm text-gray-600">Sử dụng từ ngày 20/7/2023</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs rounded-full font-medium">
                Cảnh báo
              </span>
              <button className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Medical History */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-500" />
            Tiền sử bệnh án
          </h3>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Thêm mới</span>
          </button>
        </div>
        
        <div className="space-y-4">
          {medicalHistory.map((history, index) => <div key={history.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">{index + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 mb-1">
                  {history.condition}
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  Chẩn đoán: {new Date(history.diagnosedDate).toLocaleDateString('vi-VN')}
                </p>
                {history.notes && <p className="text-sm text-gray-600 mb-3">
                    {history.notes}
                  </p>}
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(history.status)}`}>
                  {history.status === 'active' ? 'Đang điều trị' : history.status === 'chronic' ? 'Mạn tính' : 'Đã khỏi'}
                </span>
              </div>
            </div>)}
        </div>
      </div>

      {/* Allergies */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Dị ứng</h3>
          <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Thêm dị ứng</span>
          </button>
        </div>
        
        <div className="space-y-4">
          {allergies.map((allergy, index) => <div key={allergy.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">{index + 1}</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">
                  {allergy.allergen}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {allergy.reaction}
                </p>
                <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(allergy.severity)}`}>
                  {allergy.severity === 'mild' ? 'Nhẹ' : allergy.severity === 'moderate' ? 'Trung bình' : 'Nặng'}
                </span>
              </div>
            </div>)}
        </div>
      </div>
    </div>;
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
    setIsAddingTest(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create new test result
    const newResult: TestResult = {
      id: Date.now().toString(),
      date: newTestData.date,
      egfr: `${newTestData.egfr} ml/min`,
      creatinine: `${newTestData.creatinine} mg/dL`,
      bun: `${newTestData.bun} mg/dL`,
      bloodPressure: `${newTestData.systolic}/${newTestData.diastolic} mmHg`
    };

    // Add to results and sort by date (newest first)
    setTestResults(prev => {
      const updated = [newResult, ...prev];
      return updated.sort((a, b) => {
        const dateA = new Date(a.date.split('/').reverse().join('-'));
        const dateB = new Date(b.date.split('/').reverse().join('-'));
        return dateB.getTime() - dateA.getTime();
      });
    });

    // Reset form and close modal
    setNewTestData({
      date: '',
      egfr: '',
      creatinine: '',
      bun: '',
      systolic: '',
      diastolic: ''
    });
    setIsAddingTest(false);
    setShowTestModal(false);

    // Show success notification
    setShowSuccessNotification(true);
    setTimeout(() => setShowSuccessNotification(false), 3000);
  };
  const handleCancelAddTest = () => {
    setNewTestData({
      date: '',
      egfr: '',
      creatinine: '',
      bun: '',
      systolic: '',
      diastolic: ''
    });
    setShowTestModal(false);
  };
  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
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
      <div className="p-6 max-w-4xl mx-auto">
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
      <div className="p-6 max-w-4xl mx-auto">
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

  return <div className="p-6 max-w-4xl mx-auto">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#334155] mb-2">
                      Ngày xét nghiệm <span className="text-red-500">*</span>
                    </label>
                    <input type="date" value={newTestData.date} onChange={e => handleNewTestInputChange('date', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent transition-all" required />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#334155] mb-2">
                      eGFR (ml/min) <span className="text-red-500">*</span>
                    </label>
                    <input type="number" step="0.1" value={newTestData.egfr} onChange={e => handleNewTestInputChange('egfr', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent transition-all" placeholder="45.0" required />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#334155] mb-2">
                      Creatinine (mg/dL) <span className="text-red-500">*</span>
                    </label>
                    <input type="number" step="0.1" value={newTestData.creatinine} onChange={e => handleNewTestInputChange('creatinine', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent transition-all" placeholder="1.8" required />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#334155] mb-2">
                      BUN (mg/dL) <span className="text-red-500">*</span>
                    </label>
                    <input type="number" step="0.1" value={newTestData.bun} onChange={e => handleNewTestInputChange('bun', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent transition-all" placeholder="28.0" required />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#334155] mb-2">
                      Huyết áp tâm thu (mmHg) <span className="text-red-500">*</span>
                    </label>
                    <input type="number" value={newTestData.systolic} onChange={e => handleNewTestInputChange('systolic', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent transition-all" placeholder="140" required />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#334155] mb-2">
                      Huyết áp tâm trương (mmHg) <span className="text-red-500">*</span>
                    </label>
                    <input type="number" value={newTestData.diastolic} onChange={e => handleNewTestInputChange('diastolic', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent transition-all" placeholder="85" required />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={handleCancelAddTest} className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 transition-colors font-medium">
                    Hủy
                  </button>
                  <button type="submit" disabled={isAddingTest} className="flex-1 px-6 py-3 bg-[#1E75FF] text-white rounded-2xl hover:bg-[#1659C9] transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50">
                    {isAddingTest ? <>
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