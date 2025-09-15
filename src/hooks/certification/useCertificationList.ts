import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CertificationApi, type Certification, type AddCertificationRequest, type UpdateCertificationRequest } from '@/lib/api/certification';
import type { MessageResponse } from '@/lib/api/types';

const CERTIFICATION_QUERY_KEY = 'certifications';

export const useCertificationList = (userId: string): {
  certifications: Certification[];
  isLoading: boolean;
  isAdding: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isBatchUpdating: boolean;
  error: string | null;
  addError: string | null;
  updateError: string | null;
  deleteError: string | null;
  batchUpdateError: string | null;
  addCertification: (certData: AddCertificationRequest) => void;
  updateCertification: (params: { certificationId: string; certData: UpdateCertificationRequest }) => void;
  deleteCertification: (certificationId: string) => void;
  batchUpdateCertifications: (certifications: Certification[]) => void;
  refetch: () => void;
  resetAddError: () => void;
  resetUpdateError: () => void;
  resetDeleteError: () => void;
  resetBatchUpdateError: () => void;
} => {
  const queryClient = useQueryClient();

  // Get certifications query
  const {
    data: certifications,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [CERTIFICATION_QUERY_KEY, userId],
    queryFn: async (): Promise<Certification[]> => {
      const response: MessageResponse<Certification[]> = await CertificationApi.getList(userId);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Có lỗi xảy ra khi tải danh sách chứng chỉ');
      }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in React Query v5)
  });

  // Add certification mutation
  const addCertificationMutation = useMutation({
    mutationFn: async (certData: AddCertificationRequest): Promise<Certification> => {
      const response: MessageResponse<Certification> = await CertificationApi.add(userId, certData);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Có lỗi xảy ra khi thêm chứng chỉ');
      }
    },
    onSuccess: (newCertification) => {
      // Update the cache with new certification
      queryClient.setQueryData([CERTIFICATION_QUERY_KEY, userId], (oldData: Certification[] | undefined) => {
        return oldData ? [...oldData, newCertification] : [newCertification];
      });
    },
  });

  // Update certification mutation
  const updateCertificationMutation = useMutation({
    mutationFn: async ({ certificationId, certData }: { certificationId: string; certData: UpdateCertificationRequest }): Promise<Certification> => {
      const response: MessageResponse<Certification> = await CertificationApi.update(userId, certificationId, certData);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Có lỗi xảy ra khi cập nhật chứng chỉ');
      }
    },
    onSuccess: (updatedCertification) => {
      // Update the cache with updated certification
      queryClient.setQueryData([CERTIFICATION_QUERY_KEY, userId], (oldData: Certification[] | undefined) => {
        return oldData?.map(cert => 
          cert.id === updatedCertification.id ? updatedCertification : cert
        ) || [];
      });
    },
  });

  // Delete certification mutation
  const deleteCertificationMutation = useMutation({
    mutationFn: async (certificationId: string): Promise<string> => {
      const response: MessageResponse<string> = await CertificationApi.delete(userId, certificationId);
      
      if (response.success) {
        return certificationId;
      } else {
        throw new Error(response.message || 'Có lỗi xảy ra khi xóa chứng chỉ');
      }
    },
    onSuccess: (deletedCertificationId) => {
      // Remove the certification from cache
      queryClient.setQueryData([CERTIFICATION_QUERY_KEY, userId], (oldData: Certification[] | undefined) => {
        return oldData?.filter(cert => cert.id !== deletedCertificationId) || [];
      });
    },
  });

  // Batch update certifications mutation
  const batchUpdateCertificationsMutation = useMutation({
    mutationFn: async (certifications: Certification[]): Promise<Certification[]> => {
      const response = await CertificationApi.batchUpdate(userId, { certifications });
      
      if (response.success && response.data?.certifications) {
        return response.data.certifications;
      } else {
        throw new Error(response.message || 'Có lỗi xảy ra khi cập nhật danh sách chứng chỉ');
      }
    },
    onSuccess: (updatedCertifications) => {
      // Replace the entire cache with updated certifications
      queryClient.setQueryData([CERTIFICATION_QUERY_KEY, userId], updatedCertifications);
    },
  });

  return {
    // Data
    certifications: certifications || [],
    
    // Loading states
    isLoading,
    isAdding: addCertificationMutation.isPending,
    isUpdating: updateCertificationMutation.isPending,
    isDeleting: deleteCertificationMutation.isPending,
    isBatchUpdating: batchUpdateCertificationsMutation.isPending,
    
    // Error states
    error: error?.message || null,
    addError: addCertificationMutation.error?.message || null,
    updateError: updateCertificationMutation.error?.message || null,
    deleteError: deleteCertificationMutation.error?.message || null,
    batchUpdateError: batchUpdateCertificationsMutation.error?.message || null,
    
    // Actions
    addCertification: addCertificationMutation.mutate,
    updateCertification: updateCertificationMutation.mutate,
    deleteCertification: deleteCertificationMutation.mutate,
    batchUpdateCertifications: batchUpdateCertificationsMutation.mutate,
    refetch,
    
    // Reset functions
    resetAddError: addCertificationMutation.reset,
    resetUpdateError: updateCertificationMutation.reset,
    resetDeleteError: deleteCertificationMutation.reset,
    resetBatchUpdateError: batchUpdateCertificationsMutation.reset,
  };
};
