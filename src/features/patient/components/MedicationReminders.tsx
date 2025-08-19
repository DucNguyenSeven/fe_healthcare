"use client";

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { MedicationReminder } from '../types';

interface MedicationRemindersProps {
  reminders: MedicationReminder[];
}

export function MedicationReminders({ reminders }: MedicationRemindersProps) {
  const displayReminders = reminders;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Nhắc nhở thuốc</h2>
      <div className="space-y-3">
        {displayReminders.map(reminder => (
          <div 
            key={reminder.id} 
            className={`flex items-center space-x-3 p-3 rounded-xl ${
              reminder.isTaken ? 'bg-gray-50 opacity-60' : 'bg-yellow-50'
            }`}
          >
            {reminder.isTaken ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            )}
            <div className="flex-1">
              <p className="font-medium text-gray-900">{reminder.name}</p>
              <p className="text-sm text-gray-600">
                {reminder.time}
                {reminder.isTaken && ' - Đã uống'}
              </p>
            </div>
            {!reminder.isTaken && (
              <button className="text-green-600 hover:text-green-700">
                <CheckCircle2 className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
