export * from './types';

// Layout & Main Components
export { DashboardLayout } from './pages/DashboardLayout';

// Pages
export { DashboardPage } from './pages/DashboardPage';
export { AIAssistantPage } from './components/AIAssistantPage';
export { AppointmentsPage } from './pages/AppointmentsPage';
export { TelehealthPage } from './pages/TelehealthPage';
export { MonitoringPage } from './pages/MonitoringPage';
export { ProfileRecordsPage } from './pages/ProfileRecordsPage';
export { CommunityPage } from './pages/CommunityPage';

// Dashboard Components
export { WelcomeSection } from './components/WelcomeSection';
export { QuickActions } from './components/QuickActions';
export { HealthMetrics } from './components/HealthMetrics';
export { TodaySchedule } from './components/TodaySchedule';
export { MedicationReminders } from './components/MedicationReminders';
export { RecentConsultations } from './components/RecentConsultations';
export { SuggestedArticles } from './components/SuggestedArticles';

// Patient Info Form Components
export { PatientInfoUpdateForm } from './components/PatientInfoUpdateForm';
export { PatientInfoFormWrapper } from './components/PatientInfoFormWrapper';

// Hooks
export { usePatientInfoForm, useProfileCompletion } from './hooks/usePatientInfoForm';
