"use client";

import React, { useState } from 'react';
import { Video, Mic, MicOff, VideoOff, Share2, PhoneOff, MessageCircle, FileText, User, Clock, CheckCircle, AlertTriangle, Download, Star, Calendar, Send, Paperclip } from 'lucide-react';
import { User as UserType, Appointment } from '../types';
interface TelehealthPageProps {
  user: UserType;
  appointments: Appointment[];
}
type TelehealthView = 'lobby' | 'session' | 'history' | 'summary';
interface ConsultationHistory {
  id: string;
  date: string;
  time: string;
  doctor: string;
  type: 'video' | 'chat';
  notes: string;
  hasFile: boolean;
  status: 'completed' | 'cancelled';
}
interface DeviceStatus {
  microphone: 'good' | 'warning' | 'error';
  camera: 'good' | 'warning' | 'error';
  network: 'good' | 'warning' | 'error';
}
export function TelehealthPage({
  user,
  appointments
}: TelehealthPageProps) {
  const [currentView, setCurrentView] = useState<TelehealthView>('lobby');
  const [activeTab, setActiveTab] = useState<'chat' | 'profile' | 'prescription'>('chat');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState([{
    id: '1',
    sender: 'doctor',
    content: 'Chào bạn! Tôi đã xem qua hồ sơ của bạn.',
    time: '14:05'
  }, {
    id: '2',
    sender: 'patient',
    content: 'Chào bác sĩ ạ. Em cảm thấy hơi mệt mỏi gần đây.',
    time: '14:06'
  }]);
  const deviceStatus: DeviceStatus = {
    microphone: 'good',
    camera: 'good',
    network: 'good'
  };
  const upcomingAppointment = appointments.find(apt => apt.status === 'upcoming' && apt.type === 'online');
  const consultationHistory: ConsultationHistory[] = [{
    id: '1',
    date: '2024-01-10',
    time: '14:00',
    doctor: 'BS. Trần Minh Hoàng',
    type: 'video',
    notes: 'Tư vấn về chế độ ăn uống và thuốc',
    hasFile: true,
    status: 'completed'
  }, {
    id: '2',
    date: '2024-01-05',
    time: '09:30',
    doctor: 'BS. Lê Thị Mai',
    type: 'video',
    notes: 'Khám tổng quát định kỳ',
    hasFile: true,
    status: 'completed'
  }];
  const getDeviceStatusIcon = (status: 'good' | 'warning' | 'error') => {
    switch (status) {
      case 'good':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
    }
  };
  const getDeviceStatusText = (status: 'good' | 'warning' | 'error') => {
    switch (status) {
      case 'good':
        return 'Hoạt động tốt';
      case 'warning':
        return 'Cần kiểm tra';
      case 'error':
        return 'Có lỗi';
    }
  };
  const sendMessage = () => {
    if (chatMessage.trim()) {
      setMessages([...messages, {
        id: Date.now().toString(),
        sender: 'patient',
        content: chatMessage,
        time: new Date().toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit'
        })
      }]);
      setChatMessage('');
    }
  };
  const renderLobby = () => <div className="max-w-4xl mx-auto space-y-6">
      {/* Device Check Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Kiểm tra thiết bị</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
            <Mic className="w-6 h-6 text-gray-600" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">Microphone</p>
              <div className="flex items-center space-x-2 mt-1">
                {getDeviceStatusIcon(deviceStatus.microphone)}
                <span className="text-sm text-gray-600">{getDeviceStatusText(deviceStatus.microphone)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
            <Video className="w-6 h-6 text-gray-600" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">Camera</p>
              <div className="flex items-center space-x-2 mt-1">
                {getDeviceStatusIcon(deviceStatus.camera)}
                <span className="text-sm text-gray-600">{getDeviceStatusText(deviceStatus.camera)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Kết nối mạng</p>
              <div className="flex items-center space-x-2 mt-1">
                {getDeviceStatusIcon(deviceStatus.network)}
                <span className="text-sm text-gray-600">{getDeviceStatusText(deviceStatus.network)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Info Card */}
      {upcomingAppointment && <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin lịch hẹn</h2>
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{upcomingAppointment.doctor}</h3>
              <p className="text-gray-600 mb-2">{upcomingAppointment.service}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(upcomingAppointment.date).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{upcomingAppointment.time}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Video className="w-4 h-4" />
                  <span>Tư vấn trực tuyến</span>
                </div>
              </div>
            </div>
            <button onClick={() => setCurrentView('session')} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
              Vào phòng
            </button>
          </div>
        </div>}

      {/* Requirements Alert */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-blue-900 font-medium">Yêu cầu trước khi tư vấn</p>
            <p className="text-blue-800 text-sm mt-1">
              Vui lòng chuẩn bị chỉ số xét nghiệm trong 90 ngày gần nhất để bác sĩ có thể tư vấn chính xác nhất.
            </p>
            <button className="mt-2 text-blue-700 hover:text-blue-800 text-sm font-medium">
              Nhập chỉ số ngay →
            </button>
          </div>
        </div>
      </div>
    </div>;
  const renderSession = () => <div className="h-full flex">
      {/* Video Area */}
      <div className="flex-1 bg-gray-900 relative">
        <div className="aspect-video bg-gray-800 flex items-center justify-center">
          <div className="text-center text-white">
            <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Đang kết nối với bác sĩ...</p>
          </div>
        </div>
        
        {/* Controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
          <button onClick={() => setIsMuted(!isMuted)} className={`p-3 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-700'} text-white hover:opacity-80 transition-opacity`}>
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          
          <button onClick={() => setIsVideoOff(!isVideoOff)} className={`p-3 rounded-full ${isVideoOff ? 'bg-red-500' : 'bg-gray-700'} text-white hover:opacity-80 transition-opacity`}>
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>
          
          <button className="p-3 rounded-full bg-gray-700 text-white hover:opacity-80 transition-opacity">
            <Share2 className="w-5 h-5" />
          </button>
          
          <button onClick={() => setCurrentView('summary')} className="p-3 rounded-full bg-red-500 text-white hover:opacity-80 transition-opacity">
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button onClick={() => setActiveTab('chat')} className={`flex-1 px-4 py-3 text-sm font-medium ${activeTab === 'chat' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
            <MessageCircle className="w-4 h-4 inline mr-2" />
            Chat
          </button>
          <button onClick={() => setActiveTab('profile')} className={`flex-1 px-4 py-3 text-sm font-medium ${activeTab === 'profile' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
            <User className="w-4 h-4 inline mr-2" />
            Hồ sơ
          </button>
          <button onClick={() => setActiveTab('prescription')} className={`flex-1 px-4 py-3 text-sm font-medium ${activeTab === 'prescription' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
            <FileText className="w-4 h-4 inline mr-2" />
            Chỉ định
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'chat' && <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(message => <div key={message.id} className={`flex ${message.sender === 'patient' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${message.sender === 'patient' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                      <p>{message.content}</p>
                      <p className={`text-xs mt-1 ${message.sender === 'patient' ? 'text-blue-100' : 'text-gray-500'}`}>
                        {message.time}
                      </p>
                    </div>
                  </div>)}
              </div>
              
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <input type="text" value={chatMessage} onChange={e => setChatMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendMessage()} placeholder="Nhập tin nhắn..." className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <button className="p-2 text-gray-500 hover:text-gray-700">
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button onClick={sendMessage} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>}

          {activeTab === 'profile' && <div className="p-4 space-y-4">
              <h3 className="font-semibold text-gray-900">Chỉ số gần nhất</h3>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">eGFR</span>
                    <span className="font-medium text-red-600">{user.lastEgfr} mL/min/1.73m²</span>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Creatinine</span>
                    <span className="font-medium text-red-600">{user.lastCreatinine} mg/dL</span>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Huyết áp</span>
                    <span className="font-medium text-yellow-600">{user.lastBp} mmHg</span>
                  </div>
                </div>
              </div>
              
              <h3 className="font-semibold text-gray-900 mt-6">Dị ứng</h3>
              <p className="text-sm text-gray-600">Không có dị ứng được ghi nhận</p>
              
              <h3 className="font-semibold text-gray-900 mt-6">Thuốc đang dùng</h3>
              <div className="space-y-2">
                <div className="text-sm">
                  <p className="font-medium">Losartan 50mg</p>
                  <p className="text-gray-600">1 viên/ngày, buổi sáng</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Furosemide 40mg</p>
                  <p className="text-gray-600">1 viên/ngày, buổi sáng</p>
                </div>
              </div>
            </div>}

          {activeTab === 'prescription' && <div className="p-4 space-y-4">
              <h3 className="font-semibold text-gray-900">Chỉ định từ bác sĩ</h3>
              <textarea readOnly className="w-full h-32 p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm" placeholder="Bác sĩ sẽ ghi chỉ định tại đây..." value="1. Tiếp tục dùng Losartan 50mg, 1 viên/ngày&#10;2. Giảm lượng muối trong bữa ăn&#10;3. Tái khám sau 2 tuần&#10;4. Theo dõi huyết áp hàng ngày" />
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Tải PDF</span>
              </button>
            </div>}
        </div>
      </div>
    </div>;
  const renderHistory = () => <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Lịch sử tư vấn</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày/Giờ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bác sĩ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hình thức
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ghi chú chính
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {consultationHistory.map(consultation => <tr key={consultation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(consultation.date).toLocaleDateString('vi-VN')}
                    </div>
                    <div className="text-sm text-gray-500">{consultation.time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{consultation.doctor}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {consultation.type === 'video' ? <Video className="w-4 h-4 text-blue-500 mr-2" /> : <MessageCircle className="w-4 h-4 text-green-500 mr-2" />}
                      <span className="text-sm text-gray-900">
                        {consultation.type === 'video' ? 'Video call' : 'Chat'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {consultation.notes}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {consultation.hasFile && <button className="text-blue-600 hover:text-blue-700">
                        <FileText className="w-4 h-4" />
                      </button>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => setCurrentView('summary')} className="text-blue-600 hover:text-blue-700">
                      Xem tóm tắt
                    </button>
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>;
  const renderSummary = () => <div className="max-w-4xl mx-auto space-y-6">
      {/* Consultation Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin buổi tư vấn</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Bác sĩ</p>
            <p className="font-medium text-gray-900">BS. Trần Minh Hoàng</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Thời gian</p>
            <p className="font-medium text-gray-900">15/01/2024 - 14:00</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Thời lượng</p>
            <p className="font-medium text-gray-900">25 phút</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Hình thức</p>
            <p className="font-medium text-gray-900">Tư vấn trực tuyến</p>
          </div>
        </div>
      </div>

      {/* Prescription */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Chỉ định và khuyến nghị</h2>
        <div className="prose prose-sm max-w-none">
          <h3>Thuốc:</h3>
          <ul>
            <li>Tiếp tục dùng Losartan 50mg, 1 viên/ngày vào buổi sáng</li>
            <li>Furosemide 40mg, 1 viên/ngày vào buổi sáng</li>
          </ul>
          
          <h3>Chế độ ăn uống:</h3>
          <ul>
            <li>Giảm lượng muối xuống dưới 2g/ngày</li>
            <li>Hạn chế protein động vật, ưu tiên protein thực vật</li>
            <li>Uống đủ nước (1.5-2L/ngày)</li>
          </ul>
          
          <h3>Theo dõi:</h3>
          <ul>
            <li>Đo huyết áp hàng ngày, ghi chép vào sổ</li>
            <li>Cân nặng 2 lần/tuần</li>
            <li>Tái khám sau 2 tuần</li>
          </ul>
          
          <h3>Lưu ý:</h3>
          <p>Nếu có triệu chứng khó thở, phù chân tăng, liên hệ ngay với bác sĩ.</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
          <Download className="w-5 h-5" />
          <span>Tải PDF</span>
        </button>
        
        <button className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
          <Calendar className="w-5 h-5" />
          <span>Đặt lịch tái khám</span>
        </button>
        
        <button className="flex-1 px-6 py-3 bg-yellow-600 text-white rounded-xl font-medium hover:bg-yellow-700 transition-colors flex items-center justify-center space-x-2">
          <Star className="w-5 h-5" />
          <span>Đánh giá bác sĩ</span>
        </button>
      </div>
    </div>;
  return <div className="h-full flex flex-col">
      {/* Navigation Tabs */}
      {currentView !== 'session' && <div className="bg-white border-b border-gray-200 px-4 lg:px-6">
          <div className="flex space-x-8">
            <button onClick={() => setCurrentView('lobby')} className={`py-4 px-2 border-b-2 font-medium text-sm ${currentView === 'lobby' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              Phòng chờ
            </button>
            <button onClick={() => setCurrentView('history')} className={`py-4 px-2 border-b-2 font-medium text-sm ${currentView === 'history' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              Lịch sử
            </button>
            <button onClick={() => setCurrentView('summary')} className={`py-4 px-2 border-b-2 font-medium text-sm ${currentView === 'summary' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              Tóm tắt gần nhất
            </button>
          </div>
        </div>}

      {/* Content */}
      <div className={`flex-1 ${currentView === 'session' ? '' : 'p-4 lg:p-6'} overflow-auto`}>
        {currentView === 'lobby' && renderLobby()}
        {currentView === 'session' && renderSession()}
        {currentView === 'history' && renderHistory()}
        {currentView === 'summary' && renderSummary()}
      </div>
    </div>;
}