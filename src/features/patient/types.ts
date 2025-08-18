export interface User {
  id: string;
  name: string;
  avatar?: string;
  email: string;
  phone: string;
  ckdStage: number;
  lastEgfr: number;
  lastCreatinine: number;
  lastBp: string;
}

export interface Appointment {
  id: string;
  type: 'direct' | 'online';
  service: string;
  doctor: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  canJoin?: boolean;
}

export interface HealthMetric {
  id: string;
  type: 'egfr' | 'creatinine' | 'bp' | 'weight';
  value: number | string;
  date: string;
  unit: string;
  isAlert?: boolean;
}

export interface Consultation {
  id: string;
  doctor: string;
  service: string;
  date: string;
  type: 'video' | 'document';
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  readTime: string;
}

export interface MedicationReminder {
  id: string;
  name: string;
  dosage: string;
  time: string;
  isTaken: boolean;
}

// New types for additional components
export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  date: string;
  isRead: boolean;
}

// Navigation types are now imported from @/hooks/navigation
// export type NavigationItem = 'dashboard' | 'profile' | 'appointments' | 'telehealth' | 'monitoring' | 'ai-assistant' | 'community';

// Types for Community features
export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  coverImage: string;
  readTime: string;
  publishDate: string;
  tags: string[];
  author: string;
  views: number;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  thumbnail: string;
  source: string;
  publishDate: string;
  views: number;
  category: string;
}

export interface ForumPost {
  id: string;
  title: string;
  excerpt: string;
  author: {
    name: string;
    role: 'patient' | 'doctor' | 'moderator';
    avatar: string;
  };
  category: string;
  tags: string[];
  replies: number;
  upvotes: number;
  publishDate: string;
  isAnswered?: boolean;
  hasExpertReply?: boolean;
}

// Types for AI Assistant
export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  type?: 'text' | 'suggestion';
}

export interface ChatHistory {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  messageCount: number;
}

export interface UploadAnalysis {
  id: string;
  fileName: string;
  uploadDate: string;
  status: 'processing' | 'completed' | 'error';
  summary?: string;
  abnormalities?: string[];
}
