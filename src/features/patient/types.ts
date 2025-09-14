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

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  date: string;
  isRead: boolean;
}

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

export interface CKDFormData {
  // Numerical features
  serum_creatinine: number;
  gfr: number;
  bun: number;
  serum_calcium: number;
  c3_c4: number;
  oxalate_levels: number;
  urine_ph: number;
  blood_pressure_systolic: number;
  blood_pressure_diastolic: number;
  water_intake: number;
  months: number;
  cluster: number;

  // Binary features
  ana: boolean;
  hematuria: boolean;
  smoking: boolean;
  painkiller_usage: boolean;
  family_history: boolean;

  // Categorical features
  physical_activity: 'daily' | 'weekly' | 'rarely' | '';
  diet: 'high protein' | 'low salt' | 'balanced' | '';
  alcohol: 'daily' | 'occasionally' | 'never' | '';
  weight_changes: 'stable' | 'loss' | 'gain' | '';
  stress_level: number; // 1-3
}

export interface CKDPredictionResult {
  risk: 'low' | 'moderate' | 'high';
  percentage: number;
  stage: string;
  recommendations: string[];
}
