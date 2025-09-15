import { useState } from 'react';
import { CertificationApi, type Certification, type AddCertificationRequest, type UpdateCertificationRequest } from '@/lib/api/certification';
import type { MessageResponse } from '@/lib/api/types';

export const useCertification = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add certification
  const addCertification = async (userId: string, certData: AddCertificationRequest): Promise<Certification | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response: MessageResponse<Certification> = await CertificationApi.add(userId, certData);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.message || 'Có lỗi xảy ra khi thêm chứng chỉ');
        return null;
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi thêm chứng chỉ';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update certification
  const updateCertification = async (userId: string, certificationId: string, certData: UpdateCertificationRequest): Promise<Certification | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response: MessageResponse<Certification> = await CertificationApi.update(userId, certificationId, certData);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.message || 'Có lỗi xảy ra khi cập nhật chứng chỉ');
        return null;
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi cập nhật chứng chỉ';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete certification
  const deleteCertification = async (userId: string, certificationId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response: MessageResponse<string> = await CertificationApi.delete(userId, certificationId);
      
      if (response.success) {
        return true;
      } else {
        setError(response.message || 'Có lỗi xảy ra khi xóa chứng chỉ');
        return false;
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi xóa chứng chỉ';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Get certifications list
  const getCertifications = async (userId: string): Promise<Certification[] | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response: MessageResponse<Certification[]> = await CertificationApi.getList(userId);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.message || 'Có lỗi xảy ra khi tải danh sách chứng chỉ');
        return null;
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi tải danh sách chứng chỉ';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Batch update certifications
  const batchUpdateCertifications = async (doctorId: string, certifications: Certification[]): Promise<Certification[] | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await CertificationApi.batchUpdate(doctorId, { certifications });
      
      if (response.success && response.data?.certifications) {
        return response.data.certifications;
      } else {
        setError(response.message || 'Có lỗi xảy ra khi cập nhật danh sách chứng chỉ');
        return null;
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi cập nhật danh sách chứng chỉ';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addCertification,
    updateCertification,
    deleteCertification,
    getCertifications,
    batchUpdateCertifications,
    isLoading,
    error,
  };
};
