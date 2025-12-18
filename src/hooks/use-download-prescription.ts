import { useState } from 'react';
import { toast } from 'sonner';
import { downloadPrescriptionPDF } from '@/lib/api/prescriptions';

interface UseDownloadPrescriptionResult {
  downloadPDF: (recordId: string, fileName?: string) => Promise<void>;
  isDownloading: (recordId: string) => boolean;
}

/**
 * Hook để download đơn thuốc PDF
 * Xử lý: loading state per recordId, error handling, toast notifications
 */
export const useDownloadPrescription = (): UseDownloadPrescriptionResult => {
  const [downloadingRecords, setDownloadingRecords] = useState<Set<string>>(new Set());

  const downloadPDF = async (recordId: string, fileName?: string) => {
    // Add recordId to downloading set
    setDownloadingRecords(prev => new Set(prev).add(recordId));

    try {
      // Gọi API - nhận cả blob và filename từ Content-Disposition header
      const { blob, filename: serverFilename } = await downloadPrescriptionPDF(recordId);

      // Tạo URL object từ blob
      const url = window.URL.createObjectURL(blob);

      // Tạo thẻ <a> để trigger download
      const link = document.createElement('a');
      link.href = url;
      // Ưu tiên: custom fileName > filename từ server header > fallback
      link.download = fileName || serverFilename;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Success notification
      toast.success('Tải đơn thuốc thành công!', {
        description: 'File PDF đã được tải về máy của bạn',
        duration: 3000,
      });
    } catch (error: any) {
      console.error('Error downloading prescription PDF:', error);

      // Error notification
      toast.error('Không thể tải đơn thuốc', {
        description: error.response?.data?.message || 'Vui lòng thử lại sau',
        duration: 4000,
      });
    } finally {
      // Remove recordId from downloading set
      setDownloadingRecords(prev => {
        const newSet = new Set(prev);
        newSet.delete(recordId);
        return newSet;
      });
    }
  };

  const isDownloading = (recordId: string) => {
    return downloadingRecords.has(recordId);
  };

  return { downloadPDF, isDownloading };
};
