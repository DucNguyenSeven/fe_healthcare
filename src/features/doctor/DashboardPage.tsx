import React from "react";
import {
  Plus,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  MessageCircle,
  FileText,
  Activity,
  Heart,
  Droplets,
  Weight,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Video,
} from "lucide-react";
import {
  User,
  Appointment,
  HealthMetric,
  Alert,
  NavigationItem,
} from "./HealthcarePlusApp";
interface DashboardPageProps {
  user: User;
  appointments: Appointment[];
  healthMetrics: HealthMetric[];
  alerts: Alert[];
  onNavigate: (page: NavigationItem) => void;
}
export function DashboardPage({
  user,
  appointments,
  healthMetrics,
  alerts,
  onNavigate,
}: DashboardPageProps) {
  const upcomingAppointments = appointments
    .filter((apt) => apt.status === "upcoming")
    .slice(0, 3);
  const criticalAlerts = alerts.filter(
    (alert) => !alert.isRead && alert.type === "critical"
  );
  const latestMetrics = healthMetrics.slice(0, 4);
  const quickActions = [
    {
      id: "input-metrics",
      label: "Nhập chỉ số",
      icon: Plus,
      color: "bg-blue-500",
      onClick: () => onNavigate("monitoring"),
    },
    {
      id: "book-appointment",
      label: "Đặt lịch",
      icon: Calendar,
      color: "bg-green-500",
      onClick: () => onNavigate("appointments"),
    },
    {
      id: "ai-chat",
      label: "Tư vấn với AI",
      icon: MessageCircle,
      color: "bg-purple-500",
      onClick: () => onNavigate("ai-assistant"),
    },
    {
      id: "telehealth",
      label: "Xem kết quả",
      icon: FileText,
      color: "bg-orange-500",
      onClick: () => onNavigate("telehealth"),
    },
  ] as any[];
  const getCKDStageColor = (stage: number) => {
    if (stage <= 2) return "bg-green-100 text-green-800";
    if (stage === 3) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };
  const getMetricIcon = (type: string) => {
    switch (type) {
      case "egfr":
        return Activity;
      case "creatinine":
        return Droplets;
      case "bp":
        return Heart;
      case "weight":
        return Weight;
      default:
        return Activity;
    }
  };
  const getMetricLabel = (type: string) => {
    switch (type) {
      case "egfr":
        return "eGFR";
      case "creatinine":
        return "Creatinine";
      case "bp":
        return "Huyết áp";
      case "weight":
        return "Cân nặng";
      default:
        return type;
    }
  };
  const mockArticles = [
    {
      id: "1",
      title: "Chế độ ăn cho người bệnh thận mạn",
      excerpt: "Hướng dẫn chi tiết về chế độ dinh dưỡng phù hợp...",
      image: "/api/placeholder/300/200",
      readTime: "5 phút đọc",
    },
    {
      id: "2",
      title: "Tập thể dục an toàn với CKD",
      excerpt: "Các bài tập phù hợp cho từng giai đoạn bệnh...",
      image: "/api/placeholder/300/200",
      readTime: "7 phút đọc",
    },
    {
      id: "3",
      title: "Hiểu về chỉ số eGFR",
      excerpt: "Ý nghĩa và cách theo dõi chỉ số quan trọng này...",
      image: "/api/placeholder/300/200",
      readTime: "4 phút đọc",
    },
  ] as any[];
  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Welcome Section */}
      <div
        className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white"
        style={{
          background:
            "linear-gradient(90deg, oklch(0.546 0.245 262.881) 0%, oklch(0.488 0.243 264.376) 100%)",
        }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">
          Chào mừng trở lại, {user.name.split(" ").pop()}!
        </h1>
        <p className="text-blue-100 mb-4">
          Hôm nay là ngày tốt để chăm sóc sức khỏe của bạn
        </p>
        <div
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCKDStageColor(
            user.ckdStage
          )}`}
          style={{
            display: "none",
          }}
        >
          CKD Giai đoạn {user.ckdStage}
        </div>
      </div>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <div
          className="bg-red-50 border border-red-200 rounded-2xl p-4"
          style={{
            display: "none",
          }}
        >
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Cảnh báo quan trọng
              </h3>
              {criticalAlerts.map((alert) => (
                <div key={alert.id} className="mb-3 last:mb-0">
                  <p className="font-medium text-red-800">{alert.title}</p>
                  <p className="text-red-700 text-sm mt-1">{alert.message}</p>
                </div>
              ))}
              <button className="mt-3 text-red-700 hover:text-red-800 text-sm font-medium flex items-center">
                Xem chi tiết <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Thao tác nhanh
        </h2>
        <div className="grid grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={action.onClick}
                className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                <div
                  className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-3`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Health Metrics Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Chỉ số sức khỏe
              </h2>
              <button
                onClick={() => onNavigate("monitoring")}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
              >
                Xem biểu đồ <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {latestMetrics.map((metric) => {
                const Icon = getMetricIcon(metric.type);
                return (
                  <div key={metric.id} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <Icon
                        className={`w-5 h-5 ${
                          metric.isAlert ? "text-red-500" : "text-blue-500"
                        }`}
                      />
                      {metric.isAlert && (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {getMetricLabel(metric.type)}
                    </p>
                    <p
                      className={`text-lg font-semibold ${
                        metric.isAlert ? "text-red-600" : "text-gray-900"
                      }`}
                    >
                      {metric.value} {metric.unit}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Consultations */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Tư vấn gần đây
            </h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                <Video className="w-5 h-5 text-blue-500" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    BS. Trần Minh Hoàng
                  </p>
                  <p className="text-sm text-gray-600">
                    Tư vấn thận học - 12/01/2024
                  </p>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Xem lại
                </button>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                <FileText className="w-5 h-5 text-green-500" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">BS. Lê Thị Mai</p>
                  <p className="text-sm text-gray-600">
                    Khám tổng quát - 08/01/2024
                  </p>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Xem lại
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Today's Schedule */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Lịch hôm nay
            </h2>
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-3">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-3 bg-blue-50 rounded-xl"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900">
                        {appointment.time}
                      </span>
                      {appointment.canJoin && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Có thể vào
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-gray-900">
                      {appointment.service}
                    </p>
                    <p className="text-sm text-gray-600">
                      {appointment.doctor}
                    </p>
                  </div>
                ))}
                <button
                  onClick={() => onNavigate("appointments")}
                  className="w-full mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center justify-center"
                >
                  Xem tất cả <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">
                  Không có lịch hẹn hôm nay
                </p>
                <button
                  onClick={() => onNavigate("appointments")}
                  className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Đặt lịch mới
                </button>
              </div>
            )}
          </div>

          {/* Medication Reminders */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Nhắc nhở thuốc
            </h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-xl">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Losartan 50mg</p>
                  <p className="text-sm text-gray-600">8:00 AM</p>
                </div>
                <button className="text-green-600 hover:text-green-700">
                  <CheckCircle2 className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl opacity-60">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Furosemide 40mg</p>
                  <p className="text-sm text-gray-600">6:00 AM - Đã uống</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Articles */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Bài viết đề xuất
          </h2>
          <button
            onClick={() => onNavigate("community")}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
          >
            Xem thêm <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockArticles.map((article) => (
            <div key={article.id} className="group cursor-pointer">
              <div className="aspect-video bg-gray-200 rounded-xl mb-3 overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {article.title}
              </h3>
              <p className="text-sm text-gray-600 mb-2">{article.excerpt}</p>
              <div className="flex items-center text-xs text-gray-500">
                <BookOpen className="w-3 h-3 mr-1" />
                {article.readTime}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
