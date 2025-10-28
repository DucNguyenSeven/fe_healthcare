'use client';

import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { EpisodeGroup } from '@/types/medical-record';

interface EpisodeHeaderProps {
  episode: EpisodeGroup;
  isExpanded: boolean;
  onToggle: () => void;
}

/**
 * Collapsible episode header component
 * Displays episode summary info and toggle button
 */
export const EpisodeHeader: React.FC<EpisodeHeaderProps> = ({ episode, isExpanded, onToggle }) => {
  const firstVisitDate = format(new Date(episode.firstVisitDate), 'dd/MM/yyyy', { locale: vi });

  return (
    <div
      className={`rounded-xl p-4 cursor-pointer transition-all duration-200 ${
        episode.isCurrentEpisode
          ? 'border-2 border-blue-600 bg-blue-50 hover:bg-blue-100'
          : 'border border-gray-300 bg-gray-50 hover:bg-gray-100'
      }`}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">📂</span>
          <span className="text-base font-semibold text-gray-900">
            {episode.isCurrentEpisode ? 'Đợt điều trị hiện tại' : 'Đợt điều trị trước'}
          </span>
          {episode.isCurrentEpisode && (
            <span className="ml-2 px-2.5 py-0.5 bg-blue-600 text-white rounded-full text-xs font-medium">
              Hiện tại
            </span>
          )}
        </div>

        <div className="text-gray-600">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
        <span className="flex items-center gap-1">
          📅 Khám lần đầu: <strong className="text-gray-900">{firstVisitDate}</strong>
        </span>
        <span className="flex items-center gap-1">
          🔢 Tổng: <strong className="text-gray-900">{episode.totalVisitsInEpisode} lần khám</strong>
        </span>
        {episode.serviceName && (
          <span className="flex items-center gap-1">
            🏥 Dịch vụ: <strong className="text-gray-900">{episode.serviceName}</strong>
          </span>
        )}
      </div>

      {episode.rootDiagnosis && (
        <div className="mt-2 text-xs text-gray-500">
          Chẩn đoán ban đầu: {episode.rootDiagnosis}
        </div>
      )}
    </div>
  );
};
