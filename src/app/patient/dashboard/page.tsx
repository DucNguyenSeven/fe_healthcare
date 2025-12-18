"use client";

import { DashboardPage } from "@/features/patient";
import { useGetMe } from "@/hooks/auth/useGetMe";
import { useAuthContext } from "@/contexts/AuthContext";
// import { useLatestHealthMetrics } from '@/hooks/health-metrics/useLatestHealthMetrics' // API cũ - giữ để tham khảo
import { useHealthMetricsComparison } from "@/hooks/health-metrics/useHealthMetricsComparison"; // API mới với so sánh tháng trước
import { useTodayAppointments } from "@/hooks/appointments/useTodayAppointments";
import { usePrescriptionGroups } from "@/hooks/prescriptions/usePrescriptionGroups";
import { useRecentConsultations } from "@/hooks/medical-records/useRecentConsultations";
import { useRouter } from "next/navigation";

export default function PatientDashboard() {
  const router = useRouter();
  const { user: authUser } = useAuthContext();
  const { data: userData, isLoading: isLoadingUser } = useGetMe();

  // Get patient ID from user data
  const patientId = userData?.userId || authUser?.userId;

  // Fetch dashboard data using custom hooks
  // 🔄 UPDATED: Sử dụng useHealthMetricsComparison để lấy chỉ số + so sánh với tháng trước
  const {
    data: healthMetrics = [],
    isLoading: isLoadingMetrics,
    error: healthMetricsError,
  } = useHealthMetricsComparison(patientId);

  const { data: todayAppointments = [], isLoading: isLoadingAppointments } =
    useTodayAppointments(patientId);

  const { data: prescriptionGroups = [], isLoading: isLoadingPrescriptions } =
    usePrescriptionGroups(patientId);

  const { data: recentConsultations = [], isLoading: isLoadingConsultations } =
    useRecentConsultations(patientId);

  const handleNavigate = (page: string) => {
    // Navigate to different pages based on action
    switch (page) {
      case "monitoring":
        // Navigate to profile page with test results tab active
        router.push("/patient/profile?tab=test-results");
        break;
      case "appointments":
        router.push("/patient/appointments");
        break;
      case "ai-assistant":
        router.push("/patient/ai-assistant");
        break;
      case "telehealth":
        router.push("/patient/telehealth");
        break;
      case "profile-medical":
        // Navigate to profile page with medical records tab active
        router.push("/patient/profile?tab=medical");
        break;
      case "community":
        router.push("/patient/community");
        break;
      default:
      // no-op
    }
  };

  // Determine if any data is still loading
  const isLoading =
    isLoadingUser ||
    isLoadingMetrics ||
    isLoadingAppointments ||
    isLoadingPrescriptions ||
    isLoadingConsultations;

  // Use real user data from getMe API, fallback to auth context
  const user = userData
    ? {
        id: userData.userId,
        name: userData.fullName || userData.email || "Bạn",
        fullName: userData.fullName || undefined,
        email: userData.email,
        phone: userData.phone || "",
        avatar: userData.avatarUrl || undefined,
      }
    : authUser
      ? {
          id: authUser.userId,
          name: authUser.name || authUser.fullName || "Bạn",
          fullName: authUser.fullName || undefined,
          email: authUser.email,
          phone: authUser.phone || "",
          avatar: authUser.avatar || authUser.avatarUrl || undefined,
        }
      : {
          id: "guest",
          name: "Bạn",
          fullName: "Bạn",
          email: "",
          phone: "",
        };

  // Show loading state only for initial user data load
  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin người dùng...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardPage
      user={user}
      healthMetrics={healthMetrics}
      patientId={patientId}
      todayAppointments={todayAppointments}
      recentConsultations={recentConsultations}
      prescriptionGroups={prescriptionGroups}
      onNavigate={handleNavigate}
      isLoading={false} // Don't show loading for dashboard data, show empty states instead
    />
  );
}
