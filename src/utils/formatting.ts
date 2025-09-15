// Formatting utilities
export const formatDate = (date: string | Date, format: 'short' | 'long' | 'time' = 'short'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Ho_Chi_Minh',
  };
  
  switch (format) {
    case 'short':
      options.day = '2-digit';
      options.month = '2-digit';
      options.year = 'numeric';
      break;
    case 'long':
      options.day = 'numeric';
      options.month = 'long';
      options.year = 'numeric';
      break;
    case 'time':
      options.hour = '2-digit';
      options.minute = '2-digit';
      options.hour12 = false;
      break;
  }
  
  return dateObj.toLocaleDateString('vi-VN', options);
};

export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  return dateObj.toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

export const formatCurrency = (amount: number, currency: string = 'VND'): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatNumber = (number: number): string => {
  return new Intl.NumberFormat('vi-VN').format(number);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatPhone = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format Vietnamese phone number
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  } else if (cleaned.length === 11 && cleaned.startsWith('84')) {
    return '+84 ' + cleaned.slice(2).replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
  }
  
  return phone;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const capitalizeFirst = (text: string): string => {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const formatName = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`.trim();
};

// BMI calculation and formatting
export const calculateBMI = (height: number, weight: number): number => {
  if (height <= 0 || weight <= 0) return 0;
  // Convert height from cm to meters
  const heightInMeters = height / 100;
  return Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
};

export const getBMICategory = (bmi: number): { category: string; color: string; description: string } => {
  if (bmi < 18.5) {
    return {
      category: "Thiếu cân",
      color: "text-blue-600",
      description: "BMI dưới 18.5"
    };
  } else if (bmi >= 18.5 && bmi < 25) {
    return {
      category: "Bình thường",
      color: "text-green-600",
      description: "BMI 18.5 - 24.9"
    };
  } else if (bmi >= 25 && bmi < 30) {
    return {
      category: "Thừa cân",
      color: "text-yellow-600",
      description: "BMI 25.0 - 29.9"
    };
  } else {
    return {
      category: "Béo phì",
      color: "text-red-600",
      description: "BMI từ 30.0 trở lên"
    };
  }
};

// Authentication utilities
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const token = localStorage.getItem('auth_token');
    if (!token) return false;
    
    // Basic token validation - in real app, you might want to decode and check expiry
    return token.length > 0;
  } catch (error) {
    // Error checking authentication
    return false;
  }
};

export const getUserId = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const parsed = JSON.parse(userData);
      return parsed.id || null;
    }
    return null;
  } catch (error) {
    // Error getting user ID
    return null;
  }
};
