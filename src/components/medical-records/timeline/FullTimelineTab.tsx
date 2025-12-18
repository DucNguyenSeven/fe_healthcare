'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, Calendar } from 'lucide-react';
import { getFullTimeline } from '@/lib/api/medical-records';
import type { MedicalRecordFullTimelineResponse } from '@/types/medical-record';
import { EpisodeHeader } from './EpisodeHeader';
import { VisitCard } from './VisitCard';
import { TimelineConnector } from './TimelineConnector';

interface FullTimelineTabProps {
  recordId: string;
}

/**
 * Main container component for full timeline display
 * Fetches data and renders episode list with visits
 */
export const FullTimelineTab: React.FC<FullTimelineTabProps> = ({ recordId }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MedicalRecordFullTimelineResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedEpisodes, setExpandedEpisodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchData();
  }, [recordId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getFullTimeline(recordId);

      if (response.success && response.data) {
        setData(response.data);

        // Auto-expand current episode
        const currentEpisode = response.data.episodes.find(ep => ep.isCurrentEpisode);
        if (currentEpisode) {
          setExpandedEpisodes(new Set([currentEpisode.episodeId]));
        }
      } else {
        setError(response.message || 'Không thể tải lịch sử khám');
      }
    } catch (err: any) {
      console.error('❌ [FullTimelineTab] Error fetching timeline:', err);
      setError(err.message || 'Có lỗi xảy ra khi tải lịch sử khám');
    } finally {
      setLoading(false);
    }
  };

  const toggleEpisode = (episodeId: string) => {
    setExpandedEpisodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(episodeId)) {
        newSet.delete(episodeId);
      } else {
        newSet.add(episodeId);
      }
      return newSet;
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mr-3" />
        <span className="text-gray-600">Đang tải lịch sử khám...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center">
          <AlertCircle className="w-6 h-6 text-red-500 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-red-800">Lỗi</h3>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
        </div>
        <button
          onClick={fetchData}
          className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
        >
          Thử lại
        </button>
      </div>
    );
  }

  // Empty state
  if (!data || data.episodes.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="font-medium text-gray-700 mb-1">Chưa có lịch sử khám</h3>
        <p className="text-gray-500 text-sm">Đây là lần khám đầu tiên</p>
      </div>
    );
  }

  // Main content
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
          📋 Lịch sử khám đầy đủ
        </h3>
        <p className="text-sm text-gray-600">
          {data.totalVisits} lần khám • {data.totalEpisodes} đợt điều trị
        </p>
      </div>

      {/* Episodes List */}
      <div className="space-y-6">
        {data.episodes.map((episode, episodeIndex) => {
          const isExpanded = expandedEpisodes.has(episode.episodeId);
          const isLast = episodeIndex === data.episodes.length - 1;

          return (
            <div key={episode.episodeId} className="space-y-4">
              {/* Episode Header */}
              <EpisodeHeader
                episode={episode}
                isExpanded={isExpanded}
                onToggle={() => toggleEpisode(episode.episodeId)}
              />

              {/* Visits (when expanded) */}
              {isExpanded && (
                <div className="relative pl-4 ml-2">
                  <TimelineConnector totalVisits={episode.visits.length} />

                  {episode.visits.map((visit, visitIndex) => (
                    <VisitCard
                      key={visit.recordId}
                      visit={visit}
                      visitNumber={visit.visitNumberInEpisode}
                      isLast={visitIndex === episode.visits.length - 1}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
