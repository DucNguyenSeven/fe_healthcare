// User related types
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'patient' | 'doctor' | 'admin';
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  preferences: {
    language: 'vi' | 'en';
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    theme: 'light' | 'dark' | 'system';
  };
  createdAt: string;
  updatedAt: string;
}

export interface DoctorProfile extends UserProfile {
  role: 'doctor';
  specialization: string[];
  licenseNumber: string;
  experience: number;
  education: {
    degree: string;
    institution: string;
    year: number;
  }[];
  certifications: {
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate?: string;
  }[];
  availability: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[];
}

export interface PatientProfile extends UserProfile {
  role: 'patient';
  medicalHistory?: {
    allergies: string[];
    medications: string[];
    conditions: string[];
    emergencyContact: {
      name: string;
      relationship: string;
      phone: string;
    };
  };
}

export interface UserQueryParams {
  search?: string;
  role?: UserProfile['role'];
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'lastName' | 'email';
  sortOrder?: 'asc' | 'desc';
}

// Auth form types
export interface ForgotFormData {
  email: string;
}

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}
