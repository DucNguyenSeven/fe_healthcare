import React, { useState } from "react";
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
} from "lucide-react";
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
  const [formData, setFormData] = useState({
    fullName: "Bác sĩ Nguyễn Văn An",
    email: "bs.nguyenvanan@healthcare.vn",
    phone: "0123456789",
    mainSpecialty: "Thận học",
    subSpecialties: ["Bệnh thận mạn", "Lọc máu"],
    introduction:
      "Bác sĩ chuyên khoa Thận học với hơn 10 năm kinh nghiệm trong điều trị các bệnh lý thận mạn tính. Tốt nghiệp Đại học Y Hà Nội, có chứng chỉ chuyên khoa cấp II về Thận học.",
  });
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
  const [isSaving, setIsSaving] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
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
  const handleSubSpecialtyToggle = (specialty: string) => {
    const current = formData.subSpecialties;
    const updated = current.includes(specialty)
      ? current.filter((s) => s !== specialty)
      : [...current, specialty];
    handleInputChange("subSpecialties", updated);
  };
  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSaving(false);
    setIsEditing(false);
  };
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatar(e.target?.result as string);
      };
      reader.readAsDataURL(file);
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
                <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={40} className="text-white" />
                  )}
                </div>
                {isEditing && (
                  <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-shadow">
                    <Camera size={16} className="text-[#1E75FF]" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{formData.fullName}</h1>
                <p className="text-white/80 text-lg">
                  {formData.mainSpecialty}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Chỉnh sửa</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? "Đang lưu..." : "Lưu thông tin"}</span>
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
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
          {/* Basic Information */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-[#0F172A] border-b border-gray-100 pb-3">
              Thông tin cơ bản
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#334155]">
                  Họ và tên
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent transition-all"
                  />
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-2xl">
                    <User size={20} className="text-[#334155]" />
                    <span className="text-[#0F172A]">{formData.fullName}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#334155]">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent transition-all"
                  />
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-2xl">
                    <Mail size={20} className="text-[#334155]" />
                    <span className="text-[#0F172A]">{formData.email}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#334155]">
                  Số điện thoại
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent transition-all"
                  />
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-2xl">
                    <Phone size={20} className="text-[#334155]" />
                    <span className="text-[#0F172A]">{formData.phone}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#334155]">
                  Chuyên khoa chính
                </label>
                {isEditing ? (
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
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-2xl">
                    <span className="text-[#0F172A]">
                      {formData.mainSpecialty}
                    </span>
                  </div>
                )}
              </div>
            </div>
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
    </div>
  );
};
