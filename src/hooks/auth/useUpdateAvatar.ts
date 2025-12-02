import { useState } from 'react';
import { UsersApi } from '@/lib/api/user/users';

interface UseUpdateAvatarReturn {
  updateAvatar: (userId: string, file: File) => Promise<string | null>;
  isLoading: boolean;
  error: string | null;
  progress: number;
}

export const useUpdateAvatar = (): UseUpdateAvatarReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const updateAvatar = async (userId: string, file: File): Promise<string | null> => {
    if (!userId) {
      setError('Không tìm thấy ID người dùng');
      return null;
    }

    if (!file) {
      setError('Không có file được chọn');
      return null;
    }

    // Validate file size (10MB limit as per backend)
    if (file.size > 10 * 1024 * 1024) {
      setError('Kích thước file không được vượt quá 10MB');
      return null;
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      setError('Chỉ chấp nhận file hình ảnh (JPEG, PNG, GIF, WebP)');
      return null;
    }

    // Validate filename for unsafe characters
    // eslint-disable-next-line no-control-regex
    const unsafeChars = /[<>:"/\\|?*\x00-\x1f]/;
    if (unsafeChars.test(file.name)) {
      setError('Tên file chứa ký tự không được phép');
      return null;
    }

    setIsLoading(true);
    setError(null);
    setProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);

      const result = await UsersApi.updateAvatar(userId, file);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (result && result.data) {
        return result.data; // Return the avatar URL
      } else {
        setError('Không thể cập nhật avatar');
        return null;
      }
    } catch (err: unknown) {
      // Avatar upload error
      
      let errorMessage = 'Có lỗi xảy ra khi upload avatar';
      
      if (err && typeof err === 'object' && 'response' in err) {
        const errorResponse = err as { response?: { data?: { message?: string } } };
        if (errorResponse.response?.data?.message) {
          errorMessage = errorResponse.response.data.message;
        }
      } else if (err && typeof err === 'object' && 'message' in err) {
        const errorWithMessage = err as { message: string };
        errorMessage = errorWithMessage.message;
      }
      
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  return {
    updateAvatar,
    isLoading,
    error,
    progress
  };
};
