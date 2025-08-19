"use client";

import React from 'react';
import { Video, FileText } from 'lucide-react';
import { Consultation } from '../types';

interface RecentConsultationsProps {
  consultations: Consultation[];
}

export function RecentConsultations({ consultations }: RecentConsultationsProps) {
  const displayConsultations = consultations;

  const getIcon = (type: 'video' | 'document') => {
    return type === 'video' ? Video : FileText;
  };

  const getIconColor = (type: 'video' | 'document') => {
    return type === 'video' ? 'text-blue-500' : 'text-green-500';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Tư vấn gần đây</h2>
      <div className="space-y-3">
        {displayConsultations.map(consultation => {
          const Icon = getIcon(consultation.type);
          const iconColor = getIconColor(consultation.type);
          
          return (
            <div key={consultation.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
              <Icon className={`w-5 h-5 ${iconColor}`} />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{consultation.doctor}</p>
                <p className="text-sm text-gray-600">{consultation.service}</p>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Xem lại
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
