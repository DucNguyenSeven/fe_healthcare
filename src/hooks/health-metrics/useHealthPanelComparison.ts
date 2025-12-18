/**
 * useHealthPanelComparison Hook
 * Manages health panel selection, comparison logic, and assessment generation
 */

import { useMemo } from 'react';
import { usePatientHealthPanels, type HealthMetricPanelRow } from './usePatientPanels';
import {
  calculateAllMetricChanges,
  type MetricChange
} from '@/lib/health-assessment/metricChangeCalculator';
import {
  generateComparisonAssessment,
  generateSinglePanelAssessment,
  type HealthStatusAssessment
} from '@/lib/health-assessment/healthAssessment';

// Re-export HealthMetricPanelRow as HealthPanel for backward compatibility
export type HealthPanel = HealthMetricPanelRow;

export interface PanelComparison {
  currentPanel: HealthPanel | null;
  previousPanel: HealthPanel | null;
  hasComparison: boolean;
  timeDifference?: {
    days: number;
    months: number;
    formatted: string; // "2 tháng 5 ngày"
  };
}

interface UseHealthPanelComparisonResult {
  // All panels sorted by date (newest first)
  panels: HealthPanel[];

  // Current selected panel
  currentPanel: HealthPanel | null;

  // Previous panel for comparison (if exists)
  previousPanel: HealthPanel | null;

  // Whether comparison is available
  hasComparison: boolean;

  // Time difference between current and previous
  timeDifference: {
    days: number;
    months: number;
    formatted: string;
  } | null;

  // Metric changes
  metricChanges: MetricChange[];

  // Health assessment
  healthAssessment: HealthStatusAssessment | null;

  // Loading state
  isLoading: boolean;

  // Error state
  error: Error | null;
}

/**
 * Calculate time difference between two dates
 */
function calculateTimeDifference(
  currentDate: string,
  previousDate: string
): { days: number; months: number; formatted: string } {
  const current = new Date(currentDate);
  const previous = new Date(previousDate);

  const diffMs = current.getTime() - previous.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30);
  const remainingDays = diffDays % 30;

  let formatted = '';
  if (diffMonths > 0) {
    formatted += `${diffMonths} tháng`;
  }
  if (remainingDays > 0) {
    if (formatted) formatted += ' ';
    formatted += `${remainingDays} ngày`;
  }
  if (!formatted) {
    formatted = 'Cùng ngày';
  }

  return {
    days: diffDays,
    months: diffMonths,
    formatted: formatted.trim()
  };
}

/**
 * Hook to manage health panel comparison
 */
export function useHealthPanelComparison(
  patientId: string,
  selectedPanelId: string | null
): UseHealthPanelComparisonResult {
  // Fetch all panels
  const { panels: panelsData, loading: isLoading, error: errorMessage } = usePatientHealthPanels(patientId);
  const error = errorMessage ? new Error(errorMessage) : null;

  // Sort panels by measuredAt (newest first)
  const sortedPanels = useMemo(() => {
    if (!panelsData || panelsData.length === 0) return [];

    return [...panelsData].sort((a, b) => {
      const dateA = new Date(a.measuredAt).getTime();
      const dateB = new Date(b.measuredAt).getTime();
      return dateB - dateA; // Descending order (newest first)
    });
  }, [panelsData]);

  // Determine current panel
  const currentPanel = useMemo(() => {
    if (sortedPanels.length === 0) return null;

    if (!selectedPanelId) {
      // No selection -> return newest panel
      return sortedPanels[0];
    }

    // Find selected panel
    const found = sortedPanels.find(p => p.id === selectedPanelId);
    return found || sortedPanels[0]; // Fallback to newest
  }, [sortedPanels, selectedPanelId]);

  // Find previous panel (panel right before current)
  const previousPanel = useMemo(() => {
    if (!currentPanel || sortedPanels.length === 0) return null;

    const currentIndex = sortedPanels.findIndex(p => p.id === currentPanel.id);

    if (currentIndex === -1 || currentIndex === sortedPanels.length - 1) {
      // Not found OR is the last (oldest) panel -> no previous
      return null;
    }

    return sortedPanels[currentIndex + 1];
  }, [currentPanel, sortedPanels]);

  // Check if comparison is available
  const hasComparison = !!previousPanel;

  // Calculate time difference
  const timeDifference = useMemo(() => {
    if (!currentPanel || !previousPanel) return null;

    return calculateTimeDifference(currentPanel.measuredAt, previousPanel.measuredAt);
  }, [currentPanel, previousPanel]);

  // Calculate metric changes
  const metricChanges = useMemo(() => {
    if (!currentPanel || !previousPanel) return [];

    return calculateAllMetricChanges(currentPanel.metrics, previousPanel.metrics);
  }, [currentPanel, previousPanel]);

  // Generate health assessment
  const healthAssessment = useMemo(() => {
    if (!currentPanel) return null;

    if (!previousPanel) {
      // First test - no comparison
      return generateSinglePanelAssessment(currentPanel.metrics);
    }

    // With comparison
    return generateComparisonAssessment(
      currentPanel.metrics,
      previousPanel.metrics,
      metricChanges
    );
  }, [currentPanel, previousPanel, metricChanges]);

  return {
    panels: sortedPanels,
    currentPanel,
    previousPanel,
    hasComparison,
    timeDifference,
    metricChanges,
    healthAssessment,
    isLoading,
    error: error as Error | null
  };
}
