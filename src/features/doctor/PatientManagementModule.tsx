import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Eye, User, Calendar, Activity, FileText, Plus, ChevronLeft, Phone, Mail, MapPin, AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
const patientData = [{
  id: 1,
  name: 'Nguyễn Văn An',
  age: 65,
  gender: 'Nam',
  eGFR: '45 ml/min',
  lastVisit: '2024-01-15',
  stage: 'Giai đoạn 3',
  status: 'stable'
}, {
  id: 2,
  name: 'Trần Thị Bình',
  age: 58,
  gender: 'Nữ',
  eGFR: '32 ml/min',
  lastVisit: '2024-01-14',
  stage: 'Giai đoạn 4',
  status: 'declining'
}, {
  id: 3,
  name: 'Lê Minh Cường',
  age: 72,
  gender: 'Nam',
  eGFR: '58 ml/min',
  lastVisit: '2024-01-13',
  stage: 'Giai đoạn 3',
  status: 'improving'
}, {
  id: 4,
  name: 'Phạm Thị Dung',
  age: 61,
  gender: 'Nữ',
  eGFR: '28 ml/min',
  lastVisit: '2024-01-12',
  stage: 'Giai đoạn 4',
  status: 'stable'
}, {
  id: 5,
  name: 'Hoàng Văn Em',
  age: 69,
  gender: 'Nam',
  eGFR: '15 ml/min',
  lastVisit: '2024-01-11',
  stage: 'Giai đoạn 5',
  status: 'declining'
}] as any[];
const labResults = [{
  date: '2024-01-15',
  eGFR: 45,
  creatinine: 1.8,
  bun: 28,
  systolic: 140,
  diastolic: 85
}, {
  date: '2024-01-01',
  eGFR: 42,
  creatinine: 1.9,
  bun: 32,
  systolic: 145,
  diastolic: 88
}, {
  date: '2023-12-15',
  eGFR: 48,
  creatinine: 1.7,
  bun: 25,
  systolic: 138,
  diastolic: 82
}, {
  date: '2023-12-01',
  eGFR: 50,
  creatinine: 1.6,
  bun: 23,
  systolic: 135,
  diastolic: 80
}] as any[];
const consultations = [{
  date: '2024-01-15',
  type: 'Tư vấn định kỳ',
  notes: 'Bệnh nhân tuân thủ điều trị tốt. eGFR ổn định. Tiếp tục theo dõi.'
}, {
  date: '2024-01-01',
  type: 'Tư vấn trực tuyến',
  notes: 'Điều chỉnh liều thuốc hạ huyết áp. Khuyến cáo chế độ ăn ít muối.'
}, {
  date: '2023-12-15',
  type: 'Khám định kỳ',
  notes: 'Kết quả xét nghiệm cải thiện. Bệnh nhân cần duy trì chế độ ăn uống.'
}] as any[];

// @component: PatientManagementModule
export const PatientManagementModule = () => {
  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState('all');
  const filteredPatients = patientData.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStage === 'all' || patient.stage.includes(filterStage);
    return matchesSearch && matchesFilter;
  });
  const handleViewPatient = (patient: any) => {
    setSelectedPatient(patient);
    setCurrentView('detail');
    setActiveTab('profile');
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable':
        return 'bg-[#10B981]/10 text-[#10B981]';
      case 'improving':
        return 'bg-[#1E75FF]/10 text-[#1E75FF]';
      case 'declining':
        return 'bg-[#EF4444]/10 text-[#EF4444]';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'stable':
        return <Minus size={14} />;
      case 'improving':
        return <TrendingUp size={14} />;
      case 'declining':
        return <TrendingDown size={14} />;
      default:
        return null;
    }
  };
  const getStatusText = (status: string) => {
    switch (status) {
      case 'stable':
        return 'Ổn định';
      case 'improving':
        return 'Cải thiện';
      case 'declining':
        return 'Giảm';
      default:
        return 'Không xác định';
    }
  };
  const renderPatientList = () => <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#0F172A]">Danh sách bệnh nhân</h1>
        <button className="bg-[#1E75FF] hover:bg-[#1659C9] text-white px-6 py-3 rounded-2xl font-medium flex items-center gap-2 transition-colors">
          <Plus size={20} />
          <span>Thêm bệnh nhân</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_10px_24px_rgba(16,24,40,0.08)] p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#334155]" />
            <input type="text" placeholder="Tìm kiếm bệnh nhân..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent" />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-[#334155]" />
            <select value={filterStage} onChange={e => setFilterStage(e.target.value)} className="px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E75FF] focus:border-transparent">
              <option value="all">Tất cả giai đoạn</option>
              <option value="3">Giai đoạn 3</option>
              <option value="4">Giai đoạn 4</option>
              <option value="5">Giai đoạn 5</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-4 px-2 font-semibold text-[#334155]">Họ tên</th>
                <th className="text-left py-4 px-2 font-semibold text-[#334155]">Tuổi</th>
                <th className="text-left py-4 px-2 font-semibold text-[#334155]">Giới tính</th>
                <th className="text-left py-4 px-2 font-semibold text-[#334155]">eGFR mới nhất</th>
                <th className="text-left py-4 px-2 font-semibold text-[#334155]">Lần khám cuối</th>
                <th className="text-left py-4 px-2 font-semibold text-[#334155]">Trạng thái</th>
                <th className="text-left py-4 px-2 font-semibold text-[#334155]">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient, index) => <motion.tr key={patient.id} initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: index * 0.1
            }} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#1E75FF] rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {patient.name.split(' ').pop()?.charAt(0)}
                        </span>
                      </div>
                      <span className="font-medium text-[#0F172A]">{patient.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-2 text-[#334155]">{patient.age}</td>
                  <td className="py-4 px-2 text-[#334155]">{patient.gender}</td>
                  <td className="py-4 px-2">
                    <span className="font-medium text-[#0F172A]">{patient.eGFR}</span>
                  </td>
                  <td className="py-4 px-2 text-[#334155]">
                    {new Date(patient.lastVisit).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="py-4 px-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getStatusColor(patient.status)}`}>
                      {getStatusIcon(patient.status)}
                      {getStatusText(patient.status)}
                    </span>
                  </td>
                  <td className="py-4 px-2">
                    <button onClick={() => handleViewPatient(patient)} className="bg-[#1E75FF] hover:bg-[#1659C9] text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors">
                      <Eye size={16} />
                      <span>Xem</span>
                    </button>
                  </td>
                </motion.tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>;
  const renderPatientDetail = () => <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => setCurrentView('list')} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ChevronLeft size={24} className="text-[#334155]" />
        </button>
        <h1 className="text-3xl font-bold text-[#0F172A]">Chi tiết bệnh nhân</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_10px_24px_rgba(16,24,40,0.08)] overflow-hidden">
        <div className="bg-gradient-to-r from-[#1E75FF] to-[#1659C9] p-6 text-white">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <User size={32} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">{selectedPatient?.name}</h2>
              <div className="flex items-center gap-4 text-white/80">
                <span>{selectedPatient?.age} tuổi</span>
                <span>•</span>
                <span>{selectedPatient?.gender}</span>
                <span>•</span>
                <span>{selectedPatient?.stage}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-100">
          <div className="flex">
            {[{
            id: 'profile',
            label: 'Hồ sơ',
            icon: User
          }, {
            id: 'lab',
            label: 'Xét nghiệm',
            icon: Activity
          }, {
            id: 'consultations',
            label: 'Tư vấn',
            icon: Calendar
          }, {
            id: 'treatment',
            label: 'Phác đồ',
            icon: FileText
          }].map(tab => {
            const Icon = tab.icon;
            return <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${activeTab === tab.id ? 'text-[#1E75FF] border-b-2 border-[#1E75FF]' : 'text-[#334155] hover:text-[#1E75FF]'}`}>
                  <Icon size={20} />
                  <span>{tab.label}</span>
                </button>;
          })}
          </div>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{
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
              {activeTab === 'profile' && <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-[#0F172A] mb-4">Thông tin cơ bản</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <Phone size={20} className="text-[#334155]" />
                        <div>
                          <p className="text-sm text-[#334155]">Số điện thoại</p>
                          <p className="font-medium text-[#0F172A]">0123456789</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <Mail size={20} className="text-[#334155]" />
                        <div>
                          <p className="text-sm text-[#334155]">Email</p>
                          <p className="font-medium text-[#0F172A]">patient@email.com</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <MapPin size={20} className="text-[#334155]" />
                        <div>
                          <p className="text-sm text-[#334155]">Địa chỉ</p>
                          <p className="font-medium text-[#0F172A]">123 Đường ABC, Quận 1, TP.HCM</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-[#EF4444]/5 border border-[#EF4444]/20 rounded-xl">
                        <AlertTriangle size={20} className="text-[#EF4444]" />
                        <div>
                          <p className="text-sm text-[#EF4444]">Dị ứng</p>
                          <p className="font-medium text-[#0F172A]">Penicillin, Aspirin</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>}

              {activeTab === 'lab' && <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-[#0F172A] mb-4">Kết quả xét nghiệm</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left py-3 px-2 font-semibold text-[#334155]">Ngày</th>
                          <th className="text-left py-3 px-2 font-semibold text-[#334155]">eGFR</th>
                          <th className="text-left py-3 px-2 font-semibold text-[#334155]">Creatinine</th>
                          <th className="text-left py-3 px-2 font-semibold text-[#334155]">BUN</th>
                          <th className="text-left py-3 px-2 font-semibold text-[#334155]">Huyết áp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {labResults.map((result, index) => <tr key={index} className="border-b border-gray-50">
                            <td className="py-3 px-2 text-[#334155]">
                              {new Date(result.date).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="py-3 px-2 font-medium text-[#0F172A]">{result.eGFR} ml/min</td>
                            <td className="py-3 px-2 text-[#334155]">{result.creatinine} mg/dL</td>
                            <td className="py-3 px-2 text-[#334155]">{result.bun} mg/dL</td>
                            <td className="py-3 px-2 text-[#334155]">{result.systolic}/{result.diastolic} mmHg</td>
                          </tr>)}
                      </tbody>
                    </table>
                  </div>
                </div>}

              {activeTab === 'consultations' && <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-[#0F172A] mb-4">Lịch sử tư vấn</h3>
                  <div className="space-y-4">
                    {consultations.map((consultation, index) => <div key={index} className="border-l-4 border-[#1E75FF] pl-6 py-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-[#0F172A]">{consultation.type}</h4>
                          <span className="text-sm text-[#334155]">
                            {new Date(consultation.date).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <p className="text-[#334155] leading-relaxed">{consultation.notes}</p>
                      </div>)}
                  </div>
                </div>}

              {activeTab === 'treatment' && <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-[#0F172A]">Phác đồ điều trị hiện tại</h3>
                    <button className="bg-[#1E75FF] hover:bg-[#1659C9] text-white px-4 py-2 rounded-xl font-medium transition-colors">
                      Cập nhật
                    </button>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-[#0F172A] mb-2">Thuốc đang sử dụng</h4>
                        <ul className="space-y-2">
                          <li className="flex items-center justify-between p-3 bg-white rounded-lg">
                            <span className="text-[#0F172A]">Lisinopril 10mg</span>
                            <span className="text-[#334155]">1 viên/ngày</span>
                          </li>
                          <li className="flex items-center justify-between p-3 bg-white rounded-lg">
                            <span className="text-[#0F172A]">Amlodipine 5mg</span>
                            <span className="text-[#334155]">1 viên/ngày</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#0F172A] mb-2">Chế độ ăn uống</h4>
                        <p className="text-[#334155] leading-relaxed">
                          Hạn chế muối dưới 2g/ngày, protein 0.8g/kg/ngày, tăng cường rau xanh và trái cây.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>;

  // @return
  return <div className="h-full bg-[#F6F7FB]">
      {currentView === 'list' ? renderPatientList() : renderPatientDetail()}
    </div>;
};