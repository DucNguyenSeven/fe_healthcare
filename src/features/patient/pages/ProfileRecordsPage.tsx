import React, { useState } from 'react';
import { User as UserIcon, Phone, Mail, MapPin, Calendar, Heart, AlertTriangle, Upload, FileText, Download, Trash2, Edit3, Save, X, Plus, Clock, Shield, Camera, Check } from 'lucide-react';
import { User } from '../types';
interface ProfileRecordsPageProps {
  user: User;
}
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
export function ProfileRecordsPage({
  user
}: ProfileRecordsPageProps) {
  const [activeTab, setActiveTab] = useState<'personal' | 'medical' | 'files'>('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

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
    id: 'medical',
    label: 'Tiền sử & dị ứng',
    icon: Heart
  }, {
    id: 'files',
    label: 'Tệp y khoa',
    icon: FileText
  }] as any[];
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
    switch (category) {
      case 'lab':
        return <FileText className="w-6 h-6 text-red-600" />;
      case 'imaging':
        return <FileText className="w-6 h-6 text-red-600" />;
      case 'prescription':
        return <FileText className="w-6 h-6 text-red-600" />;
      case 'report':
        return <FileText className="w-6 h-6 text-red-600" />;
      default:
        return <FileText className="w-6 h-6 text-red-600" />;
    }
  };
  const handleSave = () => {
    // In a real app, this would save to backend
    setIsEditing(false);
    console.log('Saving user data:', editedUser);
  };
  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };
  const handleSelectFile = (fileId: string) => {
    setSelectedFiles(prev => prev.includes(fileId) ? prev.filter(id => id !== fileId) : [...prev, fileId]);
  };
  const handleDownloadSelected = () => {
    // Logic to download selected files
    console.log('Downloading files:', selectedFiles);
    // Reset selection after download
    setSelectedFiles([]);
    setIsSelectionMode(false);
  };
  const renderPersonalInfo = () => <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Thông tin cá nhân</h2>
        {!isEditing ? <button onClick={() => setIsEditing(true)} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors" style={{
        display: "none"
      }}>
            <Edit3 className="w-4 h-4" />
            <span>Chỉnh sửa</span>
          </button> : <div className="flex space-x-2">
            <button onClick={handleSave} className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors">
              <Save className="w-4 h-4" />
              <span>Lưu</span>
            </button>
            <button onClick={handleCancel} className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors">
              <X className="w-4 h-4" />
              <span>Hủy</span>
            </button>
          </div>}
      </div>

      {/* Profile Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-blue-500" />
            </div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors cursor-pointer shadow-lg" style={{
            background: "oklch(50.94% 0 196.37deg)"
          }}>
              <Camera className="w-3 h-3 text-white" />
            </button>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold">{user.name}</h3>
            <p className="text-blue-100">Bệnh nhân #{user.id}2345 • Tham gia từ tháng 6/2023</p>
          </div>
          <button className="px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-lg text-sm font-medium transition-colors">
            Chỉnh sửa
          </button>
        </div>
        
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-sm text-blue-100 mb-1">Chiều cao:</div>
            <div className="font-semibold text-lg">170 cm</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-blue-100 mb-1">Cân nặng:</div>
            <div className="font-semibold text-lg">68 kg</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-blue-100 mb-1">Nhóm máu:</div>
            <div className="font-semibold text-lg">O+</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-blue-100 mb-1">BMI:</div>
            <div className="font-semibold text-lg">23.5</div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Thông tin cá nhân</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
              <UserIcon className="w-5 h-5 text-gray-500" />
              <span className="text-gray-900">{user.name}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ngày sinh</label>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span className="text-gray-900">15/03/1985</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính</label>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
              <UserIcon className="w-5 h-5 text-gray-500" />
              <span className="text-gray-900">Nam</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">CCCD/CMND</label>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-900">123456789012</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Thông tin liên hệ</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
              <Phone className="w-5 h-5 text-gray-500" />
              <span className="text-gray-900">0901234567</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
              <Mail className="w-5 h-5 text-gray-500" />
              <span className="text-gray-900">nguyenvanan@email.com</span>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
              <MapPin className="w-5 h-5 text-gray-500" />
              <span className="text-gray-900">123 Đường ABC, Phường XYZ, Quận 1, TP.HCM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Insurance Information */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Thông tin bảo hiểm</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Loại bảo hiểm</label>
            <div className="p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-900">BHYT</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Số thẻ BHYT</label>
            <div className="p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-900">DN1234567890123</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ngày hết hạn</label>
            <div className="p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-900">31/12/2025</span>
            </div>
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

        <div className="mt-4 p-3 bg-gray-50 rounded-lg" style={{
        display: "none"
      }}>
          <div className="flex items-start space-x-2">
            <Plus className="w-4 h-4 text-gray-400 mt-0.5" />
            <input type="text" placeholder="Thêm dị ứng mới..." className="flex-1 bg-transparent border-none outline-none text-sm text-gray-600 placeholder-gray-400" />
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
          {/* Medical History Item 1 */}
          <div className="flex items-start space-x-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-blue-600">1</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 mb-1">
                Chẩn đoán CKD giai đoạn 3B
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                BS. Trần Thị B
              </p>
              <p className="text-sm text-gray-600 mb-3">
                eGFR: 45 mL/min/1.73m²; Creatinine: 1.8 mg/dL
              </p>
            </div>
            <div className="text-right text-sm text-gray-500 flex-shrink-0">
              <div>15/01/2024</div>
            </div>
          </div>

          {/* Medical History Item 2 */}
          <div className="flex items-start space-x-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-blue-600">2</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 mb-1">
                Khám định kỳ
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                BS. Lê Văn C
              </p>
              <p className="text-sm text-gray-600 mb-3">
                Huyết áp ổn định, điều chỉnh liều thuốc
              </p>
            </div>
            <div className="text-right text-sm text-gray-500 flex-shrink-0">
              <div>10/12/2023</div>
            </div>
          </div>

          {/* Medical History Item 3 */}
          <div className="flex items-start space-x-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-blue-600">3</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 mb-1">
                Xét nghiệm máu định kỳ
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Các chỉ số trong giới hạn cho phép
              </p>
            </div>
            <div className="text-right text-sm text-gray-500 flex-shrink-0">
              <div>05/10/2023</div>
            </div>
          </div>
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
              <div className="text-right text-sm text-gray-500">
                <div>04/03/2024</div>
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
  return <div className="p-4 lg:p-6">
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
      {activeTab === 'medical' && renderMedicalHistory()}
      {activeTab === 'files' && renderMedicalFiles()}
    </div>;
}