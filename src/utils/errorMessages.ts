/**
 * Utility to map common English error messages to Vietnamese
 */
export function getVietnameseErrorMessage(apiMessage: string, defaultMessage: string): string {
  if (!apiMessage) return defaultMessage;

  const lowerMessage = apiMessage.toLowerCase();

  // Authentication errors
  if (lowerMessage.includes('invalid email or password') || 
      lowerMessage.includes('invalid credentials') ||
      lowerMessage.includes('unauthorized')) {
    return 'Email hoặc mật khẩu không đúng. Vui lòng thử lại.';
  }
  
  if (lowerMessage.includes('account not found') ||
      lowerMessage.includes('user not found')) {
    return 'Tài khoản không tồn tại. Vui lòng kiểm tra email.';
  }
  
  if (lowerMessage.includes('account not verified') ||
      lowerMessage.includes('email not verified')) {
    return 'Tài khoản chưa được xác thực. Vui lòng kiểm tra email.';
  }
  
  if (lowerMessage.includes('account locked') || 
      lowerMessage.includes('account blocked') ||
      lowerMessage.includes('account disabled')) {
    return 'Tài khoản đã bị khóa. Vui lòng liên hệ hỗ trợ.';
  }

  // Registration errors
  if (lowerMessage.includes('email already exists') ||
      lowerMessage.includes('user already exists')) {
    return 'Email đã được sử dụng. Vui lòng chọn email khác.';
  }

  if (lowerMessage.includes('weak password') ||
      lowerMessage.includes('password too short')) {
    return 'Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn.';
  }

  // OTP errors
  if (lowerMessage.includes('invalid otp') ||
      lowerMessage.includes('wrong otp')) {
    return 'Mã OTP không đúng. Vui lòng kiểm tra lại.';
  }

  if (lowerMessage.includes('otp expired') ||
      lowerMessage.includes('expired otp')) {
    return 'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.';
  }

  // Network errors
  if (lowerMessage.includes('network error') ||
      lowerMessage.includes('connection failed')) {
    return 'Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại.';
  }

  if (lowerMessage.includes('server error') ||
      lowerMessage.includes('internal server error')) {
    return 'Lỗi máy chủ. Vui lòng thử lại sau.';
  }

  // If message doesn't contain English letters, assume it's already Vietnamese
  if (!apiMessage.match(/[a-zA-Z]/)) {
    return apiMessage;
  }

  // Return default message for unknown errors
  return defaultMessage;
}

/**
 * Specific error message mappers for different contexts
 */
export const ERROR_MESSAGES = {
  LOGIN: {
    DEFAULT: 'Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.',
    VALIDATION: 'Vui lòng nhập đầy đủ email và mật khẩu.',
  },
  REGISTER: {
    DEFAULT: 'Đăng ký thất bại. Vui lòng thử lại.',
    VALIDATION: 'Vui lòng nhập đầy đủ thông tin bắt buộc.',
  },
  OTP: {
    DEFAULT: 'Xác thực thất bại. Vui lòng kiểm tra mã OTP.',
    VALIDATION: 'Vui lòng nhập đầy đủ mã OTP.',
  },
  FORGOT_PASSWORD: {
    DEFAULT: 'Gửi yêu cầu thất bại. Vui lòng thử lại.',
    VALIDATION: 'Vui lòng nhập email hợp lệ.',
  },
  NETWORK: {
    DEFAULT: 'Lỗi kết nối. Vui lòng kiểm tra internet và thử lại.',
  },
} as const;
