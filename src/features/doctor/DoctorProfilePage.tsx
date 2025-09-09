import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Upload,
  Save,
  Camera,
  CheckCircle,
  Plus,
  Award,
  X,
  Calendar,
  Edit3,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import { useGetMe } from "@/hooks/auth/useGetMe";
import { useUpdateAvatar, useUpdateUser } from "@/hooks/auth";
import { Alert, Snackbar } from "@mui/material";
const specialties = [
  "Thận học",
  "Tim mạch",
  "Nội tiết",
  "Tiêu hóa",
  "Hô hấp",
  "Thần kinh",
  "Da liễu",
  "Mắt",
  "Tai mũi họng",
  "Xương khớp",
];
const subSpecialties = [
  "Bệnh thận mạn",
  "Lọc máu",
  "Ghép thận",
  "Sỏi thận",
  "Viêm thận",
  "Hội chứng thận hư",
  "Tăng huyết áp thận",
  "Rối loạn điện giải",
];
const currentYear = new Date().getFullYear();
const years = Array.from(
  {
    length: 50,
  },
  (_, i) => currentYear - i
);
interface Certificate {
  id: string;
  name: string;
  issuer: string;
  year: number;
}

// @component: DoctorProfilePage
export const DoctorProfilePage = () => {
  const { data: userData, refetch, isLoading: isLoadingUserData, error: userDataError } = useGetMe();
  const { updateAvatar, isLoading: isUploading, error: uploadError, progress: uploadProgress } = useUpdateAvatar();
  const { updateUser, isLoading: isUpdating, error: updateError } = useUpdateUser();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "MALE",
    address: "",
    mainSpecialty: "Thận học",
    subSpecialties: ["Bệnh thận mạn", "Lọc máu"],
    introduction:
      "Bác sĩ chuyên khoa Thận học với hơn 10 năm kinh nghiệm trong điều trị các bệnh lý thận mạn tính. Tốt nghiệp Đại học Y Hà Nội, có chứng chỉ chuyên khoa cấp II về Thận học.",
  });
  const [editFormData, setEditFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "MALE",
    address: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([
    {
      id: "1",
      name: "Chứng chỉ chuyên khoa cấp II Thận học",
      issuer: "Bộ Y tế",
      year: 2018,
    },
    {
      id: "2",
      name: "Chứng chỉ Lọc máu chu kỳ",
      issuer: "Đại học Y Hà Nội",
      year: 2020,
    },
    {
      id: "3",
      name: "Chứng chỉ Siêu âm Doppler thận",
      issuer: "Hội Siêu âm Y học Việt Nam",
      year: 2021,
    },
  ]);
  const [isEditing, setIsEditing] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [newCertificate, setNewCertificate] = useState({
    name: "",
    issuer: "",
    year: currentYear,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!editFormData.fullName.trim()) {
      newErrors.fullName = "Họ và tên là bắt buộc";
    }

    if (!editFormData.dateOfBirth) {
      newErrors.dateOfBirth = "Ngày sinh là bắt buộc";
    }

    if (!editFormData.phone.trim()) {
      newErrors.phone = "Số điện thoại là bắt buộc";
    } else if (!/^[0-9]{10,11}$/.test(editFormData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    if (!editFormData.email.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!editFormData.address.trim()) {
      newErrors.address = "Địa chỉ là bắt buộc";
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditInputChange = (field: string, value: string) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleEdit = () => {
    // Initialize form data with current user data
    setEditFormData({
      fullName: userData?.fullName || "",
      email: userData?.email || "",
      phone: userData?.phone || "",
      dateOfBirth: userData?.dob ? (typeof userData.dob === 'string' ? userData.dob.split('T')[0] : new Date(userData.dob).toISOString().split('T')[0]) : "",
      gender: userData?.gender?.toLowerCase() || "male",
      address: userData?.address || ""
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const updateData = {
        userId: userData?.userId || '',
        fullName: editFormData.fullName,
        gender: editFormData.gender.toUpperCase(),
        dob: editFormData.dateOfBirth ? new Date(editFormData.dateOfBirth).toISOString().split('T')[0] : undefined,
        phone: editFormData.phone,
        address: editFormData.address,
        role: 'DOCTOR'
      };

      const result = await updateUser(updateData);

      if (result) {
        // Fetch lại data của user để cập nhật UI
        await refetch();

        // Hiển thị thông báo thành công
        setSuccessMessage('Cập nhật thông tin thành công!');

        // Đóng form chỉnh sửa
        setIsEditing(false);

        // Tự động ẩn thông báo sau 3 giây
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        console.error('Update failed:', updateError);
        alert(updateError || 'Có lỗi xảy ra khi cập nhật thông tin');
      }
    } catch (error) {
      console.error("Form submission error:", error);
      alert('Có lỗi xảy ra khi cập nhật thông tin');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormErrors({});
    setEditFormData({
      fullName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      gender: "MALE",
      address: "",
    });
  };
  const handleSubSpecialtyToggle = (specialty: string) => {
    const current = formData.subSpecialties;
    const updated = current.includes(specialty)
      ? current.filter((s) => s !== specialty)
      : [...current, specialty];
    handleInputChange("subSpecialties", updated);
  };
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    if (userData?.userId) {
      try {
        const avatarUrl = await updateAvatar(userData.userId, file);
        if (avatarUrl) {
          setAvatarPreview(avatarUrl);
          setAvatar(avatarUrl);
          await refetch();
        }
      } catch (e) {
        // noop - errors surfaced via uploadError state
      }
    }
  };
  const handleAddCertificate = () => {
    if (newCertificate.name.trim() && newCertificate.issuer.trim()) {
      const certificate: Certificate = {
        id: Date.now().toString(),
        name: newCertificate.name.trim(),
        issuer: newCertificate.issuer.trim(),
        year: newCertificate.year,
      };
      setCertificates((prev) => [...prev, certificate]);
      setNewCertificate({
        name: "",
        issuer: "",
        year: currentYear,
      });
      setShowCertificateModal(false);
    }
  };
  const handleDeleteCertificate = (id: string) => {
    setCertificates((prev) => prev.filter((cert) => cert.id !== id));
    setShowDeleteConfirm(null);
  };

  // Update formData when userData changes
  useEffect(() => {
    if (userData) {
      setFormData(prev => ({
        ...prev,
        fullName: userData.fullName || prev.fullName,
        email: userData.email || prev.email,
        phone: userData.phone || prev.phone,
        dateOfBirth: userData.dob || prev.dateOfBirth,
        gender: userData.gender || prev.gender,
        address: userData.address || prev.address,
      }));
      setAvatarPreview(userData.avatarUrl || "");
    }
  }, [userData]);

  // Handle loading and error states
  if (isLoadingUserData) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-[0_10px_24px_rgba(16,24,40,0.08)] overflow-hidden">
          <div className="bg-gradient-to-r from-[#1E75FF] to-[#1659C9] p-8 text-white">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-lg animate-pulse">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              </div>
              <div>
                <div className="h-8 bg-gray-300 rounded-lg w-48 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-300 rounded-lg w-32 animate-pulse"></div>
              </div>
            </div>
          </div>
          <div className="p-8 space-y-8">
            <div className="h-32 bg-gray-100 rounded-2xl animate-pulse"></div>
            <div className="h-32 bg-gray-100 rounded-2xl animate-pulse"></div>
            <div className="h-32 bg-gray-100 rounded-2xl animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (userDataError) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-[0_10px_24px_rgba(16,24,40,0.08)] overflow-hidden">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Không thể tải thông tin người dùng
            </h3>
            <p className="text-gray-600 mb-6">
              Đã xảy ra lỗi khi tải thông tin tài khoản của bạn. Vui lòng thử lại sau.
            </p>
            <button
              onClick={() => refetch()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // @return
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="bg-white rounded-2xl shadow-[0_10px_24px_rgba(16,24,40,0.08)] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1E75FF] to-[#1659C9] p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                  {avatarPreview || avatar || userData?.avatarUrl ? (
                    <img
                      src={avatarPreview || avatar || (userData?.avatarUrl as string) || ""}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={32} className="text-blue-500" />
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                      <div className="text-white text-xs font-medium">{uploadProgress}%</div>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  disabled={isUploading}
                  className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110 ${
                    isUploading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                  title={isUploading ? "Đang upload..." : "Thay đổi ảnh đại diện"}
                >
                  <Camera className="w-4 h-4 text-white" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {userData?.fullName || formData.fullName || "Đang tải..."}
                </h1>
                <p className="text-white/80 text-lg">
                  {formData.mainSpecialty}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Chỉnh sửa</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={isUpdating}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isUpdating ? "Đang lưu..." : "Lưu thông tin"}</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isUpdating}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-4 h-4" />
                    <span>Hủy</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-8 space-y-8">
          {/* Personal Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Thông tin cá nhân
            </h3>

            {!isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên
                  </label>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <User className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-900">
                      {userData?.fullName || formData.fullName || (isLoadingUserData ? 'Đang tải...' : 'Chưa cập nhật')}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày sinh
                  </label>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-900">
                      {userData?.dob ? (
                        new Date(userData.dob).toLocaleDateString('vi-VN')
                      ) : (
                        isLoadingUserData ? 'Đang tải...' : 'Chưa cập nhật'
                      )}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giới tính
                  </label>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <User className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-900">
                      {userData?.gender ? (
                        userData.gender === 'male' || userData.gender === 'MALE' ? 'Nam' :
                        userData.gender === 'female' || userData.gender === 'FEMALE' ? 'Nữ' :
                        userData.gender === 'other' || userData.gender === 'OTHER' ? 'Khác' :
                        userData.gender
                      ) : (
                        isLoadingUserData ? 'Đang tải...' : 'Chưa cập nhật'
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    value={editFormData.fullName}
                    onChange={(e) => handleEditInputChange("fullName", e.target.value)}
                    className={`w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent transition-all ${
                      formErrors.fullName ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="Nhập họ và tên"
                  />
                  {formErrors.fullName && (
                    <p className="text-red-600 text-sm mt-1">{formErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    value={editFormData.dateOfBirth}
                    onChange={(e) => handleEditInputChange("dateOfBirth", e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent transition-all ${
                      formErrors.dateOfBirth ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {formErrors.dateOfBirth && (
                    <p className="text-red-600 text-sm mt-1">{formErrors.dateOfBirth}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giới tính
                  </label>
                  <select
                    value={editFormData.gender}
                    onChange={(e) => handleEditInputChange("gender", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent transition-all"
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Thông tin liên hệ
            </h3>

            {!isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-900">
                      {userData?.email || formData.email || (isLoadingUserData ? 'Đang tải...' : 'Chưa cập nhật')}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-900">
                      {userData?.phone || formData.phone || (isLoadingUserData ? 'Đang tải...' : 'Chưa cập nhật')}
                    </span>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ
                  </label>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-900">
                      {userData?.address || (isLoadingUserData ? 'Đang tải...' : 'Chưa cập nhật')}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Nhập email"
                    value={editFormData.email}
                    onChange={(e) => handleEditInputChange("email", e.target.value)}
                    className={`w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent transition-all ${
                      formErrors.email ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {formErrors.email && (
                    <p className="text-red-600 text-sm mt-1">{formErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    placeholder="0901234567"
                    value={editFormData.phone}
                    onChange={(e) => handleEditInputChange("phone", e.target.value)}
                    className={`w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent transition-all ${
                      formErrors.phone ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {formErrors.phone && (
                    <p className="text-red-600 text-sm mt-1">{formErrors.phone}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ
                  </label>
                  <textarea
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    value={editFormData.address}
                    onChange={(e) => handleEditInputChange("address", e.target.value)}
                    rows={2}
                    className={`w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent transition-all resize-none ${
                      formErrors.address ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {formErrors.address && (
                    <p className="text-red-600 text-sm mt-1">{formErrors.address}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Thông tin chuyên môn
            </h3>

            {!isEditing ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chuyên khoa chính
                </label>
                <div className="flex items-center space-x-3">
                  <Award className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-900">
                    {formData.mainSpecialty}
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chuyên khoa chính
                </label>
                <select
                  value={formData.mainSpecialty}
                  onChange={(e) =>
                    handleInputChange("mainSpecialty", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent transition-all"
                >
                  {specialties.map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Sub-specialties */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-[#0F172A] border-b border-gray-100 pb-3">
              Chuyên khoa phụ
            </h2>

            {isEditing ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {subSpecialties.map((specialty) => (
                  <button
                    key={specialty}
                    onClick={() => handleSubSpecialtyToggle(specialty)}
                    className={`p-3 rounded-2xl text-sm font-medium transition-all ${
                      formData.subSpecialties.includes(specialty)
                        ? "bg-[#1E75FF] text-white"
                        : "bg-gray-100 text-[#334155] hover:bg-gray-200"
                    }`}
                  >
                    {specialty}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {formData.subSpecialties.map((specialty) => (
                  <span
                    key={specialty}
                    className="px-4 py-2 bg-[#1E75FF]/10 text-[#1E75FF] rounded-2xl text-sm font-medium flex items-center gap-2"
                  >
                    <CheckCircle size={16} />
                    {specialty}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Introduction */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-[#0F172A] border-b border-gray-100 pb-3">
              Giới thiệu
            </h2>

            {isEditing ? (
              <textarea
                value={formData.introduction}
                onChange={(e) =>
                  handleInputChange("introduction", e.target.value)
                }
                rows={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent transition-all resize-none"
                placeholder="Nhập giới thiệu về bản thân..."
              />
            ) : (
              <div className="px-4 py-3 bg-gray-50 rounded-2xl">
                <p className="text-[#0F172A] leading-relaxed">
                  {formData.introduction}
                </p>
              </div>
            )}
          </div>

          {/* Professional Certificates */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-2xl font-semibold text-[#0F172A]">
                Chứng chỉ chuyên môn
              </h2>
              <button
                onClick={() => setShowCertificateModal(true)}
                className="bg-[#1E75FF] hover:bg-[#1659C9] text-white px-4 py-2 rounded-2xl font-medium flex items-center gap-2 transition-colors"
              >
                <Plus size={16} />
                <span>Thêm chứng chỉ mới</span>
              </button>
            </div>

            {certificates.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl">
                <Award size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-[#334155] mb-4">Chưa có chứng chỉ nào</p>
                <button
                  onClick={() => setShowCertificateModal(true)}
                  className="bg-[#1E75FF] hover:bg-[#1659C9] text-white px-6 py-3 rounded-2xl font-medium flex items-center gap-2 mx-auto transition-colors"
                >
                  <Plus size={20} />
                  <span>Thêm chứng chỉ mới</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certificates.map((certificate) => (
                  <motion.div
                    key={certificate.id}
                    initial={{
                      opacity: 0,
                      y: 20,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow relative group"
                  >
                    <button
                      onClick={() => setShowDeleteConfirm(certificate.id)}
                      className="absolute top-4 right-4 w-8 h-8 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-[#1E75FF]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Award size={24} className="text-[#1E75FF]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[#0F172A] mb-2 pr-8">
                          {certificate.name}
                        </h3>
                        <p className="text-sm text-[#334155] mb-1">
                          {certificate.issuer}
                        </p>
                        <div className="flex items-center gap-1 text-sm text-[#334155]">
                          <Calendar size={14} />
                          <span>Năm {certificate.year}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Certificate Modal */}
        <AnimatePresence>
          {showCertificateModal && (
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
                    Thêm chứng chỉ mới
                  </h3>
                  <button
                    onClick={() => setShowCertificateModal(false)}
                    className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                  >
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
                      value={newCertificate.name}
                      onChange={(e) =>
                        setNewCertificate((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
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
                      value={newCertificate.issuer}
                      onChange={(e) =>
                        setNewCertificate((prev) => ({
                          ...prev,
                          issuer: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent transition-all"
                      placeholder="Nhập cơ quan cấp..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#334155] mb-2">
                      Năm cấp
                    </label>
                    <select
                      value={newCertificate.year}
                      onChange={(e) =>
                        setNewCertificate((prev) => ({
                          ...prev,
                          year: parseInt(e.target.value),
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent transition-all"
                    >
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowCertificateModal(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-[#334155] py-3 rounded-2xl font-medium transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleAddCertificate}
                    disabled={
                      !newCertificate.name.trim() ||
                      !newCertificate.issuer.trim()
                    }
                    className="flex-1 bg-[#1E75FF] hover:bg-[#1659C9] text-white py-3 rounded-2xl font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save size={16} />
                    <span>Lưu chứng chỉ</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
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
                className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-[0_10px_24px_rgba(16,24,40,0.08)]"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#EF4444]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X size={32} className="text-[#EF4444]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#0F172A] mb-2">
                    Xóa chứng chỉ
                  </h3>
                  <p className="text-[#334155] mb-6">
                    Bạn có chắc chắn muốn xóa chứng chỉ này không? Hành động này
                    không thể hoàn tác.
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeleteConfirm(null)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-[#334155] py-3 rounded-2xl font-medium transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={() => handleDeleteCertificate(showDeleteConfirm)}
                      className="flex-1 bg-[#EF4444] hover:bg-[#DC2626] text-white py-3 rounded-2xl font-medium transition-colors"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>

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

      {/* Update Error Alert */}
      {(updateError || uploadError) && (
        <div className="fixed bottom-4 right-4 z-50">
          <Alert
            severity="error"
            onClose={() => {
              // Note: Error states are managed by the hooks, this just closes the alert
              // The actual error clearing happens when the hook state changes
            }}
            sx={{
              minWidth: 300,
              boxShadow: '0 10px 24px rgba(0,0,0,0.1)'
            }}
          >
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">
                {updateError || uploadError}
              </span>
            </div>
          </Alert>
        </div>
      )}
    </div>
  );
};
