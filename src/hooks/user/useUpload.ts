import { useState } from 'react';
import { UploadApi, parseApiError } from '@/lib/api';
import type { UploadFile } from '@/lib/api';

interface UseUploadReturn {
  uploadSingle: (file: File) => Promise<UploadFile>;
  uploadMultiple: (files: File[]) => Promise<UploadFile[]>;
  uploadAvatar: (file: File) => Promise<UploadFile>;
  uploadDocument: (file: File, type?: string) => Promise<UploadFile>;
  deleteFile: (publicId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  progress: number;
}

export const useUpload = (): UseUploadReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const uploadSingle = async (file: File): Promise<UploadFile> => {
    setLoading(true);
    setError(null);
    setProgress(0);
    try {
      const response = await UploadApi.single(file);
      if (response.data) {
        setProgress(100);
        return response.data;
      }
      throw new Error(response.message || 'Upload thất bại');
    } catch (e) {
      const parsed = parseApiError(e);
      setError(parsed.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const uploadMultiple = async (files: File[]): Promise<UploadFile[]> => {
    setLoading(true);
    setError(null);
    setProgress(0);
    try {
      const response = await UploadApi.multiple(files);
      if (response.data) {
        setProgress(100);
        return response.data;
      }
      throw new Error(response.message || 'Upload thất bại');
    } catch (e) {
      const parsed = parseApiError(e);
      setError(parsed.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (file: File): Promise<UploadFile> => {
    setLoading(true);
    setError(null);
    setProgress(0);
    try {
      const response = await UploadApi.avatar(file);
      // avatar API returns UploadFile directly, not wrapped in MessageResponse
      if (response) {
        setProgress(100);
        return response;
      }
      throw new Error('Upload avatar thất bại');
    } catch (e) {
      const parsed = parseApiError(e);
      setError(parsed.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (file: File, type?: string): Promise<UploadFile> => {
    setLoading(true);
    setError(null);
    setProgress(0);
    try {
      const response = await UploadApi.document(file, type);
      if (response.data) {
        setProgress(100);
        return response.data;
      }
      throw new Error(response.message || 'Upload tài liệu thất bại');
    } catch (e) {
      const parsed = parseApiError(e);
      setError(parsed.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async (publicId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await UploadApi.delete(publicId);
    } catch (e) {
      const parsed = parseApiError(e);
      setError(parsed.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { 
    uploadSingle, 
    uploadMultiple, 
    uploadAvatar, 
    uploadDocument, 
    deleteFile, 
    loading, 
    error, 
    progress 
  };
};
