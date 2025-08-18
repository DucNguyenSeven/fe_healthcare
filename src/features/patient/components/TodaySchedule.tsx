"use client";

import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { Appointment } from '../types';

interface TodayScheduleProps {
  appointments: Appointment[];
  onNavigate: (page: string) => void;
}

export function TodaySchedule({ appointments, onNavigate }: TodayScheduleProps) {
  const upcomingAppointments = appointments.filter(apt => apt.status === 'upcoming').slice(0, 3);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Lịch hôm nay</h2>
      {upcomingAppointments.length > 0 ? (
        <div className="space-y-3">
          {upcomingAppointments.map(appointment => (
            <div key={appointment.id} className="p-3 bg-blue-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900">{appointment.time}</span>
                {appointment.canJoin && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Có thể vào
                  </span>
                )}
              </div>
              <p className="font-medium text-gray-900">{appointment.service}</p>
              <p className="text-sm text-gray-600">{appointment.doctor}</p>
            </div>
          ))}
          <button 
            onClick={() => onNavigate('appointments')} 
            className="w-full mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center justify-center"
          >
            Xem tất cả <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      ) : (
        <div className="text-center py-4">
          <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">Không có lịch hẹn hôm nay</p>
          <button 
            onClick={() => onNavigate('appointments')} 
            className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Đặt lịch mới
          </button>
        </div>
      )}
    </div>
  );
}
