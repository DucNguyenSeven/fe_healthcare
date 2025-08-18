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
