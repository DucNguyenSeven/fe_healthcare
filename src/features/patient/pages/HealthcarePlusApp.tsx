import React, { useState } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { DashboardPage } from './DashboardPage';
import { ProfileRecordsPage } from './ProfileRecordsPage';
import { AppointmentsPage } from './AppointmentsPage';
import { TelehealthPage } from './TelehealthPage';
import { MonitoringPage } from './MonitoringPage';
import { AIAssistantPage } from './AIAssistantPage';
import { CommunityPage } from './CommunityPage';
import { User, Appointment, HealthMetric, Alert } from '../types';
export function HealthcarePlusApp() {
  const [currentPage, setCurrentPage] = useState<string>('dashboard');

  // Mock user data
  const user: User = {
    id: '1',
    name: 'Nguyễn Văn An',
    email: 'nguyenvanan@email.com',
    phone: '0123456789',
    avatar: '/api/placeholder/40/40',
    ckdStage: 3,
    lastEgfr: 45,
    lastCreatinine: 1.8,
    lastBp: '140/90'
  };

  // Mock appointments data
  const appointments: Appointment[] = [{
    id: '1',
    type: 'online',
    service: 'Tư vấn thận học',
    doctor: 'BS. Trần Minh Hoàng',
    date: '2024-01-15',
    time: '14:00',
    status: 'upcoming',
    canJoin: true
  }, {
    id: '2',
    type: 'direct',
    service: 'Khám tổng quát',
    doctor: 'BS. Lê Thị Mai',
    date: '2024-01-20',
    time: '09:30',
    status: 'upcoming'
  }];

  // Mock health metrics
  const healthMetrics: HealthMetric[] = [{
    id: '1',
    type: 'egfr',
    value: 45,
    date: '2024-01-10',
    unit: 'mL/min/1.73m²',
    isAlert: true
  }, {
    id: '2',
    type: 'creatinine',
    value: 1.8,
    date: '2024-01-10',
    unit: 'mg/dL',
    isAlert: true
  }, {
    id: '3',
    type: 'bp',
    value: '140/90',
    date: '2024-01-10',
    unit: 'mmHg',
    isAlert: true
  }, {
    id: '4',
    type: 'weight',
    value: 68,
    date: '2024-01-10',
    unit: 'kg'
  }];

  // Mock alerts
  const alerts: Alert[] = [{
    id: '1',
    type: 'critical',
    title: 'Chỉ số eGFR thấp',
    message: 'eGFR 45 mL/min/1.73m² - dưới ngưỡng an toàn. Vui lòng liên hệ bác sĩ.',
    date: '2024-01-10',
    isRead: false
  }, {
    id: '2',
    type: 'warning',
    title: 'Huyết áp cao',
    message: 'Huyết áp 140/90 mmHg - vượt ngưỡng khuyến nghị.',
    date: '2024-01-10',
    isRead: false
  }];
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage user={user} appointments={appointments} healthMetrics={healthMetrics} alerts={alerts} onNavigate={setCurrentPage} />;
      case 'profile':
        return <ProfileRecordsPage user={user} />;
      case 'appointments':
        return <AppointmentsPage appointments={appointments} />;
      case 'telehealth':
        return <TelehealthPage user={user} appointments={appointments} />;
      case 'monitoring':
        return <MonitoringPage user={user} healthMetrics={healthMetrics} />;
      case 'ai-assistant':
        return <AIAssistantPage user={user} />;
      case 'community':
        return <CommunityPage user={user} />;
      default:
        return <DashboardPage user={user} appointments={appointments} healthMetrics={healthMetrics} alerts={alerts} onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardLayout user={user}>
        {renderCurrentPage()}
      </DashboardLayout>
    </div>
  );
}