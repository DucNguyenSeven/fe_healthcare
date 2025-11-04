'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, Upload, Save, Camera, CheckCircle, Plus, Award, X, Calendar, MapPin, Briefcase, Stethoscope, DollarSign, Edit } from 'lucide-react';
import { useGetDoctorById } from '@/hooks/auth/useGetDoctorById';
import { useUpdateUser } from '@/hooks/auth/useUpdateUser';
import { useUpdateAvatar } from '@/hooks/auth/useUpdateAvatar';
import { useUpdateDoctor } from '@/hooks/auth/useUpdateDoctor';
import { useCertificationList, type AddCertificationRequest } from '@/hooks/certification';
import type { UpdateCertificationRequest } from '@/lib/api/certification';
import type { Certification } from '@/lib/api/certification';
import type { UpdateUserRequest, UpdateDoctorRequest } from '@/lib/api/types';
const currentYear = new Date().getFullYear();
const years = Array.from({
  length: 50
}, (_, i) => currentYear - i);
// Certificate interface now imported from certification hooks

// @component: DoctorProfilePage
export const DoctorProfilePage = () => {
  // Get full doctor data from API (bao gồm thông tin chuyên môn và certifications)
  const { data: doctor, isLoading, error, refetch } = useGetDoctorById();
  
  // Update user hook
  const { updateUser, isLoading: isUpdating, error: updateError } = useUpdateUser();
  
  // Update doctor hook
  const { updateDoctor, isLoading: isUpdatingDoctor, error: updateDoctorError } = useUpdateDoctor();
  
  // Update avatar hook
  const { updateAvatar, isLoading: isUploadingAvatar, error: avatarError, progress } = useUpdateAvatar();
  
  // Certification management hooks - vẫn dùng hook này để xử lý add/update/delete
  // Nhưng certifications sẽ được lấy từ doctor response thay vì gọi API riêng
  const {
    certifications: certificationsFromHook,
    isLoading: isCertificationsLoading,
    isAdding: isAddingCertification,
    isUpdating: isUpdatingCertification,
    isDeleting: isDeletingCertification,
    addCertification,
    updateCertification,
    deleteCertification,
    addError: certificationAddError,
    updateError: certificationUpdateError,
    deleteError: certificationDeleteError,
    resetAddError,
    resetUpdateError,
    resetDeleteError,
    refetch: refetchCertifications,
  } = useCertificationList(doctor?.userId || '');
  
  // Ưu tiên dùng certifications từ doctor response, fallback về hook nếu chưa có
  const certifications = doctor?.certifications || certificationsFromHook;

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    introduction: ''
  });
  
  // Doctor professional information state
  const [doctorData, setDoctorData] = useState({
    specialty: '',
    experienceYears: 0,
    examinationFee: 0,
    clinicAddress: ''
  });
  // Certificates now managed by API hooks
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showEditCertificateModal, setShowEditCertificateModal] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<Certification | null>(null);
  const [newCertificate, setNewCertificate] = useState({
    name: '',
    issuingOrganization: '',
    yearIssued: currentYear
  });
  const [editCertificate, setEditCertificate] = useState({
    name: '',
    issuingOrganization: '',
    yearIssued: currentYear
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showUpdateSuccessNotification, setShowUpdateSuccessNotification] = useState(false);
  const [showUpdateErrorNotification, setShowUpdateErrorNotification] = useState(false);
  const [showAvatarSuccessNotification, setShowAvatarSuccessNotification] = useState(false);
  const [showAvatarErrorNotification, setShowAvatarErrorNotification] = useState(false);
  const [showCertificationSuccessNotification, setShowCertificationSuccessNotification] = useState(false);
  const [showCertificationErrorNotification, setShowCertificationErrorNotification] = useState(false);
  const [dateError, setDateError] = useState<string>('');

  // Update form data và doctor data when doctor data is loaded
  useEffect(() => {
    if (doctor) {
      const formatDate = (dateString: string | null) => {
        if (!dateString) return '';
        try {
          const date = new Date(dateString);
          return date.toLocaleDateString('vi-VN');
        } catch {
          return '';
        }
      };

      // Populate formData (thông tin cá nhân)
      setFormData({
        fullName: doctor.fullName || '',
        email: doctor.email || '',
        phone: doctor.phone || '',
        dateOfBirth: formatDate(doctor.dob),
        gender: mapGenderFromAPI(doctor.gender || ''),
        address: doctor.address || '',
        introduction: doctor.bio || '' // Lấy từ bio field
      });
      
      // Populate doctorData (thông tin chuyên môn) - QUAN TRỌNG: Đây là phần đang thiếu
      setDoctorData({
        specialty: doctor.specialty || '',
        experienceYears: doctor.experienceYears || 0,
        examinationFee: doctor.examinationFee || 0,
        clinicAddress: doctor.clinicAddress || ''
      });
      
      // Set avatar if available
      if (doctor.avatarUrl) {
        setAvatar(doctor.avatarUrl);
      }
    }
  }, [doctor]);

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
    if (!doctor?.userId) {
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
      // Prepare user data for API - only include fields that have values
      const updateData: UpdateUserRequest = {
        userId: doctor.userId,
      };

      // Add fields that have actual values
      if (formData.fullName && formData.fullName.trim()) {
        updateData.fullName = formData.fullName.trim();
      }
      if (formData.gender) {
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
      updateData.role = 'DOCTOR';

      // Prepare doctor data for API
      const doctorUpdateData: UpdateDoctorRequest = {
        userId: doctor.userId,
      };

      // Add doctor fields that have actual values
      if (doctorData.specialty && doctorData.specialty.trim()) {
        doctorUpdateData.specialty = doctorData.specialty.trim();
      }
      if (doctorData.experienceYears > 0) {
        doctorUpdateData.experienceYears = doctorData.experienceYears;
      }
      if (doctorData.examinationFee > 0) {
        doctorUpdateData.examinationFee = doctorData.examinationFee;
      }
      if (doctorData.clinicAddress && doctorData.clinicAddress.trim()) {
        doctorUpdateData.clinicAddress = doctorData.clinicAddress.trim();
      }
      if (formData.introduction && formData.introduction.trim()) {
        doctorUpdateData.bio = formData.introduction.trim();
      }

      // Check if there are any fields to update
      const userFieldsToUpdate = Object.keys(updateData).filter(key => key !== 'userId' && key !== 'role');
      const doctorFieldsToUpdate = Object.keys(doctorUpdateData).filter(key => key !== 'userId');
      
      if (userFieldsToUpdate.length === 0 && doctorFieldsToUpdate.length === 0) {
        // No fields to update, just exit edit mode
        setIsEditing(false);
        setShowUpdateSuccessNotification(true);
        setTimeout(() => setShowUpdateSuccessNotification(false), 3000);
        return;
      }

      // Call both APIs
      const promises = [];
      
      if (userFieldsToUpdate.length > 0) {
        promises.push(updateUser(updateData));
      }
      
      if (doctorFieldsToUpdate.length > 0) {
        promises.push(updateDoctor(doctorUpdateData));
      }

      const results = await Promise.all(promises);
      const allSuccessful = results.every(result => result !== null);

      if (allSuccessful) {
        // Success - refetch doctor data và certifications để lấy thông tin mới nhất
        await refetch();
        await refetchCertifications();
        setIsEditing(false);
        setShowUpdateSuccessNotification(true);
        setTimeout(() => setShowUpdateSuccessNotification(false), 3000);
      } else {
        // Error - show error notification
        setShowUpdateErrorNotification(true);
        setTimeout(() => setShowUpdateErrorNotification(false), 3000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
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
    if (doctor) {
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
        fullName: doctor.fullName || '',
        email: doctor.email || '',
        phone: doctor.phone || '',
        dateOfBirth: formatDate(doctor.dob),
        gender: mapGenderFromAPI(doctor.gender || ''),
        address: doctor.address || '',
        introduction: doctor.bio || ''
      });
      
      // Reset doctor data to original values
      setDoctorData({
        specialty: doctor.specialty || '',
        experienceYears: doctor.experienceYears || 0,
        examinationFee: doctor.examinationFee || 0,
        clinicAddress: doctor.clinicAddress || ''
      });
    }
    setDateError(''); // Clear date error
    setIsEditing(false);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !doctor?.userId) {
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
      const avatarUrl = await updateAvatar(doctor.userId, file);
      
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
          setAvatar(doctor.avatarUrl || null);
          setShowAvatarErrorNotification(true);
          setTimeout(() => setShowAvatarErrorNotification(false), 3000);
        }
      } catch (error) {
        console.error('Error uploading avatar:', error);
        // Revert to original avatar
        setAvatar(doctor.avatarUrl || null);
      setShowAvatarErrorNotification(true);
      setTimeout(() => setShowAvatarErrorNotification(false), 3000);
    }
    
    // Clear the input value so the same file can be selected again
    event.target.value = '';
  };
  const handleAddCertificate = async () => {
    if (!doctor?.userId) {
      setShowCertificationErrorNotification(true);
      setTimeout(() => setShowCertificationErrorNotification(false), 3000);
      return;
    }
    
    if (newCertificate.name.trim() && newCertificate.issuingOrganization.trim()) {
      const certData: AddCertificationRequest = {
        name: newCertificate.name.trim(),
        issuingOrganization: newCertificate.issuingOrganization.trim(),
        yearIssued: newCertificate.yearIssued
      };
      
      try {
        await addCertification(certData);
        
        // Refetch doctor data để lấy certifications mới nhất
        await refetch();
        
        // Reset form and close modal
        setNewCertificate({
          name: '',
          issuingOrganization: '',
          yearIssued: currentYear
        });
        setShowCertificateModal(false);
        
        // Show success notification
        setShowCertificationSuccessNotification(true);
        setTimeout(() => setShowCertificationSuccessNotification(false), 3000);
        
      } catch (error) {
        setShowCertificationErrorNotification(true);
        setTimeout(() => setShowCertificationErrorNotification(false), 3000);
      }
    }
  };

  const handleEditCertificate = (certificate: Certification) => {
    setEditingCertificate(certificate);
    setEditCertificate({
      name: certificate.name,
      issuingOrganization: certificate.issuingOrganization,
      yearIssued: certificate.yearIssued
    });
    setShowEditCertificateModal(true);
  };

  const handleUpdateCertificate = async () => {
    if (!doctor?.userId || !editingCertificate) {
      setShowCertificationErrorNotification(true);
      setTimeout(() => setShowCertificationErrorNotification(false), 3000);
      return;
    }
    
    if (editCertificate.name.trim() && editCertificate.issuingOrganization.trim()) {
      const certData: UpdateCertificationRequest = {
        name: editCertificate.name.trim(),
        issuingOrganization: editCertificate.issuingOrganization.trim(),
        yearIssued: editCertificate.yearIssued
      };
      
      try {
        await updateCertification({ certificationId: editingCertificate.id, certData });
        
        // Refetch doctor data để lấy certifications mới nhất
        await refetch();
        
        // Close modal and reset
        setShowEditCertificateModal(false);
        setEditingCertificate(null);
        setEditCertificate({
          name: '',
          issuingOrganization: '',
          yearIssued: currentYear
        });
        
        // Show success notification
        setShowCertificationSuccessNotification(true);
        setTimeout(() => setShowCertificationSuccessNotification(false), 3000);
        
      } catch (error) {
        setShowCertificationErrorNotification(true);
        setTimeout(() => setShowCertificationErrorNotification(false), 3000);
      }
    }
  };
  const handleDeleteCertificate = async (id: string) => {
    if (!doctor?.userId) {
      setShowCertificationErrorNotification(true);
      setTimeout(() => setShowCertificationErrorNotification(false), 3000);
      return;
    }
    
    try {
      await deleteCertification(id);
      
      // Refetch doctor data để lấy certifications mới nhất
      await refetch();
      
      setShowDeleteConfirm(null);
      
      // Show success notification
      setShowCertificationSuccessNotification(true);
      setTimeout(() => setShowCertificationSuccessNotification(false), 3000);
      
    } catch (error) {
      setShowDeleteConfirm(null);
      setShowCertificationErrorNotification(true);
      setTimeout(() => setShowCertificationErrorNotification(false), 3000);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-[#1E75FF] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">Đang tải thông tin bác sĩ...</p>
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
            <p className="text-gray-600 mb-4">Đã xảy ra lỗi khi tải thông tin bác sĩ. Vui lòng thử lại sau.</p>
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

  // No doctor data
  if (!doctor) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-gray-400 text-5xl mb-4">👨‍⚕️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy thông tin bác sĩ</h3>
            <p className="text-gray-600">Vui lòng đăng nhập lại để xem thông tin cá nhân.</p>
          </div>
        </div>
      </div>
    );
  }

  // @return
  return <div className="p-6 max-w-4xl mx-auto">
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
            <CheckCircle size={20} />
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
            <CheckCircle size={20} />
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

      {/* Certification Success Notification */}
      <AnimatePresence>
        {showCertificationSuccessNotification && <motion.div initial={{
        opacity: 0,
        y: -50
      }} animate={{
        opacity: 1,
        y: 0
      }} exit={{
        opacity: 0,
        y: -50
      }} className="fixed top-4 right-4 z-[10001] bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
            <CheckCircle size={20} />
            <span>Cập nhật chứng chỉ thành công!</span>
          </motion.div>}
      </AnimatePresence>

      {/* Certification Error Notification */}
      <AnimatePresence>
        {showCertificationErrorNotification && <motion.div initial={{
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
            <span>{certificationAddError || certificationUpdateError || certificationDeleteError || 'Có lỗi xảy ra khi xử lý chứng chỉ. Vui lòng thử lại!'}</span>
          </motion.div>}
      </AnimatePresence>

      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} className="bg-white rounded-2xl shadow-[0_10px_24px_rgba(16,24,40,0.08)] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1E75FF] to-[#1659C9] p-6 text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                  {avatar ? <img src={avatar} alt="Avatar" className="w-full h-full object-cover" /> : <User size={28} className="text-white" />}
                  
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
                <p className="text-white/80 text-sm">Bác sĩ</p>
              </div>
            </div>
            <div className="flex gap-3">
              {!isEditing ?                 <button onClick={() => setIsEditing(true)} className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl font-medium transition-colors text-sm">
                  <span>Chỉnh sửa</span>
                </button> : <div className="flex gap-2">
                  <button onClick={handleCancel} className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl font-medium transition-colors text-sm">
                    <span>Hủy</span>
                  </button>
                  <button onClick={handleSave} disabled={isSaving || isUpdating || isUpdatingDoctor} className="bg-white text-[#1E75FF] hover:bg-gray-100 px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50 text-sm">
                    {(isSaving || isUpdating || isUpdatingDoctor) ? <div className="w-4 h-4 border-2 border-[#1E75FF] border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
                    <span>{(isSaving || isUpdating || isUpdatingDoctor) ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                  </button>
                </div>}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-8 space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-[#0F172A] border-b border-gray-100 pb-3">
              Thông tin cá nhân
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#334155]">
                  Họ và tên
                </label>
                {isEditing ? <input type="text" value={formData.fullName} onChange={e => handleInputChange('fullName', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent transition-all" /> : <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-2xl">
                    <User size={20} className="text-[#334155]" />
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
                    <User size={20} className="text-[#334155]" />
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

              <div className="space-y-2">
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


          {/* Professional Information */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-[#0F172A] border-b border-gray-100 pb-3">
              Thông tin chuyên môn
            </h2>
            
            {/* Introduction/Bio - Full width */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#334155]">
                Giới thiệu
              </label>
              {isEditing ? (
                <textarea 
                  value={formData.introduction} 
                  onChange={e => handleInputChange('introduction', e.target.value)} 
                  rows={4} 
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent transition-all resize-none" 
                  placeholder="Nhập giới thiệu về bản thân..."
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-2xl">
                  <p className="text-[#0F172A] leading-relaxed">{formData.introduction || 'Chưa có giới thiệu'}</p>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Specialty */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#334155]">
                  Chuyên khoa
                </label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={doctorData.specialty} 
                    onChange={e => setDoctorData(prev => ({ ...prev, specialty: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent transition-all" 
                    placeholder="Ví dụ: Tim mạch, Nhi khoa..."
                  />
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-2xl">
                    <Stethoscope size={20} className="text-[#334155]" />
                    <span className="text-[#0F172A]">{doctorData.specialty || 'Chưa cập nhật'}</span>
                  </div>
                )}
              </div>

              {/* Experience Years */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#334155]">
                  Số năm kinh nghiệm
                </label>
                {isEditing ? (
                  <input 
                    type="number" 
                    min="0"
                    max="50"
                    value={doctorData.experienceYears || ''} 
                    onChange={e => setDoctorData(prev => ({ ...prev, experienceYears: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent transition-all" 
                    placeholder="Số năm"
                  />
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-2xl">
                    <Briefcase size={20} className="text-[#334155]" />
                    <span className="text-[#0F172A]">{doctorData.experienceYears ? `${doctorData.experienceYears} năm` : 'Chưa cập nhật'}</span>
                  </div>
                )}
              </div>

              {/* Examination Fee */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#334155]">
                  Phí khám bệnh (VNĐ)
                </label>
                {isEditing ? (
                  <input 
                    type="number" 
                    min="0"
                    step="1000"
                    value={doctorData.examinationFee || ''} 
                    onChange={e => setDoctorData(prev => ({ ...prev, examinationFee: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent transition-all" 
                    placeholder="500000"
                  />
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-2xl">
                    <DollarSign size={20} className="text-[#334155]" />
                    <span className="text-[#0F172A]">
                      {doctorData.examinationFee ? 
                        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(doctorData.examinationFee)
                        : 'Chưa cập nhật'
                      }
                    </span>
                  </div>
                )}
              </div>

              {/* Clinic Address */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#334155]">
                  Địa chỉ phòng khám
                </label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={doctorData.clinicAddress} 
                    onChange={e => setDoctorData(prev => ({ ...prev, clinicAddress: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent transition-all" 
                    placeholder="Địa chỉ phòng khám của bạn"
                  />
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-2xl">
                    <MapPin size={20} className="text-[#334155]" />
                    <span className="text-[#0F172A]">{doctorData.clinicAddress || 'Chưa cập nhật'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Professional Certificates */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-2xl font-semibold text-[#0F172A]">
                Chứng chỉ chuyên môn
              </h2>
              <button 
                onClick={() => setShowCertificateModal(true)} 
                disabled={isAddingCertification}
                className="bg-[#1E75FF] hover:bg-[#1659C9] text-white px-4 py-2 rounded-2xl font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingCertification ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang thêm...</span>
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    <span>Thêm chứng chỉ mới</span>
                  </>
                )}
              </button>
            </div>
            
            {(certifications || []).length === 0 ? <div className="text-center py-12 bg-gray-50 rounded-2xl">
                <Award size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-[#334155] mb-4">Chưa có chứng chỉ nào</p>
                <button 
                  onClick={() => setShowCertificateModal(true)} 
                  disabled={isAddingCertification}
                  className="bg-[#1E75FF] hover:bg-[#1659C9] text-white px-6 py-3 rounded-2xl font-medium flex items-center gap-2 mx-auto transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAddingCertification ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Đang thêm...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={20} />
                      <span>Thêm chứng chỉ mới</span>
                    </>
                  )}
                </button>
              </div> : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(certifications || []).map((certificate: Certification) => <motion.div key={certificate.id} initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow relative group">
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEditCertificate(certificate)} 
                        disabled={isUpdatingCertification}
                        className="w-8 h-8 bg-[#1E75FF] hover:bg-[#1659C9] text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                        title="Chỉnh sửa chứng chỉ"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => setShowDeleteConfirm(certificate.id)} 
                        disabled={isDeletingCertification}
                        className="w-8 h-8 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                        title="Xóa chứng chỉ"
                      >
                        {isDeletingCertification && showDeleteConfirm === certificate.id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <X size={16} />
                        )}
                      </button>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-[#1E75FF]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Award size={24} className="text-[#1E75FF]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[#0F172A] mb-2 pr-20">{certificate.name}</h3>
                        <p className="text-sm text-[#334155] mb-1">{certificate.issuingOrganization}</p>
                        <div className="flex items-center gap-1 text-sm text-[#334155]">
                          <Calendar size={14} />
                          <span>Năm {certificate.yearIssued}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>)}
              </div>}
          </div>
        </div>

        {/* Certificate Modal */}
        <AnimatePresence>
          {showCertificateModal && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <motion.div initial={{
            opacity: 0,
            scale: 0.95
          }} animate={{
            opacity: 1,
            scale: 1
          }} exit={{
            opacity: 0,
            scale: 0.95
          }} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-[0_10px_24px_rgba(16,24,40,0.08)]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-[#0F172A]">Thêm chứng chỉ mới</h3>
                  <button onClick={() => setShowCertificateModal(false)} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                    <X size={16} className="text-[#334155]" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#334155] mb-2">
                      Tên chứng chỉ
                    </label>
                    <input type="text" value={newCertificate.name} onChange={e => setNewCertificate(prev => ({
                  ...prev,
                  name: e.target.value
                }))} className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent transition-all" placeholder="Nhập tên chứng chỉ..." />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#334155] mb-2">
                      Cơ quan cấp
                    </label>
                    <input type="text" value={newCertificate.issuingOrganization} onChange={e => setNewCertificate(prev => ({
                  ...prev,
                  issuingOrganization: e.target.value
                }))} className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent transition-all" placeholder="Nhập cơ quan cấp..." />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#334155] mb-2">
                      Năm cấp
                    </label>
                    <select value={newCertificate.yearIssued} onChange={e => setNewCertificate(prev => ({
                  ...prev,
                  yearIssued: parseInt(e.target.value)
                }))} className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent transition-all">
                      {years.map(year => <option key={year} value={year}>{year}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setShowCertificateModal(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-[#334155] py-3 rounded-2xl font-medium transition-colors">
                    Hủy
                  </button>
                  <button 
                    onClick={handleAddCertificate} 
                    disabled={!newCertificate.name.trim() || !newCertificate.issuingOrganization.trim() || isAddingCertification} 
                    className="flex-1 bg-[#1E75FF] hover:bg-[#1659C9] text-white py-3 rounded-2xl font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAddingCertification ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Đang lưu...</span>
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        <span>Lưu chứng chỉ</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>}
        </AnimatePresence>

        {/* Edit Certificate Modal */}
        <AnimatePresence>
          {showEditCertificateModal && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <motion.div initial={{
            opacity: 0,
            scale: 0.95
          }} animate={{
            opacity: 1,
            scale: 1
          }} exit={{
            opacity: 0,
            scale: 0.95
          }} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-[0_10px_24px_rgba(16,24,40,0.08)]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-[#0F172A]">Chỉnh sửa chứng chỉ</h3>
                  <button onClick={() => setShowEditCertificateModal(false)} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                    <X size={16} className="text-[#334155]" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#334155] mb-2">
                      Tên chứng chỉ
                    </label>
                    <input 
                      type="text" 
                      value={editCertificate.name} 
                      onChange={e => setEditCertificate(prev => ({
                        ...prev,
                        name: e.target.value
                      }))} 
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent transition-all" 
                      placeholder="Nhập tên chứng chỉ..." 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#334155] mb-2">
                      Cơ quan cấp
                    </label>
                    <input 
                      type="text" 
                      value={editCertificate.issuingOrganization} 
                      onChange={e => setEditCertificate(prev => ({
                        ...prev,
                        issuingOrganization: e.target.value
                      }))} 
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent transition-all" 
                      placeholder="Nhập cơ quan cấp..." 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#334155] mb-2">
                      Năm cấp
                    </label>
                    <select 
                      value={editCertificate.yearIssued} 
                      onChange={e => setEditCertificate(prev => ({
                        ...prev,
                        yearIssued: parseInt(e.target.value)
                      }))} 
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent transition-all"
                    >
                      {years.map(year => <option key={year} value={year}>{year}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button 
                    onClick={() => setShowEditCertificateModal(false)} 
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-[#334155] py-3 rounded-2xl font-medium transition-colors"
                  >
                    Hủy
                  </button>
                  <button 
                    onClick={handleUpdateCertificate} 
                    disabled={!editCertificate.name.trim() || !editCertificate.issuingOrganization.trim() || isUpdatingCertification} 
                    className="flex-1 bg-[#1E75FF] hover:bg-[#1659C9] text-white py-3 rounded-2xl font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdatingCertification ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Đang lưu...</span>
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        <span>Lưu thay đổi</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <motion.div initial={{
            opacity: 0,
            scale: 0.95
          }} animate={{
            opacity: 1,
            scale: 1
          }} exit={{
            opacity: 0,
            scale: 0.95
          }} className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-[0_10px_24px_rgba(16,24,40,0.08)]">
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#EF4444]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X size={32} className="text-[#EF4444]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#0F172A] mb-2">Xóa chứng chỉ</h3>
                  <p className="text-[#334155] mb-6">Bạn có chắc chắn muốn xóa chứng chỉ này không? Hành động này không thể hoàn tác.</p>
                  
                  <div className="flex gap-3">
                    <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-[#334155] py-3 rounded-2xl font-medium transition-colors">
                      Hủy
                    </button>
                    <button 
                      onClick={() => handleDeleteCertificate(showDeleteConfirm)} 
                      disabled={isDeletingCertification}
                      className="flex-1 bg-[#EF4444] hover:bg-[#DC2626] text-white py-3 rounded-2xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isDeletingCertification ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Đang xóa...</span>
                        </>
                      ) : (
                        'Xóa'
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>}
        </AnimatePresence>
      </motion.div>
    </div>;
};