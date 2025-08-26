"use client";

import React, { useState } from "react";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Activity,
  Droplets,
  Heart,
  Weight,
  AlertTriangle,
  Settings,
  Clock,
  Calendar,
  Bell,
  BellOff,
  Edit,
  Trash2,
  RotateCcw,
  Filter,
  Download,
} from "lucide-react";
import { User as UserType, HealthMetric } from "../types";
interface MonitoringPageProps {
  user: UserType;
  healthMetrics: HealthMetric[];
}
type MonitoringView = "overview" | "thresholds" | "reminders";
type TimeFilter = "1M" | "3M" | "6M" | "1Y";
type MetricType =
  | "all"
  | "egfr"
  | "creatinine"
  | "bp"
  | "protein"
  | "bun"
  | "weight";
interface Threshold {
  id: string;
  type: MetricType;
  label: string;
  min: number;
  max: number;
  unit: string;
  isEnabled: boolean;
}
interface Reminder {
  id: string;
  type: "medication" | "test";
  title: string;
  dosage?: string;
  frequency: "daily" | "weekly" | "monthly";
  times: string[];
  isEnabled: boolean;
  lastTaken?: string;
}
interface NewMeasurement {
  type: MetricType;
  value: string;
  unit: string;
  date: string;
  time: string;
}
export function MonitoringPage({ user, healthMetrics }: MonitoringPageProps) {
  const [currentView, setCurrentView] = useState<MonitoringView>("overview");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("3M");
  const [metricFilter, setMetricFilter] = useState<MetricType>("all");
  const [showNewMeasurement, setShowNewMeasurement] = useState(false);
  const [showNewReminder, setShowNewReminder] = useState(false);
  const [newMeasurement, setNewMeasurement] = useState<NewMeasurement>({
    type: "egfr",
    value: "",
    unit: "mL/min/1.73m²",
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().slice(0, 5),
  });
  const thresholds: Threshold[] = [
    {
      id: "1",
      type: "egfr",
      label: "eGFR",
      min: 60,
      max: 120,
      unit: "mL/min/1.73m²",
      isEnabled: true,
    },
    {
      id: "2",
      type: "creatinine",
      label: "Creatinine",
      min: 0.6,
      max: 1.2,
      unit: "mg/dL",
      isEnabled: true,
    },
    {
      id: "3",
      type: "bp",
      label: "Huyết áp tâm thu",
      min: 90,
      max: 140,
      unit: "mmHg",
      isEnabled: true,
    },
    {
      id: "4",
      type: "protein",
      label: "Protein niệu",
      min: 0,
      max: 150,
      unit: "mg/24h",
      isEnabled: false,
    },
    {
      id: "5",
      type: "bun",
      label: "BUN",
      min: 7,
      max: 20,
      unit: "mg/dL",
      isEnabled: false,
    },
  ];
  const reminders: Reminder[] = [
    {
      id: "1",
      type: "medication",
      title: "Losartan 50mg",
      dosage: "1 viên",
      frequency: "daily",
      times: ["08:00"],
      isEnabled: true,
      lastTaken: "2024-01-15T08:00:00",
    },
    {
      id: "2",
      type: "medication",
      title: "Furosemide 40mg",
      dosage: "1 viên",
      frequency: "daily",
      times: ["08:00"],
      isEnabled: true,
      lastTaken: "2024-01-15T08:00:00",
    },
    {
      id: "3",
      type: "test",
      title: "Xét nghiệm máu định kỳ",
      frequency: "monthly",
      times: ["09:00"],
      isEnabled: true,
    },
  ];
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
      case "protein":
        return "Protein niệu";
      case "bun":
        return "BUN";
      default:
        return type;
    }
  };
  const getUnitForType = (type: MetricType) => {
    switch (type) {
      case "egfr":
        return "mL/min/1.73m²";
      case "creatinine":
        return "mg/dL";
      case "bp":
        return "mmHg";
      case "weight":
        return "kg";
      case "protein":
        return "mg/24h";
      case "bun":
        return "mg/dL";
      default:
        return "";
    }
  };
  const handleMeasurementTypeChange = (type: MetricType) => {
    setNewMeasurement({
      ...newMeasurement,
      type,
      unit: getUnitForType(type),
      value: "",
    });
  };
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Thời gian:
              </span>
            </div>
            <div className="flex space-x-2">
              {(["1M", "3M", "6M", "1Y"] as TimeFilter[]).map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeFilter(period)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    timeFilter === period
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={metricFilter}
              onChange={(e) => setMetricFilter(e.target.value as MetricType)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả chỉ số</option>
              <option value="egfr">eGFR</option>
              <option value="creatinine">Creatinine</option>
              <option value="bp">Huyết áp</option>
              <option value="protein">Protein niệu</option>
              <option value="bun">BUN</option>
            </select>

            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Xuất báo cáo</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">eGFR gần nhất</p>
                <p className="text-2xl font-bold text-gray-900">
                  {user.lastEgfr}
                </p>
                <p className="text-xs text-gray-500">mL/min/1.73m²</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center text-red-600">
                <TrendingDown className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">-5%</span>
              </div>
              <p className="text-xs text-gray-500">so với tháng trước</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-red-500 h-2 rounded-full"
              style={{
                width: "37%",
              }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Dưới ngưỡng bình thường (60-120)
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <Droplets className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Creatinine</p>
                <p className="text-2xl font-bold text-gray-900">
                  {user.lastCreatinine}
                </p>
                <p className="text-xs text-gray-500">mg/dL</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center text-red-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">+8%</span>
              </div>
              <p className="text-xs text-gray-500">so với tháng trước</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-red-500 h-2 rounded-full"
              style={{
                width: "75%",
              }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Trên ngưỡng bình thường (0.6-1.2)
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Huyết áp</p>
                <p className="text-2xl font-bold text-gray-900">
                  {user.lastBp}
                </p>
                <p className="text-xs text-gray-500">mmHg</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center text-green-600">
                <TrendingDown className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">-3%</span>
              </div>
              <p className="text-xs text-gray-500">so với tháng trước</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-yellow-500 h-2 rounded-full"
              style={{
                width: "60%",
              }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Hơi cao (bình thường {"<"}140/90)
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Biểu đồ theo dõi
          </h2>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="rounded" />
              <span className="text-sm text-gray-600">
                So sánh eGFR & Creatinine
              </span>
            </label>
          </div>
        </div>

        {/* Mock Chart Area */}
        <div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center">
          <div className="text-center text-gray-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Biểu đồ sẽ hiển thị xu hướng chỉ số theo thời gian</p>
            <p className="text-sm mt-1">Dữ liệu từ {timeFilter} gần nhất</p>
          </div>
        </div>

        {/* Safe Zone Indicator */}
        <div className="mt-4 flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-200 rounded"></div>
            <span className="text-gray-600">Vùng an toàn</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-200 rounded"></div>
            <span className="text-gray-600">Cần theo dõi</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-200 rounded"></div>
            <span className="text-gray-600">Nguy hiểm</span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Cảnh báo gần đây
        </h2>
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-red-900">
                eGFR dưới ngưỡng an toàn
              </p>
              <p className="text-red-700 text-sm mt-1">
                Chỉ số eGFR 45 mL/min/1.73m² trong 2 lần đo liên tiếp. Khuyến
                nghị đặt lịch khám với bác sĩ.
              </p>
              <div className="flex items-center space-x-4 mt-3">
                <button className="text-red-700 hover:text-red-800 text-sm font-medium">
                  Đặt lịch khám
                </button>
                <span className="text-red-600 text-xs">10/01/2024</span>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-yellow-900">Huyết áp tăng nhẹ</p>
              <p className="text-yellow-700 text-sm mt-1">
                Huyết áp 140/90 mmHg - hơi cao so với mức khuyến nghị. Theo dõi
                thêm và hạn chế muối.
              </p>
              <div className="flex items-center space-x-4 mt-3">
                <button className="text-yellow-700 hover:text-yellow-800 text-sm font-medium">
                  Xem gợi ý
                </button>
                <span className="text-yellow-600 text-xs">12/01/2024</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Reminders Sidebar */}
      <div className="lg:hidden bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Nhắc nhở hôm nay
        </h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-xl">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Losartan 50mg</p>
              <p className="text-sm text-gray-600">8:00 AM - Chưa uống</p>
            </div>
            <button className="text-green-600 hover:text-green-700">
              <Clock className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Xét nghiệm máu</p>
              <p className="text-sm text-gray-600">Nhắc nhở hàng tháng</p>
            </div>
            <button className="text-blue-600 hover:text-blue-700">
              <Calendar className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowNewMeasurement(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* New Measurement Modal */}
      {showNewMeasurement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Nhập chỉ số mới
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại chỉ số
                </label>
                <select
                  value={newMeasurement.type}
                  onChange={(e) =>
                    handleMeasurementTypeChange(e.target.value as MetricType)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="egfr">eGFR</option>
                  <option value="creatinine">Creatinine</option>
                  <option value="bp">Huyết áp</option>
                  <option value="weight">Cân nặng</option>
                  <option value="protein">Protein niệu</option>
                  <option value="bun">BUN</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá trị
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={newMeasurement.value}
                    onChange={(e) =>
                      setNewMeasurement({
                        ...newMeasurement,
                        value: e.target.value,
                      })
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập giá trị"
                  />
                  <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600 min-w-0">
                    {newMeasurement.unit}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Đơn vị chuẩn: {getUnitForType(newMeasurement.type)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày
                  </label>
                  <input
                    type="date"
                    value={newMeasurement.date}
                    onChange={(e) =>
                      setNewMeasurement({
                        ...newMeasurement,
                        date: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giờ
                  </label>
                  <input
                    type="time"
                    value={newMeasurement.time}
                    onChange={(e) =>
                      setNewMeasurement({
                        ...newMeasurement,
                        time: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowNewMeasurement(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  // Handle save logic here
                  setShowNewMeasurement(false);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  const renderThresholds = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Ngưỡng cảnh báo
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Thiết lập ngưỡng để nhận cảnh báo khi chỉ số vượt quá giới hạn an
            toàn
          </p>
        </div>

        <div className="p-6 space-y-4">
          {thresholds.map((threshold) => (
            <div
              key={threshold.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-medium text-gray-900">
                    {threshold.label}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={threshold.isEnabled}
                        className="sr-only peer"
                        onChange={() => {}}
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full relative peer-checked:bg-blue-600 transition-colors">
                        <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform peer-checked:translate-x-full"></div>
                      </div>
                    </label>
                    <span className="text-sm text-gray-600">
                      {threshold.isEnabled ? "Bật" : "Tắt"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Min:</span>
                    <input
                      type="number"
                      value={threshold.min}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={!threshold.isEnabled}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Max:</span>
                    <input
                      type="number"
                      value={threshold.max}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={!threshold.isEnabled}
                    />
                  </div>

                  <span className="text-sm text-gray-500">
                    {threshold.unit}
                  </span>
                </div>
              </div>

              <button className="p-2 text-gray-400 hover:text-gray-600">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  const renderReminders = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button className="flex-1 px-6 py-4 text-center font-medium text-blue-600 border-b-2 border-blue-600">
              Thuốc
            </button>
            <button className="flex-1 px-6 py-4 text-center font-medium text-gray-500 hover:text-gray-700">
              Xét nghiệm
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Nhắc nhở thuốc
            </h2>
            <button
              onClick={() => setShowNewReminder(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm nhắc nhở</span>
            </button>
          </div>

          <div className="space-y-4">
            {reminders
              .filter((r) => r.type === "medication")
              .map((reminder) => (
                <div
                  key={reminder.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={reminder.isEnabled}
                          className="sr-only peer"
                          onChange={() => {}}
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full relative peer-checked:bg-blue-600 transition-colors">
                          <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform peer-checked:translate-x-full"></div>
                        </div>
                      </label>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900">
                        {reminder.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span>{reminder.dosage}</span>
                        <span>•</span>
                        <span>
                          {reminder.frequency === "daily"
                            ? "Hàng ngày"
                            : reminder.frequency === "weekly"
                            ? "Hàng tuần"
                            : "Hàng tháng"}
                        </span>
                        <span>•</span>
                        <span>{reminder.times.join(", ")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* New Reminder Modal */}
      {showNewReminder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tạo nhắc nhở mới
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên thuốc/xét nghiệm
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ví dụ: Losartan 50mg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="medication">Thuốc</option>
                  <option value="test">Xét nghiệm</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Liều lượng (tùy chọn)
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ví dụ: 1 viên"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tần suất
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="daily">Hàng ngày</option>
                  <option value="weekly">Hàng tuần</option>
                  <option value="monthly">Hàng tháng</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giờ nhắc nhở
                </label>
                <input
                  type="time"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowNewReminder(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  // Handle save logic here
                  setShowNewReminder(false);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tạo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  return (
    <div className="h-full flex flex-col">
      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6">
        <div className="flex space-x-8">
          <button
            onClick={() => setCurrentView("overview")}
            className={`py-4 px-2 border-b-2 font-medium text-sm ${
              currentView === "overview"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Tổng quan
          </button>
          <button
            onClick={() => setCurrentView("thresholds")}
            className={`py-4 px-2 border-b-2 font-medium text-sm ${
              currentView === "thresholds"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Ngưỡng cảnh báo
          </button>
          <button
            onClick={() => setCurrentView("reminders")}
            className={`py-4 px-2 border-b-2 font-medium text-sm ${
              currentView === "reminders"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Nhắc nhở
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 lg:p-6 overflow-auto">
        {currentView === "overview" && renderOverview()}
        {currentView === "thresholds" && renderThresholds()}
        {currentView === "reminders" && renderReminders()}
      </div>
    </div>
  );
}
