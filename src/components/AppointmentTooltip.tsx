"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, FileText, Clipboard, DoorOpen, Brain } from 'lucide-react';
import type { AppointmentWeekFilterResponse } from '@/lib/api/appointments';

interface AppointmentTooltipProps {
  appointment: AppointmentWeekFilterResponse;
  children: React.ReactNode;
  getStatusLabel: (status: string) => string;
}

export const AppointmentTooltip: React.FC<AppointmentTooltipProps> = ({
  appointment,
  children,
  getStatusLabel,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const getDayOfWeekVietnamese = (dayOfWeek: string) => {
    const mapping: Record<string, string> = {
      'MONDAY': 'Thứ 2',
      'TUESDAY': 'Thứ 3',
      'WEDNESDAY': 'Thứ 4',
      'THURSDAY': 'Thứ 5',
      'FRIDAY': 'Thứ 6',
      'SATURDAY': 'Thứ 7',
      'SUNDAY': 'Chủ nhật'
    };
    return mapping[dayOfWeek] || dayOfWeek;
  };

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      let top = triggerRect.top - tooltipRect.height - 8;
      let left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);

      // Adjust if tooltip goes off screen
      if (top < 10) {
        top = triggerRect.bottom + 8;
      }

      if (left < 10) {
        left = 10;
      } else if (left + tooltipRect.width > window.innerWidth - 10) {
        left = window.innerWidth - tooltipRect.width - 10;
      }

      setPosition({ top, left });
    }
  }, [isVisible]);

  const timeStart = appointment.timeSlot?.startTime?.substring(0, 5) || '';
  const timeEnd = appointment.timeSlot?.endTime?.substring(0, 5) || '';
  const dateFormatted = new Date(appointment.date).toLocaleDateString('vi-VN');
  const dayOfWeekVN = getDayOfWeekVietnamese(appointment.dayOfWeek);
  const statusLabel = getStatusLabel(appointment.status);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-[9999] pointer-events-none"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          <div className="bg-white text-gray-900 rounded-lg shadow-2xl p-4 max-w-xs min-w-[280px] border border-gray-200">
            {/* Header */}
            <div className="mb-3 pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={14} className="text-blue-500" />
                <span className="font-semibold text-sm text-gray-900">{appointment.patientName}</span>
              </div>
              <div className="text-xs">
                <span className={`inline-block px-2 py-0.5 rounded ${
                  appointment.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' :
                  appointment.status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                  appointment.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {statusLabel}
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2 text-xs">
              {appointment.symptoms && (
                <div className="flex items-start gap-2">
                  <Clipboard size={14} className="text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-gray-500 text-[10px] mb-0.5">Triệu chứng</div>
                    <div className="text-gray-900">{appointment.symptoms}</div>
                  </div>
                </div>
              )}

              {appointment.note && (
                <div className="flex items-start gap-2">
                  <FileText size={14} className="text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-gray-500 text-[10px] mb-0.5">Ghi chú</div>
                    <div className="text-gray-900">{appointment.note}</div>
                  </div>
                </div>
              )}

              {appointment.timeSlot?.room && (
                <div className="flex items-start gap-2">
                  <DoorOpen size={14} className="text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-gray-500 text-[10px] mb-0.5">Phòng</div>
                    <div className="text-gray-900">{appointment.timeSlot.room}</div>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-gray-200 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Clock size={12} className="text-gray-500" />
                  <span className="text-gray-700">{timeStart} - {timeEnd}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={12} className="text-gray-500" />
                  <span className="text-gray-700">{dateFormatted} ({dayOfWeekVN})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Brain size={12} className="text-gray-500" />
                  <span className="text-gray-700">AI Predict: {appointment.hasPredict ? 'Có' : 'Không'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
