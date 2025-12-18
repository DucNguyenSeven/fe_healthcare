"use client";

/**
 * MonitoringPage - Health Metrics Monitoring with Chart and Comparison
 * Integrated with real API and comparison features
 */

import React, { useState, useMemo } from 'react';
import { useGetMe } from '@/hooks/auth/useGetMe';
import { useHealthPanelComparison } from '@/hooks/health-metrics/useHealthPanelComparison';
import { HealthMetricsChart, type ChartDataPoint } from '@/components/charts/HealthMetricsChart';
import { InteractiveLegend } from '@/components/charts/InteractiveLegend';
import { TestHistoryTimeline } from '@/components/monitoring/TestHistoryTimeline';
import { ComparisonInfoBanner } from '@/components/monitoring/ComparisonInfoBanner';
import { TrendAnalysisTable } from '@/components/monitoring/TrendAnalysisTable';
import { HealthStatusCard } from '@/components/monitoring/HealthStatusCard';
import { PRIORITY_METRICS, getAllMetricKeys } from '@/lib/charts/metricThresholds';
import {
  getEGFRAlert,
  getCreatinineAlert,
  getBUNAlert,
  getCalciumAlert
} from '@/types/dashboard';

type MonitoringView = 'overview' | 'thresholds' | 'reminders';

export function MonitoringPage() {
  // Get current user
  const { data: user, isLoading: isLoadingUser } = useGetMe();
  const patientId = user?.userId || '';

  // View state
  const [currentView, setCurrentView] = useState<MonitoringView>('overview');
  const [selectedPanelId, setSelectedPanelId] = useState<string | null>(null);

  // Metric selection state
  const allMetricKeys = getAllMetricKeys();
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(PRIORITY_METRICS);

  // Normalize metric key from API to chart key
  const normalizeMetricKey = (apiKey: string): string => {
    const normalized = apiKey.toLowerCase();

    // Map API keys to standardized chart keys
    if (normalized.includes('gfr') || normalized === 'egfr') {
      return 'gfr';
    }
    if (normalized.includes('creatinine')) {
      return 'serum_creatinine';
    }
    if (normalized.includes('bun')) {
      return 'bun';
    }
    if (normalized.includes('canxi') || normalized.includes('calcium')) {
      return 'serum_calcium';
    }
    if (normalized.includes('ana')) {
      return 'ana';
    }
    if (normalized.includes('c3') || normalized.includes('c4') || normalized.includes('bổ thể')) {
      return 'c3_c4';
    }
    if (normalized.includes('hematuria') || normalized.includes('đái máu') || normalized.includes('hồng cầu')) {
      return 'hematuria';
    }
    if (normalized.includes('oxalat')) {
      return 'oxalate_levels';
    }
    if (normalized.includes('ph')) {
      return 'urine_ph';
    }

    // Return original if no mapping found
    return normalized;
  };

  // Get alert level for metric (defined before useMemo to avoid TDZ)
  const getMetricAlert = (metricName: string, value: number) => {
    const normalized = metricName.toLowerCase();

    if (normalized.includes('gfr')) {
      return getEGFRAlert(value).level;
    }
    if (normalized.includes('creatinine')) {
      return getCreatinineAlert(value).level;
    }
    if (normalized.includes('bun')) {
      return getBUNAlert(value).level;
    }
    if (normalized.includes('calcium') || normalized.includes('canxi')) {
      return getCalciumAlert(value).level;
    }

    return 'NORMAL';
  };

  // Fetch comparison data
  const {
    panels,
    currentPanel,
    previousPanel,
    hasComparison,
    timeDifference,
    metricChanges,
    healthAssessment,
    isLoading,
    error
  } = useHealthPanelComparison(patientId, selectedPanelId);

  // Transform panel data to chart format - include all panels for timeline visualization
  const chartData = useMemo<ChartDataPoint[]>(() => {
    if (panels.length === 0) {
      return [];
    }

    // Get all unique metric keys from all panels
    const allMetricKeysInPanels = new Set<string>();
    panels.forEach(panel => {
      Object.keys(panel.metrics).forEach(metricKey => {
        const normalizedKey = normalizeMetricKey(metricKey);
        allMetricKeysInPanels.add(normalizedKey);
      });
    });

    // Convert all panels to chart data points with consistent keys
    const dataPoints = panels.map((panel) => {
      const dataPoint: ChartDataPoint = {
        date: panel.measuredAt,
        timestamp: new Date(panel.measuredAt).getTime()
      };

      // Initialize all metrics as null (for missing values)
      allMetricKeysInPanels.forEach(key => {
        dataPoint[key] = null;
        dataPoint[`${key}Alert`] = null;
      });

      // Add actual metric values with normalized keys
      Object.keys(panel.metrics).forEach(metricKey => {
        const metric = panel.metrics[metricKey];
        const value = typeof metric.value === 'string' ? parseFloat(metric.value) : metric.value;

        if (!isNaN(value)) {
          // Normalize the metric key to match chart expectations
          const normalizedKey = normalizeMetricKey(metricKey);
          dataPoint[normalizedKey] = value;

          // Add alert level using normalized key
          const alert = getMetricAlert(metricKey, value);
          if (alert) {
            dataPoint[`${normalizedKey}Alert`] = alert;
          }
        }
      });

      return dataPoint;
    });

    // Sort by timestamp ascending (oldest to newest) for proper line chart rendering
    return dataPoints.sort((a, b) => a.timestamp - b.timestamp);
  }, [panels]);

  // Previous panel chart data
  const previousChartData = useMemo<ChartDataPoint[]>(() => {
    if (!previousPanel) return [];

    const dataPoint: ChartDataPoint = {
      date: previousPanel.measuredAt,
      timestamp: new Date(previousPanel.measuredAt).getTime()
    };

    // Initialize all selected metrics as null
    selectedMetrics.forEach(key => {
      dataPoint[key] = null;
      dataPoint[`${key}Alert`] = null;
    });

    // Add actual metric values with normalized keys
    Object.keys(previousPanel.metrics).forEach(metricKey => {
      const metric = previousPanel.metrics[metricKey];
      const value = typeof metric.value === 'string' ? parseFloat(metric.value) : metric.value;

      if (!isNaN(value)) {
        // Normalize the metric key to match chart expectations
        const normalizedKey = normalizeMetricKey(metricKey);
        dataPoint[normalizedKey] = value;

        // Add alert level using normalized key
        const alert = getMetricAlert(metricKey, value);
        if (alert) {
          dataPoint[`${normalizedKey}Alert`] = alert;
        }
      }
    });

    return [dataPoint];
  }, [previousPanel, selectedMetrics]);

  // Toggle metric visibility
  const handleMetricToggle = (metricKey: string) => {
    setSelectedMetrics(prev => {
      if (prev.includes(metricKey)) {
        return prev.filter(m => m !== metricKey);
      } else {
        return [...prev, metricKey];
      }
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">Có lỗi xảy ra khi tải dữ liệu</p>
          <p className="text-gray-600 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  // No data state
  if (!currentPanel || panels.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="bg-white border-b border-gray-200 px-4 lg:px-6">
          <div className="flex space-x-8">
            <button className="py-4 px-2 border-b-2 border-blue-500 text-blue-600 font-medium text-sm">
              Tổng quan
            </button>
          </div>
        </div>

        <div className="flex-1 p-4 lg:p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có dữ liệu xét nghiệm</h3>
            <p className="text-gray-600 mb-4">
              Vui lòng đi tới trang <span className="font-medium">Hồ sơ → Lịch sử xét nghiệm</span> để nhập kết quả xét nghiệm
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render Overview Tab
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Timeline Selector */}
      {panels.length > 0 && (
        <TestHistoryTimeline
          panels={panels}
          selectedPanelId={selectedPanelId}
          onPanelSelect={setSelectedPanelId}
        />
      )}

      {/* Comparison Info Banner */}
      <ComparisonInfoBanner
        currentPanel={currentPanel}
        previousPanel={previousPanel}
        hasComparison={hasComparison}
        timeDifference={timeDifference}
      />

      {/* Chart Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">📊 Biểu đồ theo dõi chỉ số</h2>

        {/* Chart */}
        <HealthMetricsChart
          data={chartData}
          comparisonData={hasComparison ? previousChartData : undefined}
          selectedMetrics={selectedMetrics}
          hasComparison={hasComparison}
          height={400}
        />

        {/* Legend */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <InteractiveLegend
            metrics={allMetricKeys}
            selectedMetrics={selectedMetrics}
            onMetricToggle={handleMetricToggle}
            hasComparison={hasComparison}
          />
        </div>
      </div>

      {/* Trend Analysis Table */}
      {hasComparison && metricChanges.length > 0 && (
        <TrendAnalysisTable
          metricChanges={metricChanges}
          hasComparison={hasComparison}
        />
      )}

      {/* Health Status Card */}
      {healthAssessment && (
        <HealthStatusCard
          assessment={healthAssessment}
          onBookAppointment={() => {
            // Navigate to appointments
            window.location.href = '/patient/appointments';
          }}
          onAIConsult={() => {
            // Navigate to AI assistant
            window.location.href = '/patient/ai-assistant';
          }}
        />
      )}
    </div>
  );

  // Render Thresholds Tab (placeholder)
  const renderThresholds = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Ngưỡng cảnh báo</h2>
      <p className="text-gray-600">Tính năng đang được phát triển...</p>
    </div>
  );

  // Render Reminders Tab (placeholder)
  const renderReminders = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Nhắc nhở</h2>
      <p className="text-gray-600">Tính năng đang được phát triển...</p>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6">
        <div className="flex space-x-8">
          <button
            onClick={() => setCurrentView('overview')}
            className={`py-4 px-2 border-b-2 font-medium text-sm ${
              currentView === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Tổng quan
          </button>
          <button
            onClick={() => setCurrentView('thresholds')}
            className={`py-4 px-2 border-b-2 font-medium text-sm ${
              currentView === 'thresholds'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Ngưỡng cảnh báo
          </button>
          <button
            onClick={() => setCurrentView('reminders')}
            className={`py-4 px-2 border-b-2 font-medium text-sm ${
              currentView === 'reminders'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Nhắc nhở
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 lg:p-6 overflow-auto">
        {currentView === 'overview' && renderOverview()}
        {currentView === 'thresholds' && renderThresholds()}
        {currentView === 'reminders' && renderReminders()}
      </div>
    </div>
  );
}
