"use client";

import React from "react";
import { Plus, Calendar, MessageCircle, FileText } from "lucide-react";

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  onClick: () => void;
}

interface QuickActionsProps {
  onNavigate: (page: string) => void;
}

export function QuickActions({ onNavigate }: QuickActionsProps) {
  const quickActions: QuickAction[] = [
    {
      id: "input-metrics",
      label: "Nhập chỉ số",
      icon: Plus,
      color: "bg-blue-500",
      onClick: () => onNavigate("monitoring"),
    },
    {
      id: "book-appointment",
      label: "Đặt lịch",
      icon: Calendar,
      color: "bg-green-500",
      onClick: () => onNavigate("appointments"),
    },
    {
      id: "ai-chat",
      label: "Tư vấn với AI",
      icon: MessageCircle,
      color: "bg-purple-500",
      onClick: () => onNavigate("ai-assistant"),
    },
    {
      id: "telehealth",
      label: "Xem kết quả",
      icon: FileText,
      color: "bg-orange-500",
      onClick: () => onNavigate("telehealth"),
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Thao tác nhanh
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={action.onClick}
              className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              <div
                className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-3`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-900 text-center">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
