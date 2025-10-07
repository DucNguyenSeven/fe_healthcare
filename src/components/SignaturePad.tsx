'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Trash2, Save, Check, FileText } from 'lucide-react';
import { UsersApi } from '@/lib/api/user/users';
import { useGetMe } from '@/hooks/auth/useGetMe';
import { toast } from 'sonner';

interface SignaturePadProps {
  onSignatureSaved: (url: string) => void;
  disabled?: boolean;
  initialSignatureUrl?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  onSignatureSaved,
  disabled = false,
  initialSignatureUrl,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [isSaved, setIsSaved] = useState(!!initialSignatureUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(initialSignatureUrl || null);
  
  const { data: me } = useGetMe();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = 200;

    // Set drawing style
    context.strokeStyle = '#0F172A';
    context.lineWidth = 2;
    context.lineCap = 'round';
    context.lineJoin = 'round';
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (disabled || isSaved) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    setIsDrawing(true);
    setHasDrawn(true);

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.nativeEvent.offsetX;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.nativeEvent.offsetY;

    context.beginPath();
    context.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || disabled || isSaved) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.nativeEvent.offsetX;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.nativeEvent.offsetY;

    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setIsSaved(false);
    setSignatureUrl(null);
  };

  const saveSignature = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!hasDrawn) {
      toast.error('Vui lòng vẽ chữ ký trước khi lưu');
      return;
    }

    if (!me?.userId) {
      toast.error('Không tìm thấy thông tin người dùng');
      return;
    }

    setIsUploading(true);

    try {
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        }, 'image/png');
      });

      // Create File from blob
      const file = new File([blob], `signature-${Date.now()}.png`, { type: 'image/png' });

      // Upload using updateAvatar API
      const response = await UsersApi.updateAvatar(me.userId, file);

      if (response && response.data) {
        const uploadedUrl = response.data;  // String URL, not array
        setSignatureUrl(uploadedUrl);
        setIsSaved(true);
        onSignatureSaved(uploadedUrl);
        toast.success('Đã lưu chữ ký thành công');
      } else {
        throw new Error('No image URL returned from upload');
      }
    } catch (error) {
      console.error('Error uploading signature:', error);
      toast.error('Không thể upload chữ ký. Vui lòng thử lại');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_10px_24px_rgba(16,24,40,0.08)] p-8 mt-6">
      <h4 className="font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-blue-600" />
        Chữ ký xác nhận
        <span className="text-red-500">*</span>
      </h4>

      <div className="space-y-4">
        {/* Canvas */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className={`w-full border-2 rounded-xl bg-white ${
              isSaved ? 'border-green-300 bg-green-50' : 'border-gray-200'
            } ${disabled || isSaved ? 'cursor-not-allowed' : 'cursor-crosshair'}`}
            style={{ touchAction: 'none', height: '200px' }}
          />
          {!hasDrawn && !isSaved && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-gray-400 text-sm">Vẽ chữ ký của bạn tại đây</p>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={clearCanvas}
            disabled={disabled || !hasDrawn || isUploading}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
          >
            <Trash2 className="w-4 h-4" />
            Xóa
          </button>
          <button
            type="button"
            onClick={saveSignature}
            disabled={disabled || !hasDrawn || isSaved || isUploading}
            className="flex-1 px-4 py-3 bg-[#1E75FF] text-white rounded-xl hover:bg-[#1659C9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Lưu chữ ký
              </>
            )}
          </button>
        </div>

        {/* Success indicator */}
        {isSaved && signatureUrl && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-700">Đã ký xác nhận thành công</span>
          </div>
        )}
      </div>
    </div>
  );
};
