"use client";

import React from 'react';
import { Activity, Heart, Droplets, Weight, AlertTriangle, ArrowRight } from 'lucide-react';
import { HealthMetric } from '../types';

interface HealthMetricsProps {
  metrics: HealthMetric[];
  onNavigate: (page: string) => void;
}

export function HealthMetrics({ metrics, onNavigate }: HealthMetricsProps) {
  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'egfr':
        return Activity;
      case 'creatinine':
        return Droplets;
      case 'bp':
        return Heart;
      case 'weight':
        return Weight;
      default:
        return Activity;
    }
  };

  const getMetricLabel = (type: string) => {
    switch (type) {
      case 'egfr':
        return 'eGFR';
      case 'creatinine':
        return 'Creatinine';
      case 'bp':
        return 'Huyết áp';
      case 'weight':
        return 'Cân nặng';
      default:
        return type;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Chỉ số sức khỏe</h2>
        <button 
          onClick={() => onNavigate('monitoring')} 
          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
        >
          Xem biểu đồ <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {metrics.map(metric => {
          const Icon = getMetricIcon(metric.type);
          return (
            <div key={metric.id} className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${metric.isAlert ? 'text-red-500' : 'text-blue-500'}`} />
                {metric.isAlert && <AlertTriangle className="w-4 h-4 text-red-500" />}
              </div>
              <p className="text-sm text-gray-600 mb-1">{getMetricLabel(metric.type)}</p>
              <p className={`text-lg font-semibold ${metric.isAlert ? 'text-red-600' : 'text-gray-900'}`}>
                {metric.value} {metric.unit}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
