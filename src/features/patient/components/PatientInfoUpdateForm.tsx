"use client";

import React, { useState, useRef } from "react";
import {
  User as UserIcon,
  Camera,
  Save,
  AlertCircle,
} from "lucide-react";
import { Alert, Snackbar } from "@mui/material";
import { User } from "../types";
import { FormInput, FormTextArea, FormSelect } from "../../../components/ui/FormInput";
import { PatientFormData } from "../hooks/usePatientInfoForm";
import { calculateBMI, getBMICategory } from "../../../utils/formatting";
import { useUpdateUser } from "../../../hooks/auth";

interface PatientInfoUpdateFormProps {
  user?: Partial<User>;
  onSubmit: (data: PatientFormData) => void;
  onClose?: () => void;
  onSkip?: () => void;
  isFirstTime?: boolean;
}


export function PatientInfoUpdateForm({
  user = {},
  onSubmit,
  onClose,
  onSkip,
  isFirstTime = false,
}: PatientInfoUpdateFormProps) {
  const { updateUser, isLoading: isUpdating, error: updateError } = useUpdateUser();
  
  const [formData, setFormData] = useState<PatientFormData>({
    avatar: user.avatar || "",
    name: user.name || "",
    gender: "male",
    dateOfBirth: "",
    phone: user.phone || "",
    email: user.email || "",
    address: "",
    height: "",
    weight: "",
    bmi: "",
    bloodType: "",
  });

  const [errors, setErrors] = useState<Partial<PatientFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(
    typeof user.avatar === "string" ? user.avatar : ""
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateForm = (): boolean => {
    const newErrors: Partial<PatientFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Họ và tên là bắt buộc";
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Ngày sinh là bắt buộc";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Số điện thoại là bắt buộc";
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Địa chỉ là bắt buộc";
    }

    // Chỉ validate thông tin sức khỏe khi không phải lần đầu đăng nhập
    if (!isFirstTime) {
      if (!formData.height.trim()) {
        newErrors.height = "Chiều cao là bắt buộc";
      } else if (!/^[0-9]{1,3}$/.test(formData.height) || parseInt(formData.height) < 50 || parseInt(formData.height) > 250) {
        newErrors.height = "Chiều cao không hợp lệ (50-250cm)";
      }

      if (!formData.weight.trim()) {
        newErrors.weight = "Cân nặng là bắt buộc";
      } else if (!/^[0-9]{1,3}$/.test(formData.weight) || parseInt(formData.weight) < 20 || parseInt(formData.weight) > 200) {
        newErrors.weight = "Cân nặng không hợp lệ (20-200kg)";
      }

      if (!formData.bloodType.trim()) {
        newErrors.bloodType = "Nhóm máu là bắt buộc";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors({ ...errors, avatar: "Kích thước file không được vượt quá 5MB" });
        return;
      }

      if (!file.type.startsWith("image/")) {
        setErrors({ ...errors, avatar: "Chỉ chấp nhận file hình ảnh" });
        return;
      }

      setFormData({ ...formData, avatar: file });
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      if (errors.avatar) {
        setErrors({ ...errors, avatar: undefined });
      }
    }
  };

  // Function to calculate BMI automatically
  const calculateAndUpdateBMI = (height: string, weight: string) => {
    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);
    
    if (heightNum > 0 && weightNum > 0) {
      const bmi = calculateBMI(heightNum, weightNum);
      return bmi.toString();
    }
    return "";
  };

  const handleInputChange = (field: keyof PatientFormData, value: string) => {
    const newFormData = { ...formData, [field]: value };
    
    // Auto-calculate BMI when height or weight changes
    if (field === "height" || field === "weight") {
      const height = field === "height" ? value : formData.height;
      const weight = field === "weight" ? value : formData.weight;
      const calculatedBMI = calculateAndUpdateBMI(height, weight);
      newFormData.bmi = calculatedBMI;
    }
    
    setFormData(newFormData);
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Chuẩn bị dữ liệu cho API update user
      const updateData = {
        userId: user.id || '',
        fullName: formData.name,
        gender: formData.gender.toUpperCase(), // Chuyển thành uppercase như backend yêu cầu
        dob: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : undefined,
        phone: formData.phone,
        address: formData.address,
        role: 'PATIENT' // Mặc định role là PATIENT
      };

      // Kiểm tra dữ liệu bắt buộc
      if (!updateData.userId) {
        alert('Không tìm thấy ID người dùng. Vui lòng đăng nhập lại.');
        return;
      }

      // Debug: Log dữ liệu gửi lên API
      console.log('Sending update data:', updateData);
      console.log('User object:', user);

      // Gọi API update user
      const result = await updateUser(updateData);
      
      if (result) {
        // Nếu update thành công, hiển thị thông báo và đóng form
        setSuccessMessage('Cập nhật thông tin thành công!');
        
        // Gọi onSubmit với formData
        onSubmit(formData);
        
        // Đóng form sau 2 giây
        setTimeout(() => {
          if (isFirstTime) {
            onSkip?.();
          } else {
            onClose?.();
          }
        }, 2000);
      } else {
        // Nếu update thất bại, hiển thị lỗi
        console.error('Update user failed:', updateError);
        alert(updateError || 'Có lỗi xảy ra khi cập nhật thông tin');
      }
    } catch (error) {
      console.error("Form submission error:", error);
      alert('Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      // Xác thực người dùng trước khi skip
      if (isFirstTime) {
        // Kiểm tra xác thực người dùng - sử dụng user context thay vì token
        if (!user || !user.id) {
          console.warn('User not authenticated, cannot skip form');
          // Hiển thị thông báo cho người dùng
          alert('Vui lòng đăng nhập để tiếp tục sử dụng ứng dụng');
          return;
        }

        // Lấy user ID từ context
        const userId = user.id || 'unknown';
        
        // Lưu trạng thái đã bỏ qua form với timestamp và metadata
        const skipData = {
          skipped: true,
          timestamp: new Date().toISOString(),
          userId: userId,
          userAgent: navigator.userAgent,
          sessionId: Date.now().toString()
        };
        localStorage.setItem('patient_info_form_skipped', JSON.stringify(skipData));
        
        // Log skip event for analytics/audit
        console.log('Patient info form skipped:', skipData);
        
        // Có thể gửi event đến analytics service
        // await sendAnalyticsEvent('form_skipped', skipData);
        
        onSkip?.();
      } else {
        // Đối với form cập nhật thông thường, chỉ cần đóng
        onClose?.();
      }
    } catch (error) {
      console.error('Error handling skip:', error);
      // Fallback: vẫn cho phép đóng form nhưng log lỗi
      console.warn('Fallback: allowing form close despite error');
      if (isFirstTime) {
        onSkip?.();
      } else {
        onClose?.();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {isFirstTime ? "Hoàn thiện thông tin cá nhân" : "Cập nhật thông tin"}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {isFirstTime 
                  ? "Vui lòng cập nhật thông tin để chúng tôi có thể phục vụ bạn tốt hơn"
                  : "Cập nhật thông tin cá nhân của bạn"
                }
              </p>
            </div>
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cập nhật sau
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 p-4 overflow-y-auto">
          <div className="min-h-full flex flex-col">
            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative group">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-8 h-8 text-blue-500" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110"
                  title="Thay đổi ảnh đại diện"
                >
                  <Camera className="w-4 h-4 text-white" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Nhấn vào camera để thay đổi ảnh
              </p>
            </div>
            
            {errors.avatar && (
              <div className="text-center mb-3">
                <p className="text-red-500 text-sm flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.avatar as string}
                </p>
              </div>
            )}

            {/* Main Content in 2 columns */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              
              {/* Left Column */}
              <div className="space-y-4">
                {/* Basic Information */}
                <div className="bg-gray-50 rounded-xl p-3">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Thông tin cơ bản
                  </h3>
                  <div className="space-y-3">
                    <FormInput
                      label="Họ và tên"
                      placeholder="Nhập họ và tên"
                      value={formData.name}
                      onChange={(value) => handleInputChange("name", value)}
                      error={errors.name}
                      required
                    />

                    <FormSelect
                      label="Giới tính"
                      value={formData.gender}
                      onChange={(value) => handleInputChange("gender", value)}
                      options={[
                        { value: "male", label: "Nam" },
                        { value: "female", label: "Nữ" },
                        { value: "other", label: "Khác" }
                      ]}
                      required
                    />

                    <FormInput
                      label="Ngày sinh"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(value) => handleInputChange("dateOfBirth", value)}
                      max={new Date().toISOString().split('T')[0]}
                      error={errors.dateOfBirth}
                      required
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-gray-50 rounded-xl p-3">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Thông tin liên hệ
                  </h3>
                  <div className="space-y-3">
                    <FormInput
                      label="Số điện thoại"
                      type="tel"
                      placeholder="0901234567"
                      value={formData.phone}
                      onChange={(value) => handleInputChange("phone", value)}
                      error={errors.phone}
                      required
                    />

                    <FormInput
                      label="Email"
                      type="email"
                      placeholder="nguyenvanan@email.com"
                      value={formData.email}
                      onChange={(value) => handleInputChange("email", value)}
                      error={errors.email}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Address */}
                <div className="bg-gray-50 rounded-xl p-3">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Địa chỉ
                  </h3>
                  <FormTextArea
                    label="Địa chỉ"
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    value={formData.address}
                    onChange={(value) => handleInputChange("address", value)}
                    rows={2}
                    error={errors.address}
                    required
                  />
                </div>

                {/* Health Information - Chỉ hiển thị khi không phải lần đầu đăng nhập */}
                {!isFirstTime && (
                  <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                      Thông tin sức khỏe
                    </h3>
                    <div className="space-y-3">
                      <FormInput
                        label="Chiều cao (cm)"
                        type="number"
                        placeholder="170"
                        value={formData.height}
                        onChange={(value) => handleInputChange("height", value)}
                        min="50"
                        max="250"
                        error={errors.height}
                        required
                      />

                      <FormInput
                        label="Cân nặng (kg)"
                        type="number"
                        placeholder="65"
                        value={formData.weight}
                        onChange={(value) => handleInputChange("weight", value)}
                        min="20"
                        max="200"
                        error={errors.weight}
                        required
                      />

                      {/* BMI Field - Read-only with auto-calculation */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Chỉ số BMI
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.bmi ? `${formData.bmi} kg/m²` : ""}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Tự động tính khi nhập chiều cao và cân nặng"
                          />
                          {formData.bmi && (
                            <div className="mt-1">
                              {(() => {
                                const bmiNum = parseFloat(formData.bmi);
                                const bmiInfo = getBMICategory(bmiNum);
                                return (
                                  <span className={`text-xs font-medium ${bmiInfo.color}`}>
                                    {bmiInfo.category} ({bmiInfo.description})
                                  </span>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      </div>

                      <FormSelect
                        label="Nhóm máu"
                        value={formData.bloodType}
                        onChange={(value) => handleInputChange("bloodType", value)}
                        options={[
                          { value: "A+", label: "A+" },
                          { value: "A-", label: "A-" },
                          { value: "B+", label: "B+" },
                          { value: "B-", label: "B-" },
                          { value: "AB+", label: "AB+" },
                          { value: "AB-", label: "AB-" },
                          { value: "O+", label: "O+" },
                          { value: "O-", label: "O-" }
                        ]}
                        placeholder="Chọn nhóm máu"
                        error={errors.bloodType}
                        required
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex-shrink-0 flex flex-col sm:flex-row gap-3 justify-end pt-6 border-t border-gray-200 mt-6">
              {!isFirstTime && onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Hủy
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading || isUpdating}
                className="flex items-center justify-center space-x-2 px-8 py-3 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg"
              >
                <Save className="w-4 h-4" />
                <span>{(isLoading || isUpdating) ? "Đang lưu..." : "Lưu thông tin"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert 
          onClose={() => setSuccessMessage(null)} 
          severity="success" 
          sx={{ width: "100%" }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}