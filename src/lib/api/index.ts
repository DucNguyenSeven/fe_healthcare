// Export tất cả API modules để dễ dàng import
export { AuthAPI } from './user/auth';
export { UsersApi } from './user/users';
export { UploadApi } from './user/upload';
export { ChatApi } from './chat';
export { RecordApi } from './record';
export { NotificationApi } from './notification';
export { ScheduleApi } from './schedule';
export { CommunicationApi } from './communication';

// Export utilities
export { parseApiError } from './errors';
export { 
  getAccessToken, 
  setAccessToken, 
  getRefreshToken, 
  setRefreshToken, 
  clearTokens 
} from './token';

// Export types
export type * from './types';
